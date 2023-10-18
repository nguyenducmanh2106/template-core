using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class SuppliesHandler : ISuppliesHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SuppliesHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(SuppliesModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsCodeExist(model.Code))
                    return new ResponseDataError(Code.BadRequest, "Mã đã tồn tại");

                model.Id = Guid.NewGuid();
                var sysSupplies = _mapper.Map<SysSupplies>(model);
                sysSupplies.Code = sysSupplies.Code.Trim();
                sysSupplies.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysSupplies>().Insert(sysSupplies);

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
                var dataEntitiesInDb = unitOfWork.Repository<SysSupplies>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysSupplies>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(SuppliesSearch model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSupplies>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Code))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Code, $"%{model.Code}%"));

                if (model.SuppliesGroupId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SuppliesGroupId == model.SuppliesGroupId);

                if (model.SuppliesKindId.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.SuppliesKindId == model.SuppliesKindId);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysSupplies>>(_mapper.Map<IEnumerable<SysSupplies>>(dataEntityInDb.ToList()));
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
                var stockEntityInDb = unitOfWork.Repository<SysSupplies>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysSupplies>(_mapper.Map<SysSupplies>(stockEntityInDb));
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(SuppliesModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysSupplies>().GetById(model.Id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.Code != model.Code)
                {
                    if (IsCodeExist(model.Code))
                        return new ResponseDataError(Code.BadRequest, "Mã đã tồn tại");
                }

                dataEntityInDb.Code = model.Code.Trim();
                dataEntityInDb.SuppliesGroupId = model.SuppliesGroupId;
                dataEntityInDb.SuppliesKindId = model.SuppliesKindId;
                dataEntityInDb.ExpiryDate = model.ExpiryDate;
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysSupplies>().Update(dataEntityInDb);
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
            return unitOfWork.Repository<SysSupplies>().Get(item => EF.Functions.Collate(item.Code, Constant.SQL_COLLATION_CASE_SENSITIVE) == code.Trim()).Any();
        }
    }
}
