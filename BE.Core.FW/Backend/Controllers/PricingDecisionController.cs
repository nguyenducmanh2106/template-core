﻿using Backend.Business;
using Backend.Business.Auth;
using Backend.Business.Branch;
using Backend.Business.Department;
using Backend.Business.Navigation;
using Backend.Business.PricingDecision;
using Backend.Business.User;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    // [Authorize]
    [ApiController]
    [Route("[controller]")]
    //[Authorize]
    public class PricingDecisionController : ControllerBase
    {
        private readonly IPricingDecisionHandler _handler;

        public PricingDecisionController(IPricingDecisionHandler handler)
        {
            _handler = handler;
        }

        [HttpPost]
        public ResponseData Create([FromBody] PricingDecisionModel model)
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
        public ResponseData Get(string filter = "{}")
        {
            return _handler.Get(filter);
        }

        [HttpGet]
        [Route("id")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [HttpPut]
        [Route("id")]
        public ResponseData Update(Guid id, PricingDecisionModel model)
        {
            return _handler.Update(id, model);
        }
    }
}
