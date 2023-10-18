using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class StockListHandler : IStockListHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public StockListHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(StockListModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsCodeExist(model.Code))
                    return new ResponseDataError(Code.BadRequest, "Mã đã tồn tại");

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                model.Id = Guid.NewGuid();
                var sysStockList = _mapper.Map<SysStockList>(model);
                sysStockList.Code = sysStockList.Code.Trim();
                sysStockList.Name = sysStockList.Name.Trim();
                sysStockList.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysStockList>().Insert(sysStockList);

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
                var dataEntitiesInDb = unitOfWork.Repository<SysStockList>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysStockList>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(StockListSearch stockListSearch)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listStockInDb = unitOfWork.Repository<SysStockList>().GetQueryable(item => true);
                if (!string.IsNullOrEmpty(stockListSearch.Code))
                    listStockInDb = listStockInDb.Where(item => EF.Functions.Like(item.Code, $"%{stockListSearch.Code}%"));

                if (!string.IsNullOrEmpty(stockListSearch.Name))
                    listStockInDb = listStockInDb.Where(item => EF.Functions.Like(item.Name, $"%{stockListSearch.Name}%"));

                if (stockListSearch.AreaId != null)
                    listStockInDb = listStockInDb.Where(item => item.AreaId == stockListSearch.AreaId);

                listStockInDb = listStockInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysStockList>>(_mapper.Map<IEnumerable<SysStockList>>(listStockInDb.ToList()));
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
                var stockEntityInDb = unitOfWork.Repository<SysStockList>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysStockList>(_mapper.Map<SysStockList>(stockEntityInDb));
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(StockListModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var stockEntityInDb = unitOfWork.Repository<SysStockList>().GetById(model.Id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (stockEntityInDb.Code != model.Code)
                {
                    if (IsCodeExist(model.Code))
                        return new ResponseDataError(Code.BadRequest, "Mã đã tồn tại");
                }

                if (stockEntityInDb.Name != model.Name)
                {
                    if (IsNameExist(model.Name))
                        return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");
                }

                stockEntityInDb.Code = model.Code.Trim();
                stockEntityInDb.Name = model.Name.Trim();
                stockEntityInDb.AreaId = model.AreaId;
                stockEntityInDb.Note = model.Note?.Trim();
                stockEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysStockList>().Update(stockEntityInDb);
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
            return unitOfWork.Repository<SysStockList>().Get(item => EF.Functions.Collate(item.Code, Constant.SQL_COLLATION_CASE_SENSITIVE) == code.Trim()).Any();
        }

        private bool IsNameExist(string name)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            return unitOfWork.Repository<SysStockList>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }
    }
}
