using Backend.Business.Mailing;
using Backend.Business.Target;
using Backend.Business.User;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TargetController : ControllerBase
    {
        private readonly ITargetHandler _handler;

        public TargetController(ITargetHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get(string filter = "{}")
        {
            return _handler.Get(filter);
        }

        [HttpPost]
        [Route("import")]
        public ResponseData Import([FromForm] TargetImportModel importModel)
        {
            return _handler.Import(importModel);
        }

        /// <summary>
        /// Cập nhật hoặc thêm mới mục tiêu doanh số
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpSertList")]
        public ResponseData UpSertList(Guid? departmentId, [FromBody] List<TargetModel> targets)
        {
            return _handler.UpSertList(departmentId, targets);
        }

        [HttpGet]
        [Route("PracticeTarget")]
        public ResponseData PracticeTarget(Guid id, int type, Guid departmentId, int year, string? userName)
        {
            return _handler.PracticeTarget(id, type, departmentId, year, userName);
        }

        /// <summary>
        /// Cập nhật hoặc thêm mới mục tiêu doanh số trong bảng TargetMapping
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("UpSertTargetMapping")]
        public ResponseData UpSertTargetMapping(Guid targetId, [FromBody] TargetModel model)
        {
            return _handler.UpSertTargetMapping(targetId, model);
        }

        /// <summary>
        /// Tải file import
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("Download-File-Import")]
        public async Task<ResponseData> DownloadFileImport()
        {
            return await _handler.DownloadFileImport();
        }
    }
}
