using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IUserManageStockHandler
    {
        ResponseData Detail(Guid stockId);
        ResponseData Update(UserManageStockUpdateModel model);
        ResponseData GetListStockUserManage(Constant.StockApproveType approveType);
    }
}
