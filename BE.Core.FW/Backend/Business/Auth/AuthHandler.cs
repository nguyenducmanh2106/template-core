using AutoMapper;
using Backend.Business.Navigation;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.EMMA;
using Microsoft.AspNetCore.DataProtection;
using NetCasbin;
using Newtonsoft.Json;
using Serilog;
using System.Reflection.Metadata;
using System.Text;
using Constant = Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.Auth
{
    public class AuthHandler : IAuthHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private static readonly string apiBasicUriWSO2 = Utils.GetConfig("Authentication:WSO2:Admin:Uri");
        private static readonly string RedirectUri = Utils.GetConfig("Authentication:WSO2:Admin:RedirectUri");
        private static readonly string Secret = Utils.GetConfig("Authentication:WSO2:Admin:Secret");
        private static readonly string Clientid = Utils.GetConfig("Authentication:WSO2:Admin:Clientid");

        public AuthHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<bool> CheckAuthWso2(string accessToken)
        {
            try
            {
                // hardcode tạm
                return await HttpHelper.GetAuthStatusWSO2(apiBasicUriWSO2, Utils.GetConfig("Authentication:WSO2:Tenants:iig") + Utils.GetConfig("Authentication:WSO2:API:Auth"), accessToken);
            }
            catch (Exception e)
            {
                Log.Error(e, e.Message);
                return true;
            }
        }

        public async Task<ResponseData> GetToken(string code)
        {
            try
            {
                // hardcode tạm
                HttpClientHandler clientHandler = new HttpClientHandler();
                clientHandler.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => { return true; };
                var body = new
                {
                    grant_type = "authorization_code",
                    code = code,
                    redirect_uri = RedirectUri
                };

                using (var client = new HttpClient(clientHandler))
                {
                    client.BaseAddress = new Uri(apiBasicUriWSO2);
                    client.DefaultRequestHeaders.Add("Authorization", "Basic " + System.Convert.ToBase64String(Encoding.GetEncoding("ISO-8859-1").GetBytes(Clientid + ":" + Secret)));
                    var content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
                    var result = await client.PostAsync(Utils.GetConfig("Authentication:WSO2:Tenants:iig") + Utils.GetConfig("Authentication:WSO2:API:PostToken"), content);
                    string resultContentString = await result.Content.ReadAsStringAsync();
                    if (result.IsSuccessStatusCode && result.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        if (resultContentString != null)
                        {
                            var resultContent = JsonConvert.DeserializeObject<WSO2ResponseModel>(resultContentString);
                            return new ResponseDataObject<WSO2ResponseModel>(resultContent != null ? resultContent : new WSO2ResponseModel(), Code.Success, "Thành công ");
                        }
                    }
                    return new ResponseDataError(Code.ServerError, "Lỗi lấy dữ liệu WSO2");
                }
            }
            catch (Exception e)
            {
                Log.Error(e, e.Message);
                return new ResponseDataError(Code.ServerError, e.Message);
            }
        }
        public async Task<ResponseData> GetNavigation()
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysNavigation>().Get();
                var result = new List<NavigationModel>();
                foreach (var item in data)
                {
                    result.Add(BuildMenu(item));
                }
                return new ResponseDataObject<List<NavigationModel>>(result.Where(p => string.IsNullOrEmpty(p.ParentId.ToString())).ToList(), Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
        private NavigationModel BuildMenu(SysNavigation navigation)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);

            NavigationModel result = _mapper.Map<NavigationModel>(navigation);
            var children = unitOfWork.Repository<SysNavigation>().Get(x => x.ParentId == navigation.Id);
            if (children.Any())
            {
                foreach (var item in children)
                {
                    result.Children.Add(BuildMenu(item));
                }
            }
            return result;
        }
    }
}
