using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Minio.DataModel;
using Serilog;

namespace Backend.Business
{
    public class CustomerHandler : ICustomerHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CustomerHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(CustomerModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsCodeExist(model.Code))
                    return new ResponseDataError(Code.BadRequest, "Mã đã tồn tại");

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                model.Id = Guid.NewGuid();
                var sysCustomer = _mapper.Map<SysCustomer>(model);
                sysCustomer.Code = sysCustomer.Code.Trim();
                sysCustomer.Name = sysCustomer.Name.Trim();
                sysCustomer.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysCustomer>().Insert(sysCustomer);

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
                var dataEntitiesInDb = unitOfWork.Repository<SysCustomer>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysCustomer>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(CustomerSearch model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysCustomer>().GetQueryable(item => true);
                if (!string.IsNullOrEmpty(model.Code))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Code, $"%{model.Code}%"));

                if (!string.IsNullOrEmpty(model.Name))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));

                if (model.IsActive != null)
                    dataEntityInDb = dataEntityInDb.Where(item => item.IsActive == model.IsActive);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysCustomer>>(_mapper.Map<IEnumerable<SysCustomer>>(dataEntityInDb.ToList()));
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
                var stockEntityInDb = unitOfWork.Repository<SysCustomer>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysCustomer>(_mapper.Map<SysCustomer>(stockEntityInDb));
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(CustomerModel model)
        {
            try
            {
                model.Code = model.Code.Trim();
                model.Name = model.Name.Trim();
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysCustomer>().GetById(model.Id);
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

                dataEntityInDb.Code = model.Code.Trim();
                dataEntityInDb.Name = model.Name.Trim();
                dataEntityInDb.IsActive = model.IsActive;
                dataEntityInDb.Note = model.Note?.Trim();
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysCustomer>().Update(dataEntityInDb);
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
            return unitOfWork.Repository<SysCustomer>().Get(item => EF.Functions.Collate(item.Code, Constant.SQL_COLLATION_CASE_SENSITIVE) == code.Trim()).Any();
        }

        private bool IsNameExist(string name)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            return unitOfWork.Repository<SysCustomer>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }
    }
}
