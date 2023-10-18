using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class SuppliesKindHandler : ISuppliesKindHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SuppliesKindHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(SuppliesKindModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                model.Id = Guid.NewGuid();
                var sysSuppliesKind = _mapper.Map<SysSuppliesKind>(model);
                sysSuppliesKind.Name = sysSuppliesKind.Name.Trim();
                sysSuppliesKind.Code = sysSuppliesKind.Code.Trim();
                sysSuppliesKind.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysSuppliesKind>().Insert(sysSuppliesKind);

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
                var dataEntitiesInDb = unitOfWork.Repository<SysSuppliesKind>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                var isExistSuppliesDepent = unitOfWork.Repository<SysSupplies>().GetQueryable(item => ids.Contains(item.SuppliesKindId.ToString())).Any();
                if(isExistSuppliesDepent)
                    return new ResponseDataError(Code.BadRequest, "Không xóa được do loại vật tư có chứa vật tư.");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysSuppliesKind>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(SuppliesKindSearch model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSuppliesKind>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Name))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));

                if (model.SuppliesCategoryId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SuppliesCategoryId == model.SuppliesCategoryId);

                if (model.SuppliesGroupId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SuppliesGroupId == model.SuppliesGroupId);

                if (model.IsActive.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.IsActive == model.IsActive);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysSuppliesKind>>(_mapper.Map<IEnumerable<SysSuppliesKind>>(dataEntityInDb.ToList()));
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
                var stockEntityInDb = unitOfWork.Repository<SysSuppliesKind>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysSuppliesKind>(_mapper.Map<SysSuppliesKind>(stockEntityInDb));
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(SuppliesKindModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSuppliesKind>().GetById(model.Id);
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
                dataEntityInDb.Code = model.Code.Trim();
                dataEntityInDb.SuppliesGroupId = model.SuppliesGroupId;
                dataEntityInDb.SuppliesCategoryId = model.SuppliesCategoryId;
                dataEntityInDb.IsActive = model.IsActive;
                dataEntityInDb.Note = model.Note?.Trim();
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysSuppliesKind>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private bool IsCodeExist(string code)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            return unitOfWork.Repository<SysSuppliesKind>().Get(item => EF.Functions.Collate(item.Code, Constant.SQL_COLLATION_CASE_SENSITIVE) == code.Trim()).Any();
        }

        private bool IsNameExist(string name)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            return unitOfWork.Repository<SysSuppliesKind>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }
    }
}
