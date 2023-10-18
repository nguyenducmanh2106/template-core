using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class SuppliesGroupHandler : ISuppliesGroupHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SuppliesGroupHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(SuppliesGroupModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                model.Id = Guid.NewGuid();
                var suppliesGroup = _mapper.Map<SysSuppliesGroup>(model);
                suppliesGroup.Name = suppliesGroup.Name.Trim();
                suppliesGroup.Code = suppliesGroup.Code?.Trim();
                suppliesGroup.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysSuppliesGroup>().Insert(suppliesGroup);

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
                var dataEntitiesInDb = unitOfWork.Repository<SysSuppliesGroup>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                var isExistSuppliesKindDepent = unitOfWork.Repository<SysSuppliesKind>().GetQueryable(item => ids.Contains(item.SuppliesGroupId.ToString())).Any();
                if (isExistSuppliesKindDepent)
                    return new ResponseDataError(Code.BadRequest, "Không xóa được do nhóm vật tư có loại vật tư.");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysSuppliesGroup>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(SuppliesGroupSearch model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSuppliesGroup>().GetQueryable(item => true);
                if (!string.IsNullOrEmpty(model.Code))
                    dataEntityInDb = dataEntityInDb.Where(item => !string.IsNullOrEmpty(item.Code) && EF.Functions.Like(item.Code, $"%{model.Code}%"));

                if (!string.IsNullOrEmpty(model.Name))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));

                if (model.IsActive != null)
                    dataEntityInDb = dataEntityInDb.Where(item => item.IsActive == model.IsActive);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysSuppliesGroup>>(_mapper.Map<IEnumerable<SysSuppliesGroup>>(dataEntityInDb.ToList()));
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
                var stockEntityInDb = unitOfWork.Repository<SysSuppliesGroup>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysSuppliesGroup>(_mapper.Map<SysSuppliesGroup>(stockEntityInDb));
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(SuppliesGroupModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSuppliesGroup>().GetById(model.Id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.Code != model.Code)
                {
                    if (IsCodeExist(model.Code))
                        return new ResponseDataError(Code.BadRequest, "Mã đã tồn tại");
                }

                if (dataEntityInDb.Name != model.Name)
                {
                    if (IsNameExist(model.Name))
                        return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");
                }

                dataEntityInDb.Name = model.Name.Trim();
                dataEntityInDb.Code = model.Code?.Trim();
                dataEntityInDb.IsActive = model.IsActive;
                dataEntityInDb.Note = model.Note?.Trim();
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysSuppliesGroup>().Update(dataEntityInDb);
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
            return unitOfWork.Repository<SysSuppliesGroup>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }

        private bool IsCodeExist(string? code)
        {
            if (!string.IsNullOrWhiteSpace(code))
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                return unitOfWork.Repository<SysSuppliesGroup>().Get(item => EF.Functions.Collate(item.Code, Constant.SQL_COLLATION_CASE_SENSITIVE) == code.Trim()).Any();
            }

            return false;
        }
    }
}
