using System.Security.Claims;

namespace Backend.Infrastructure.Common.Interfaces
{
    public interface ICurrentUser
    {
        string? Name { get; }

        Guid GetUserId();

        string? GetUserEmail();

        string? GetTenant();
        string? GetDepartmentAccess();
        bool IsManager();

        Guid GetDepartmentdId();

        bool IsAuthenticated();

        bool IsInRole(string role);

        IEnumerable<Claim>? GetUserClaims();
    }
}
