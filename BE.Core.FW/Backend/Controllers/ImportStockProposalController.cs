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
    public class ImportStockProposalController : ControllerBase
    {
        private readonly IImportStockProposalHandler _handler;

        public ImportStockProposalController(IImportStockProposalHandler handler) => _handler = handler;

        [HttpGet]
        public ResponseData Get([FromQuery] ImportStockProposalSearch ImportStockProposalSearchModel) => _handler.Get(ImportStockProposalSearchModel);

        [HttpGet("Detail")]
        public ResponseData GetDetail(Guid id) => _handler.GetDetail(id);

        [HttpPut]
        public ResponseData Update([FromForm] ImportStockProposalModel model) => _handler.Update(model);

        [HttpPost]
        public ResponseData Create([FromForm] ImportStockProposalModel model) => _handler.Create(model);

        [HttpDelete]
        public ResponseData Delete([FromBody] IEnumerable<string> ids) => _handler.Delete(ids);

        [HttpPost("SendForApproval")]
        public ResponseData SendForApproval([FromBody] Guid id) => _handler.SendForApproval(id);

        [HttpPost("Approve")]
        public ResponseData Approve([FromBody] ApproveProposalModel model) => _handler.Approve(model);

        [HttpGet("GetListProposalCodeApproved")]
        public ResponseData GetListProposalCodeApproved() => _handler.GetListProposalCodeApproved();

        [HttpGet("DownloadProposal")]
        public IActionResult DownloadProposal(Guid id)
        {
            var fileStream = _handler.DownloadProposal(id);
            if (fileStream.Length > 0)
                return File(fileStream, "application/octet-stream", $"Proposal_{DateTime.Now:ddMMyyyyHHmmss}.xlsx");
            else
                return Problem(statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
