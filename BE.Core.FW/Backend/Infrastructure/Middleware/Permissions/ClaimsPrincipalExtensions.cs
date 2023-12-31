﻿using System.Security.Claims;

namespace Backend.Infrastructure.Middleware.Permissions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string? GetEmail(this ClaimsPrincipal principal)
            => principal.FindFirstValue(ClaimTypes.Email);

        public static string? GetTenant(this ClaimsPrincipal principal)
            => principal.FindFirstValue(FSHClaims.Tenant);

        public static string? GetFullName(this ClaimsPrincipal principal)
            => principal?.FindFirst(FSHClaims.Fullname)?.Value;

        public static string? GetFirstName(this ClaimsPrincipal principal)
            => principal?.FindFirst(ClaimTypes.Name)?.Value;

        public static string? GetSurname(this ClaimsPrincipal principal)
            => principal?.FindFirst(ClaimTypes.Surname)?.Value;

        public static string? GetPhoneNumber(this ClaimsPrincipal principal)
            => principal.FindFirstValue(ClaimTypes.MobilePhone);

        public static string? GetUserId(this ClaimsPrincipal principal)
           => principal.FindFirstValue(ClaimTypes.NameIdentifier);

        public static string? GetImageUrl(this ClaimsPrincipal principal)
           => principal.FindFirstValue(FSHClaims.ImageUrl);

        public static DateTimeOffset GetExpiration(this ClaimsPrincipal principal) =>
            DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(
                principal.FindFirstValue(FSHClaims.Expiration)));

        public static string? GetDepartmentAccess(this ClaimsPrincipal principal)
          => principal.FindFirstValue(FSHClaims.DepartmentAccess);

        public static bool IsManager(this ClaimsPrincipal principal)
          => Boolean.Parse(principal.FindFirstValue(FSHClaims.IsManager));

        public static string? GetDepartmentdId(this ClaimsPrincipal principal)
          => principal.FindFirstValue(FSHClaims.DepartmentId);

        private static string? FindFirstValue(this ClaimsPrincipal principal, string claimType) =>
            principal is null
                ? throw new ArgumentNullException(nameof(principal))
                : principal.FindFirst(claimType)?.Value;
    }
}
