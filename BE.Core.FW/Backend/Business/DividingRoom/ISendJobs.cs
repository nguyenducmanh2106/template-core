using Backend.Business.Mailing;
using Backend.Infrastructure.BackgroundJobs;
using System.ComponentModel;

namespace Backend.Business.DividingRoom
{
    public interface ISendJobs : IScopedService
    {
        [DisplayName("Send {3} emails: {1} | {2}")]
        Task SendMailJobAsync(BackgroundState<EmailGenerateTemplateModel> backgroundState, string examPlaceName, string examSchedule, int countCandidates, Guid dividingExamPlaceId, CancellationToken cancellationToken);

        [DisplayName("removes all radom brands created example job on Queue notDefault")]
        Task CleanAsync(CancellationToken cancellationToken);
    }
}
