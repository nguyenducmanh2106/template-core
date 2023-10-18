using Backend.Infrastructure.EntityFramework.Datatables;

namespace Backend.Business.ManageRegisteredCandidateTopik
{
    public class StatisticalGroupDTO
    {
        public Guid AreaTest { get; set; }
        public Guid PlaceTest { get; set; }
        public Guid TestScheduleId { get; set; }
        public List<SysManageRegisteredCandidateTopik> Items { get; set; }
    }
}
