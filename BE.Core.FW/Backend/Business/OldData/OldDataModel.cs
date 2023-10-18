using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business
{
    public class HoSoDangKyModel
    {
        public string UserEmail { get; set; } = null!;
        public ExamTypeFromAsc? ExamType { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
