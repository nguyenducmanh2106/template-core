﻿using Backend.Infrastructure.Common.Interfaces;
using Backend.Infrastructure.Middleware.Permissions;
using System.Security.Claims;

namespace Backend.Infrastructure.Middleware.Auth
{
    public class CurrentUser : ICurrentUser, ICurrentUserInitializer
    {
        private ClaimsPrincipal? _user;

        public string? Name => _user?.Identity?.Name;

        private Guid _userId = Guid.Empty;

        public Guid GetUserId() =>
            IsAuthenticated()
                ? Guid.Parse(_user?.GetUserId() ?? Guid.Empty.ToString())
                : _userId;

        public string? GetUserEmail() =>
            IsAuthenticated()
                ? _user!.GetEmail()
                : string.Empty;

        public string? GetDepartmentAccess() =>
            IsAuthenticated()
                ? _user?.GetDepartmentAccess()
                : string.Empty;

        public bool IsManager() =>
            IsAuthenticated()
                ? _user?.IsManager() ?? false
                : false;

        public Guid GetDepartmentdId() =>
            IsAuthenticated()
                ? Guid.Parse(_user?.GetDepartmentdId() ?? Guid.Empty.ToString())
                : Guid.Empty;

        public bool IsAuthenticated() =>
            _user?.Identity?.IsAuthenticated is true;

        public bool IsInRole(string role) =>
            _user?.IsInRole(role) is true;

        public IEnumerable<Claim>? GetUserClaims() =>
            _user?.Claims;

        public string? GetTenant() =>
            IsAuthenticated() ? _user?.GetTenant() : string.Empty;

        public void SetCurrentUser(ClaimsPrincipal user)
        {
            if (_user != null)
            {
                throw new System.Exception("Method reserved for in-scope initialization");
            }

            _user = user;
        }

        public void SetCurrentUserId(string userId)
        {
            if (_userId != Guid.Empty)
            {
                throw new System.Exception("Method reserved for in-scope initialization");
            }

            if (!string.IsNullOrEmpty(userId))
            {
                _userId = Guid.Parse(userId);
            }
        }
    }
}
