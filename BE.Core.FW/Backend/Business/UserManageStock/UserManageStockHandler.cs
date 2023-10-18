using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Serilog;

namespace Backend.Business
{
    public class UserManageStockHandler : IUserManageStockHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserManageStockHandler(IHttpContextAccessor httpContextAccessor) => _httpContextAccessor = httpContextAccessor;

        public ResponseData GetListStockUserManage(Constant.StockApproveType approveType)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var currentUserId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                var listStockUserManage = unitOfWork.Repository<SysUserManageStock>().Get(item => item.UserId == Guid.Parse(currentUserId) && item.ApproveType == (int)approveType)
                    .Select(item => item.StockId);
                return new ResponseDataObject<IEnumerable<Guid>>(listStockUserManage);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Detail(Guid stockId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var entityInDb = unitOfWork.Repository<SysUserManageStock>().Get(item => item.StockId == stockId);
                if (entityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<IEnumerable<SysUserManageStock>>(entityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(UserManageStockUpdateModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysUserManageStock>().Get(item => item.StockId == model.StockId);
                if (dataEntityInDb != null)
                {
                    foreach (var item in dataEntityInDb)
                    {
                        unitOfWork.Repository<SysUserManageStock>().Delete(item);
                    }
                }

                unitOfWork.Repository<SysUserManageStock>().InsertRange(GetListUserManageStockByAprroveType(model.StockId, model.UserApproveProposal, Constant.StockApproveType.Proposal));
                unitOfWork.Repository<SysUserManageStock>().InsertRange(GetListUserManageStockByAprroveType(model.StockId, model.UserApproveReceipt, Constant.StockApproveType.Receipt));

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private List<SysUserManageStock> GetListUserManageStockByAprroveType(Guid stockId, IEnumerable<Guid>? listUserId, Constant.StockApproveType approveType)
        {
            var listUserManageStock = new List<SysUserManageStock>();
            if (listUserId != null)
            {
                foreach (var userId in listUserId)
                {
                    listUserManageStock.Add(new SysUserManageStock
                    {
                        Id = Guid.NewGuid(),
                        ApproveType = (int)approveType,
                        UserId = userId,
                        StockId = stockId
                    });
                }
            }

            return listUserManageStock;
        }
    }
}
