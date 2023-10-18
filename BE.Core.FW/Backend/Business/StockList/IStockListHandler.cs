using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IStockListHandler
    {
        ResponseData Get(StockListSearch stockListSearch);
        ResponseData GetById(Guid id);
        ResponseData Create(StockListModel model);
        ResponseData Update(StockListModel model);
        ResponseData Delete(IEnumerable<string> ids);
    }
}
