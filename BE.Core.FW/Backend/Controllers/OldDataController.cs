using Backend.Business;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors]
    [Authorize]
    public class OldDataController : ControllerBase
    {
        private readonly IOldData _handler;

        public OldDataController(IOldData handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] HoSoDangKyModel model) => _handler.GetHoSoDangKy(model);
    }
}
