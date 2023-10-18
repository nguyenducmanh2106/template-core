using Backend.Business.Mailing;
using Backend.Model;
using Microsoft.Extensions.Localization;

namespace Backend.Business.DividingRoom
{
    public class BackgroundState<T>
    {
        //public IHttpContextAccessor HttpContextAccessor { get; set; }
        public List<T> State { get; set; }
        //public IEmailTemplateHandler EmailTemplate { get; set; }
        //public IStringLocalizer<DividingRoomHandler> Localizer { get; set; }
        public List<ExamRoomModel> examRooms { get; set; }
        public List<ExamModel> exams { get; set; }
        public List<HeadQuarterModel> headerQuaters { get; set; }
        public List<AreaModel> areas { get; set; }
    }
}
