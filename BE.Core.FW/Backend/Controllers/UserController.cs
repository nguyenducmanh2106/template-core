﻿using Backend.Business.User;
using Backend.Infrastructure.Utils;
using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors]
    public class UserController : ControllerBase
    {
        private readonly IUserHandler _handler;
        private readonly IHttpContextAccessor _contextAccessor;

        public UserController(IUserHandler handler, IHttpContextAccessor contextAccessor)
        {
            _handler = handler;
            _contextAccessor = contextAccessor;
        }

        [Authorize]
        [HttpGet]
        public async Task<ResponseData> Get([FromQuery] string? name, int pageIndex = 1, int pageSize = 10)
        {
            return await _handler.Get(name, HttpHelper.GetAccessFromHeader(Request), pageIndex, pageSize);
        }

        [Authorize]
        [HttpGet]
        [Route("{id}")]
        public ResponseData GetById(Guid id)
        {
            return _handler.GetById(id);
        }

        [Authorize]
        [HttpPut]
        [Route("{id}")]
        public ResponseData Update(Guid id, [FromBody] UserModel model)
        {
            return _handler.Update(id, model);
        }

        [Authorize]
        [HttpPut]
        [Route("ToggleStatus/{id}/{status}")]
        public ResponseData ToggleStatus(Guid id, bool status)
        {
            return _handler.ToggleStatus(id, status);
        }

        [Authorize]
        [HttpPut]
        [Route("AsignRole/{userId}")]
        public ResponseData AsignRole(Guid userId, [FromBody] UserModel model)
        {
            return _handler.AsignRole(userId, model);
        }

        [Authorize]
        [HttpPost]
        public ResponseData Create([FromBody] UserModel model)
        {
            return _handler.Create(model);
        }

        [Authorize]
        [HttpDelete]
        [Route("{id}")]
        public ResponseData Delete(Guid id)
        {
            return _handler.Delete(id);
        }

        [Authorize]
        [HttpDelete]
        [Route("DeleteMany")]
        public ResponseData DeleteMany([FromBody] List<string> ids)
        {
            return _handler.DeleteMany(ids);
        }

        /// <summary>
        /// Lấy danh sách quyền theo userId đang đăng nhập
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("me")]
        public ResponseData GetPermission()
        {
            string syncIdFromWSO2 = _contextAccessor?.HttpContext?.User.Claims.FirstOrDefault(g => g.Type == ClaimTypes.NameIdentifier)?.Value ?? "";
            Guid.TryParse(syncIdFromWSO2, out Guid syncId);
            return _handler.GetBySyncId(syncId);
        }

        /// <summary>
        /// Lấy danh sách quyền theo syncId
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("me/{syncId}")]
        public ResponseData GetPermissionBySyncId(Guid syncId)
        {
            return _handler.GetBySyncId(syncId);
        }

        [Authorize]
        [HttpPut]
        [Route("ChangePassword/{userId}")]
        public ResponseData ChangePassword(Guid userId, [FromBody] UserChangePassword model)
        {
            string syncIdFromWSO2 = _contextAccessor?.HttpContext?.User.Claims.FirstOrDefault(g => g.Type == ClaimTypes.NameIdentifier)?.Value ?? "";
            Guid.TryParse(syncIdFromWSO2, out Guid syncId);
            return _handler.ChangePassword(syncId, model);
        }

        [HttpGet("InsertAttribute")]
        public bool InsertAttribute(string email, string url)
        {
            return _handler.InsertAttribute(email, url);
        }

        [HttpGet("DeleteAttribute")]
        public bool DeleteAttribute(string email)
        {
            return _handler.DeleteAttribute(email);
        }

        [HttpGet("SelectAttribute")]
        public bool SelectAttribute(string email)
        {
            return _handler.SelectAttribute(email);
        }
    }
}
