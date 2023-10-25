using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.ContractType;

public interface IContractTypeHandler
{
    ResponseData Get(string filter);
    ResponseData GetById(Guid id);
    ResponseData Create(ContractTypeModel model);
    ResponseData Update(Guid id, ContractTypeModel model);
    ResponseData Delete(Guid id);
}