using Backend.Business;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    [EnableCors]
    public class UserManageStockController : ControllerBase
    {
        private readonly IUserManageStockHandler _handler;

        public UserManageStockController(IUserManageStockHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Detail(Guid stockId) => _handler.Detail(stockId);

        [HttpPost]
        public ResponseData Update([FromBody] UserManageStockUpdateModel model) => _handler.Update(model);

        [HttpGet("ListStockUserManage")]
        public ResponseData ListStockUserManage(int approveType) => _handler.GetListStockUserManage((Constant.StockApproveType)approveType);
    }
}
