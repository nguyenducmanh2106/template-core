using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Newtonsoft.Json;
using Serilog;
using System.Collections.Generic;

namespace Backend.Business.PricingCategory;

public class PricingCategoryHandler : IPricingCategoryHandler
{
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PricingCategoryHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
    {
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public ResponseData Create(PricingCategoryModel model)
    {
        try
        {
            using UnitOfWork unitOfWork = new(_httpContextAccessor);
            model.Id = Guid.NewGuid();

            unitOfWork.Repository<SysPricingCategory>().Insert(_mapper.Map<SysPricingCategory>(model));
            unitOfWork.Save();
            return new ResponseData(Code.Success, "");
        }
        catch (Exception exception)
        {
            Log.Error(exception, exception.Message);
            return new ResponseDataError(Code.ServerError, exception.Message);
        }
    }

    public ResponseData Delete(Guid id)
    {
        try
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var iigDepartmentData = unitOfWork.Repository<SysPricingCategory>().GetById(id);
            if (iigDepartmentData == null)
            {
                return new ResponseDataError(Code.NotFound, "Id not found");
            }
            unitOfWork.Repository<SysPricingCategory>().Delete(iigDepartmentData);
            unitOfWork.Save();
            return new ResponseData(Code.Success, "Xóa thành công");
        }
        catch (Exception exception)
        {
            Log.Error(exception, exception.Message);
            return new ResponseDataError(Code.ServerError, exception.Message);
        }
    }

    public ResponseData Get(string filter)
    {
        try
        {
            int pageNumber = 0;
            int pageSize = 20;
            int totalCount = 0;
            var filterModel = JsonConvert.DeserializeObject<RequestData>(filter);
            if (filterModel == null)
                return new ResponseDataError(Code.BadRequest, "Filter invalid");
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var iigDepartmentData = unitOfWork.Repository<SysPricingCategory>().Get();
            if (!string.IsNullOrEmpty(filterModel.TextSearch))
                iigDepartmentData = iigDepartmentData.Where(x => x.Name.ToLower().Contains(filterModel.TextSearch.ToLower()));
            totalCount = iigDepartmentData.Count();
            if (filterModel.Page.HasValue && filterModel.Size.HasValue)
            {
                iigDepartmentData = iigDepartmentData.OrderBy(g => g.CreatedOnDate).Skip((filterModel.Page.Value - 1) * filterModel.Size.Value).Take(filterModel.Size.Value);
                pageNumber = filterModel.Page.Value;
                pageSize = filterModel.Size.Value;
            }

            List<PricingCategoryModel> result = new List<PricingCategoryModel>();
            foreach (var item in iigDepartmentData)
            {
                var modelMapping = _mapper.Map<PricingCategoryModel>(item);
                modelMapping.ProductName = modelMapping.ProductId.HasValue ? unitOfWork.Repository<SysProduct>().GetById(modelMapping.ProductId.Value)?.Name : string.Empty;
                modelMapping.PricingDecisionName = modelMapping.PricingDecisionId.HasValue ? unitOfWork.Repository<SysPricingDecision>().GetById(modelMapping.PricingDecisionId.Value)?.Name : string.Empty;
                result.Add(modelMapping);
            }

            var pagination = new Pagination()
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPage = (int)Math.Ceiling((decimal)totalCount / pageSize)
            };
            return new PageableData<List<PricingCategoryModel>>(result, pagination, Code.Success, "");
        }
        catch (Exception exception)
        {
            Log.Error(exception, exception.Message);
            return new ResponseDataError(Code.ServerError, exception.Message);
        }
    }

    public ResponseData GetById(Guid id)
    {
        try
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var iigDepartmentData = unitOfWork.Repository<SysPricingCategory>().GetById(id);
            if (iigDepartmentData == null)
            {
                return new ResponseDataError(Code.NotFound, "Id not found");
            }
            var result = _mapper.Map<PricingCategoryModel>(iigDepartmentData);
            return new ResponseDataObject<PricingCategoryModel>(result, Code.Success, "");
        }
        catch (Exception exception)
        {
            Log.Error(exception, exception.Message);
            return new ResponseDataError(Code.ServerError, exception.Message);
        }
    }

    public ResponseData Update(Guid id, PricingCategoryModel model)
    {
        try
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var iigDepartmentData = unitOfWork.Repository<SysPricingCategory>().GetById(id);
            if (iigDepartmentData == null)
            {
                return new ResponseDataError(Code.NotFound, "Id not found");
            }

            if (!string.IsNullOrEmpty(model.Name))
                iigDepartmentData.Name = model.Name;

            if (!string.IsNullOrEmpty(model.Description))
                iigDepartmentData.Description = model.Description;
            iigDepartmentData.PricingDecisionId = model.PricingDecisionId;
            iigDepartmentData.ProductId = model.ProductId;

            unitOfWork.Repository<SysPricingCategory>().Update(iigDepartmentData);

            unitOfWork.Save();
            return new ResponseData(Code.Success, "");
        }
        catch (Exception exception)
        {
            Log.Error(exception, exception.Message);
            return new ResponseDataError(Code.ServerError, exception.Message);
        }
    }
}