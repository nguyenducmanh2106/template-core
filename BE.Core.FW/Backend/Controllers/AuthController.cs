﻿using Backend.Business.Auth;
using Backend.Business.Blacklist;
using Backend.Business.Navigation;
using Backend.Infrastructure.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    //[Authorize]
    public class AuthController : ControllerBase
    {
        private readonly IAuthHandler _handler;

        public AuthController(IAuthHandler handler)
        {
            _handler = handler;
        }

        [HttpGet]
        public async Task<bool> CheckAuthWSO2()
        {
            string accessToken = Request.Headers["authorization"].ToString();
            accessToken = accessToken.Replace("Bearer", "").Trim();
            return await _handler.CheckAuthWso2(accessToken);
        }

        [HttpGet]
        [Route("GetToken")]
        public async Task<ResponseData> GetToken(string code)
        {
            return await _handler.GetToken(code);
        }

        [HttpGet]
        [Route("GetNavigation")]
        public async Task<ResponseData> GetNavigation()
        {
            return await _handler.GetNavigation();
        }
    }
}
