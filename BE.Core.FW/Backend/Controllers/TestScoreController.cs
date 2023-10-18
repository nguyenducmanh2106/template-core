using Backend.Business.Mailing;
using Backend.Business.TestScore;
using Backend.Infrastructure.Utils;
using DocumentFormat.OpenXml.Office2016.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;
using Serilog;
using System;
using System.IO;
using System.Net.Http;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    [EnableCors]
    public class TestScoreController : ControllerBase
    {
        private readonly ITestScoreHandler _handler;
        private readonly IEmailTemplateHandler _emailTemplateHandler;

        public TestScoreController(ITestScoreHandler handler, IEmailTemplateHandler emailTemplateHandler)
        {
            _handler = handler;
            _emailTemplateHandler = emailTemplateHandler;
        }


        [HttpGet]
        public ResponseData Get(string? filter)
        {
            return _handler.Get(filter);
        }

        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        public ResponseData Update([FromBody] TestScoreModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] TestScoreModel model)
        {
            return _handler.Create(model);
        }

        [HttpPost]
        [Route("Import")]
        public ResponseData Import(IFormFile file)
        {
            return _handler.Import(file);
        }
        
        [HttpPost]
        [Route("CheckCode")]
        public ResponseData CheckCode(IFormFile file)
        {
            var result = _handler.CheckByFile(file);
            return result;
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [HttpDelete]
        [Route("DeleteMany")]
        public ResponseData DeleteMany([FromBody] List<string> ids)
        {
            return _handler.DeleteMany(ids);
        }
    }
}
