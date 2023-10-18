using Backend.Infrastructure.Utils;

namespace Backend.Business.Auth
{
    public interface IAuthHandler
    {
        Task<bool> CheckAuthWso2(string accessToken);
        Task<ResponseData> GetToken(string code);
        Task<ResponseData> GetNavigation();
    }
}
