using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Business.Payment
{
    public class IpSafeListFilter : ActionFilterAttribute
    {
        private readonly string _listIpAllow;

        public IpSafeListFilter(string listIpAllow) => _listIpAllow = listIpAllow;

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!string.IsNullOrEmpty(_listIpAllow))
            {
                var remoteIp = context.HttpContext.Connection.RemoteIpAddress;
                var isAllow = true;
                if (remoteIp != null)
                {
                    if (remoteIp.IsIPv4MappedToIPv6)
                        remoteIp = remoteIp.MapToIPv4();

                    var ip = _listIpAllow.Split(';');
                    if (!ip.Contains(remoteIp.ToString()))
                        isAllow = false;
                }
                else
                    isAllow = false;

                if (!isAllow)
                {
                    context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                    return;
                }
            }

            base.OnActionExecuting(context);
        }
    }
}
