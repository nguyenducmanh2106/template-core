using Backend.Business.User;
using Backend.Infrastructure.Utils;

namespace Backend.Model
{
    public class TargetModel
    {
        public Guid Id { get; set; }
        public int Type { get; set; }
        public string? TypeName { get; set; }
        public int Year { get; set; }
        public Guid? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string? Username { get; set; }
        public Guid? ProductTypeId { get; set; }
        public string? ProductTypeName { get; set; }
        public Guid? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public decimal Jan { get; set; }
        public int QuantityJan { get; set; }
        public decimal Feb { get; set; }
        public int QuantityFeb { get; set; }
        public decimal Mar { get; set; }
        public int QuantityMar { get; set; }
        public decimal Apr { get; set; }
        public int QuantityApr { get; set; }
        public decimal May { get; set; }
        public int QuantityMay { get; set; }
        public decimal Jun { get; set; }
        public int QuantityJun { get; set; }
        public decimal July { get; set; }
        public int QuantityJuly { get; set; }
        public decimal Aug { get; set; }
        public int QuantityAug { get; set; }
        public decimal Sep { get; set; }
        public int QuantitySep { get; set; }
        public decimal Oct { get; set; }
        public int QuantityOct { get; set; }
        public decimal Nov { get; set; }
        public int QuantityNov { get; set; }
        public decimal Dec { get; set; }
        public int QuantityDec { get; set; }
        public decimal Total { get; set; }
        public int TotalQuantity { get; set; }
        public Guid? DocumentId { get; set; }
        //public DocumentCommandModel[] Commands { get; set; }
        public Guid CreatedByUserId { get; set; }
        public Guid LastModifiedByUserId { get; set; }
        public DateTime LastModifiedOnDate { get; set; } = DateTime.Now;
        public DateTime CreatedOnDate { get; set; } = DateTime.Now;

        public string? State { get; set; }
        public string? StateName { get; set; }

        public List<TargetMappingModel>? Targets { get; set; }

        public string? Fullname { get; set; }

        public HistoryTargetModel? HistoryTarget { get; set; }

        public List<UserModel>? Users { get; set; }

        public List<Guid>? UserNotification { get; set; }
    }

    public class TargetFilterModel : RequestData
    {
        public Guid? DepartmentId { get; set; }

        public int? TargetYear { get; set; }

        public string? TextSearch { get; set; }
        //public int? Year { get; set; }
        public int? Type { get; set; }
        public string? Username { get; set; }
        public Guid? ProductTypeId { get; set; }
        public Guid? CustomerId { get; set; }
    }
}
