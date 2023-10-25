using Backend.Business.UploadFile;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    //[Authorize]
    [EnableCors]
    public class UploadController : ControllerBase
    {
        private readonly IUploadFileHandler _handler;

        public UploadController(IUploadFileHandler handler)
        {
            _handler = handler;
        }


        [HttpPost]
        [Route("UploadFiles")]
        public async Task<ActionResult> UploadFiles(List<IFormFile> files)
        {
            try
            {
                var result = await _handler.UploadFiles(files);

                return Ok(new { files = result });
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return default;
            }
        }

        //[ValidateInput(false)]
        [HttpDelete]
        [Route("DeleteFile")]
        public async Task<ResponseData> DeleteFile(string url)
        {
            try
            {
                return await _handler.DeleteFile(url);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return default;
            }
        }
    }
}
