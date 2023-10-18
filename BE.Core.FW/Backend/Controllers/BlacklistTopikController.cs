using Backend.Business;
using Backend.Business.Blacklist;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class BlacklistTopikController : ControllerBase
    {
        private readonly IBlacklistTopikHandler _handler;

        public BlacklistTopikController(IBlacklistTopikHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] BlackListTopikSearchModel model) => _handler.Get(model);

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id) => _handler.GetById(id);

        [HttpPut("{id}")]
        public ResponseData Update(Guid id, [FromBody] BlacklistTopikModel model) => _handler.Update(id, model);

        [HttpPost]
        public ResponseData Create([FromBody] BlacklistTopikModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete(IEnumerable<Guid> ids) => _handler.Delete(ids);

        [HttpPost]
        [Route("ImportList")]
        public ResponseData ImportList(IFormFile formFile) => _handler.ImportList(formFile, true);

        [HttpGet("DownloadImportTemplate")]
        public IActionResult DownloadImportTemplate()
        {
            var filePath = Path.Combine(Environment.CurrentDirectory, "TemplateExcel", "Blacklist_import_template.xlsx");
            return File(System.IO.File.OpenRead(filePath), "application/octet-stream");
        }
    }
}
