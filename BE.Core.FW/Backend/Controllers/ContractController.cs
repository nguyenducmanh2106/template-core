using Backend.Business.Contract;
using Backend.Business.Customer;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ContractController : ControllerBase
    {
        private readonly IContractHandler _handler;

        public ContractController(IContractHandler handler)
        {
            _handler = handler;
        }

        [HttpPost]
        public ResponseData Create([FromBody] ContractModel model)
        {
            return _handler.Create(model);
        }

        [HttpDelete]
        [Route("id")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpGet]
        public async Task<ResponseData> Get(string filter = "{}")
        {
            return await _handler.Get(filter);
        }

        [HttpGet]
        [Route("id")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        [Route("id")]
        public ResponseData Update(Guid id, ContractModel model)
        {
            return _handler.Update(id, model);
        }

        //[HttpGet]
        //[Route("template")]

        //public ResponseData GetFileTemplate()
        //{
        //    return _handler.GetFileTemplate();
        //}

        //[HttpPost]
        //[Route("import")]
        //public ResponseData Import(IFormFile file)
        //{
        //    return _handler.Import(file);
        //}
    }
}
