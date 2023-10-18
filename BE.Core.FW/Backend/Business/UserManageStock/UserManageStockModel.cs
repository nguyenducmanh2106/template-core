using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class UserManageStockUpdateModel
    {
        public Guid StockId { get; set;}
        public IEnumerable<Guid>? UserApproveProposal { get; set;}
        public IEnumerable<Guid>? UserApproveReceipt { get; set; }
    }
}
