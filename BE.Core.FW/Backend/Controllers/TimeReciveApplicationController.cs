using Backend.Business.Mailing;
using Backend.Business.TestScore;
using Backend.Business.TimeReciveApplication;
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
    public class TimeReciveApplicationController : ControllerBase
    {
        private readonly ITimeReciveApplicationHandler _handler;

        public TimeReciveApplicationController(ITimeReciveApplicationHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public ResponseData Get()
        {
            return _handler.Get();
        }

        [HttpPut]
        public ResponseData Update([FromBody] TimeReciveApplicationModel model)
        {
            return _handler.Update(model);
        }

        [HttpPost]
        public ResponseData Create([FromBody] TimeReciveApplicationModel model)
        {
            return _handler.Create(model);
        }

        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }
    }
}
