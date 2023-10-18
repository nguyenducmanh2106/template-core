using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class SuppliesCategoryHandler : ISuppliesCategoryHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SuppliesCategoryHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(SuppliesCategoryModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                model.Id = Guid.NewGuid();
                var sysSuppliesCategory = _mapper.Map<SysSuppliesCategory>(model);
                sysSuppliesCategory.Name = sysSuppliesCategory.Name.Trim();
                sysSuppliesCategory.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysSuppliesCategory>().Insert(sysSuppliesCategory);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(IEnumerable<string> ids)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntitiesInDb = unitOfWork.Repository<SysSuppliesCategory>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                var isExistSuppliesKindDepent = unitOfWork.Repository<SysSuppliesKind>().GetQueryable(item => ids.Contains(item.SuppliesCategoryId.ToString())).Any();
                if (isExistSuppliesKindDepent)
                    return new ResponseDataError(Code.BadRequest, "Không xóa được do danh mục vật tư có loại vật tư.");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysSuppliesCategory>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(SuppliesCategorySearch model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSuppliesCategory>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Name))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));

                if (model.SuppliesSerialStatus.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SuppliesSerialStatus == model.SuppliesSerialStatus);

                if (model.IsActive.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.IsActive == model.IsActive);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysSuppliesCategory>>(_mapper.Map<IEnumerable<SysSuppliesCategory>>(dataEntityInDb.ToList()));
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
                var stockEntityInDb = unitOfWork.Repository<SysSuppliesCategory>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysSuppliesCategory>(_mapper.Map<SysSuppliesCategory>(stockEntityInDb));
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(SuppliesCategoryModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSuppliesCategory>().GetById(model.Id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.Name != model.Name)
                {
                    if (IsNameExist(model.Name))
                        return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");
                }

                dataEntityInDb.Name = model.Name.Trim();
                dataEntityInDb.SuppliesSerialStatus = model.SuppliesSerialStatus;
                dataEntityInDb.IsActive = model.IsActive;
                dataEntityInDb.Note = model.Note?.Trim();
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysSuppliesCategory>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private bool IsNameExist(string name)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            return unitOfWork.Repository<SysSuppliesCategory>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }
    }
}
