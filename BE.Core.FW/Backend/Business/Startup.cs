using Backend.Business.AdministrativeDivision;
using Backend.Business.Auth;
using Backend.Business.Branch;
using Backend.Business.ContractType;
using Backend.Business.Customer;
using Backend.Business.Department;
using Backend.Business.Mailing;
using Backend.Business.Navigation;
using Backend.Business.Policy;
using Backend.Business.PricingCategory;
using Backend.Business.PricingDecision;
using Backend.Business.Role;
using Backend.Business.Target;
using Backend.Business.TaxCategory;
using Backend.Business.UploadFile;
using Backend.Business.User;

namespace Backend.Business;

internal static class Startup
{
    internal static IServiceCollection AddInjectionBussiness(this IServiceCollection services)
    {
        return services
            .AddScoped<IUserHandler, UserHandler>()
            .AddScoped<INavigationHandler, NavigationHandler>()
            .AddScoped<IPolicyHandler, PolicyHandler>()
            .AddScoped<IRoleHandler, RoleHandler>()
            .AddScoped<IUploadFileHandler, UploadFileHandler>()
            .AddScoped<IUserHandler, UserHandler>()
            .AddScoped<IEmailTemplateHandler, EmailTemplateHandler>()
            .AddScoped<IEmailHandler, EmailHandler>()
            .AddScoped<IAuthHandler, AuthHandler>()
            .AddScoped<IBranchHandler, BranchHandler>()
            .AddScoped<IProductCategoryHandler, ProductCategoryHandler>()
            .AddScoped<IProductTypeHandler, ProductTypeHandler>()
            .AddScoped<IProductHandler, ProductHandler>()
            .AddScoped<ICustomerCategoryHandler, CustomerCategoryHandler>()
            .AddScoped<ICustomerTypeHandler, CustomerTypeHandler>()
            .AddScoped<IAdministrativeDivisionHandler, AdministrativeDivisionHandler>()
            .AddScoped<ICustomerHandler, CustomerHandler>()
            .AddScoped<IContractTypeHandler, ContractTypeHandler>()
            .AddScoped<ITaxCategoryHandler, TaxCategoryHandler>()
            .AddScoped<IPricingDecisionHandler, PricingDecisionHandler>()
            .AddScoped<IPricingCategoryHandler, PricingCategoryHandler>()
            .AddScoped<ITargetHandler, TargetHandler>()
            .AddScoped<IDepartmentHandler, DepartmentHandler>();
    }
}