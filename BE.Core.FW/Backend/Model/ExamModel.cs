using Backend.Business;
using System.ComponentModel.DataAnnotations;

namespace Backend.Model
{
    public class ExamModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid ExamTypeId { get; set; }
        public string? Note { get; set; }
        public uint Order { get; set; } = 0;
        public bool IsShow { get; set; } = false;
        public bool IsSetCombo { get; set; } = false;
        public bool CanRegister { get; set; } = false;
        public long? Price { get; set; }
        public long? PriceCombo { get; set; }
        public uint? MaxVersionCanRegister { get; set; } = 0;
        public int ExamForm { get; set; }
        public bool HaveMultiVersion { get; set; }
        public string? RegistrationCode { get; set; }
        public string? AreaApply { get; set; }
        public string? ProvinceApply { get; set; }//thi thường
        public IEnumerable<ExamVersionModel>? ExamVersion { get; set; }
    }

    public class ExamWorkShiftModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Note { get; set; }
        public uint Order { get; set; }
        public bool IsShow { get; set; } = true;
    }
    public class AreaApplyModel
    {
        public string Area { get; set; } = string.Empty;
        public List<string> Place { get; set; } = new List<string>();
        public string? Open { get; set; }
        public string? Close { get; set; }
        public bool IsOn { get; set; }
    }
}
