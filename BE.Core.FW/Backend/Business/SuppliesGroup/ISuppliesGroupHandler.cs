using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface ISuppliesGroupHandler
    {
        ResponseData Get(SuppliesGroupSearch suppliesGroupSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(SuppliesGroupModel model);
        ResponseData Update(SuppliesGroupModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
