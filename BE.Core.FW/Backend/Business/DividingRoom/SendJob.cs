using Hangfire.Server;
using Hangfire;
using Backend.Business.Mailing;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using System.Globalization;
using Serilog;
using Microsoft.Extensions.Localization;

namespace Backend.Business.DividingRoom
{
    public class SendJob : ISendJobs
    {
        private readonly ILogger<SendJob> _logger;
        //private readonly PerformingContext _performingContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private readonly IStringLocalizer<DividingRoomHandler> _localizer;

        public SendJob(
            ILogger<SendJob> logger,
            //PerformingContext performingContext,
            IHttpContextAccessor httpContextAccessor,
             IEmailTemplateHandler emailTemplateHandler,
              IStringLocalizer<DividingRoomHandler> localizer
            )
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _emailTemplateHandler = emailTemplateHandler;
            _localizer = localizer;
            //_performingContext = performingContext;
        }

        [Queue("notdefault")]
        public async Task SendMailJobAsync(BackgroundState<EmailGenerateTemplateModel> backgroundState, string examPlaceName, string examSchedule, int countCandidates, Guid dividingExamPlaceId, CancellationToken cancellationToken)
        {
            if (backgroundState != null)
            {
                List<EmailGenerateTemplateModel> sendMails = backgroundState?.State ?? new List<EmailGenerateTemplateModel>();
                List<ExamRoomModel> examRooms = backgroundState?.examRooms ?? new List<ExamRoomModel>();
                List<ExamModel> exams = backgroundState?.exams ?? new List<ExamModel>();
                List<HeadQuarterModel> headerQuaters = backgroundState?.headerQuaters ?? new List<HeadQuarterModel>();
                List<AreaModel> areas = backgroundState?.areas ?? new List<AreaModel>();

                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var dividingExamPlaceUpdate = unitOfWork.Repository<SysDividingExamPlace>().GetById(dividingExamPlaceId);

                // Thời gian nghỉ giữa các lần gửi (tính bằng mili giây)
                //int delay = 5000;
                foreach (var item in sendMails)
                {
                    ExamRoomModel examRoomModel = new ExamRoomModel();
                    string examRoomName = "";
                    if (examRooms != null && examRooms.Count > 0)
                    {
                        examRoomModel = examRooms.FirstOrDefault(g => g.Id == item.ExamRoomId);
                    }
                    AreaModel areaModel = new AreaModel();
                    string areaName = "";
                    if (areas != null && areas.Count > 0)
                    {
                        areaModel = areas.FirstOrDefault(g => g.Id == item.ExamAreaId);
                    }
                    HeadQuarterModel headQuarterModel = new HeadQuarterModel();
                    string headQuarterName = "";
                    if (headerQuaters != null && headerQuaters.Count > 0)
                    {
                        headQuarterModel = headerQuaters.FirstOrDefault(g => g.Id == item.ExamPlaceId);
                    }
                    string linkGoogleMapDefault = "https://topik.iigvietnam.com/ko/location-exam/";
                    var culture = new CultureInfo("ko-KR");

                    if (!string.IsNullOrEmpty(item.LanguageSendMail))
                    {
                        switch (item.LanguageSendMail)
                        {
                            case "vi":
                                areaName = areaModel?.Name ?? "";
                                headQuarterName = headQuarterModel?.Name ?? "";
                                examRoomName = examRoomModel?.Name ?? "";
                                culture = new CultureInfo("vi-VN");
                                linkGoogleMapDefault = "https://topik.iigvietnam.com/vi/location-exam/";
                                break;
                            case "ko":
                                areaName = areaModel?.KoreaName ?? "";
                                headQuarterName = headQuarterModel?.KoreaName ?? "";
                                examRoomName = examRoomModel?.NameInKorean ?? "";
                                culture = new CultureInfo("ko-KR");
                                linkGoogleMapDefault = "https://topik.iigvietnam.com/ko/location-exam/";
                                break;
                            case "en":
                                areaName = areaModel?.EnglishName ?? "";
                                headQuarterName = headQuarterModel?.EnglishName ?? "";
                                examRoomName = examRoomModel?.NameInEnglish ?? "";
                                culture = new CultureInfo("en-US");
                                linkGoogleMapDefault = "https://topik.iigvietnam.com/en/location-exam/";
                                break;
                            default:
                                culture = new CultureInfo("ko-KR");
                                break;
                        }
                    }
                    Thread.CurrentThread.CurrentCulture = culture;
                    Thread.CurrentThread.CurrentUICulture = culture;
                    EmailGenerateTemplateModel emailGenerateTemplateModel = new EmailGenerateTemplateModel()
                    {
                        TitleFullNameVietnamese = _localizer["TitleFullNameVietnamese"],
                        TitleFullNameKorea = _localizer["TitleFullNameKorea"],
                        TitleBirthday = _localizer["TitleBirthday"],
                        TitleCandidateNumber = _localizer["TitleCandidateNumber"],
                        TitleExamName = _localizer["TitleExamName"],
                        TitleAreaName = _localizer["TitleAreaName"],
                        TitlePlaceName = _localizer["TitlePlaceName"],
                        TitleAddressPlaceName = _localizer["TitleAddressPlaceName"],
                        TitleCandidateRoom = _localizer["TitleCandidateRoom"],
                        TitleExamDate = _localizer["TitleExamDate"],
                        TitleTimeEndsToEnterExamRoom = _localizer["TitleTimeEndsToEnterExamRoom"],
                        TitleExamTime = _localizer["TitleExamTime"],
                        FullNameVietnamese = item.FullNameVietnamese,
                        FullNameKorea = item.FullNameKorea,
                        Birthday = item.Birthday,
                        CandidateNumber = item.CandidateNumber,
                        ExamName = exams.FirstOrDefault(g => g.Id == item.ExamId)?.Name ?? "",
                        AreaName = areaName,
                        PlaceName = headQuarterName,
                        AddressPlaceName = headerQuaters.FirstOrDefault(g => g.Id == item.ExamPlaceId)?.Address ?? "",
                        CandidateRoom = examRoomName,
                        ExamDate = item.ExamDate,
                        TimeEndsToEnterExamRoom = item.TimeEndsToEnterExamRoom ?? "",
                        ExamTime = item.ExamTime,
                        TitleMailSBD = _localizer["TitleMailSBD"],
                        GreetingMailSBD = string.Format(_localizer["GreetingMailSBD"], item.FullNameVietnamese),
                        TextLinkMailSBD = _localizer["TextLinkMailSBD"],
                        ContentMailSBD1 = _localizer["ContentMailSBD1"],
                        ContentMailSBD2 = _localizer["ContentMailSBD2"],
                        ContentMailSBD3 = _localizer["ContentMailSBD3"],
                        ContentMailSBD4 = _localizer["ContentMailSBD4"],
                        ContentMailSBD5 = _localizer["ContentMailSBD5"],
                        ContentMailSBD6 = _localizer["ContentMailSBD6"],
                        ContentMailSBD7 = _localizer["ContentMailSBD7"],
                        ContentMailSBD8 = string.Format(_localizer["ContentMailSBD8"], headQuarterModel?.LinkGoogleMap ?? linkGoogleMapDefault),
                        ContentMailSBD9 = _localizer["ContentMailSBD9"],
                        ContentMailSBD10 = _localizer["ContentMailSBD10"],
                        ContentMailSBD11 = _localizer["ContentMailSBD11"],
                        ContentMailSBD12 = _localizer["ContentMailSBD12"],
                    };
                    string templateBody = _emailTemplateHandler.GenerateEmailTemplate("email-confirmation", emailGenerateTemplateModel);
                    var itemUpdate = unitOfWork.Repository<SysExamRoomDivided>().GetById(item.SysExamRoomDivided);

                    // Gửi email
                    try
                    {
                        var request = (new EmailRequest()
                        {
                            Body = templateBody,
                            HTMLBody = templateBody,
                            Subject = _localizer["TitleMailSBD"],
                            ToEmail = new List<string>() { item.ToEmail },
                            ToAddress = item.ToEmail,
                            //ToEmail = new List<string>() { "nguyenducmanh2017603373@gmail.com" },
                            //ToAddress = "nguyenducmanh2017603373@gmail.com",
                        });
                        var res = await _emailTemplateHandler.SendOneZetaEmail(request);

                        //client.Send(message);
                        if (res.Code == Code.Success)
                        {
                            if (itemUpdate != null)
                            {
                                itemUpdate.IsSendMail = 1;
                                unitOfWork.Repository<SysExamRoomDivided>().InsertOrUpdate(itemUpdate);
                            }
                        }

                    }
                    catch (Exception ex)
                    {
                        Log.Error(ex, ex.Message);
                        //Console.WriteLine($"Gửi mail {item.CandidateName} error");
                    }
                }
                if (dividingExamPlaceUpdate != null)
                {
                    dividingExamPlaceUpdate.IsSendMail = 1;
                    unitOfWork.Repository<SysDividingExamPlace>().InsertOrUpdate(dividingExamPlaceUpdate);
                }
            }
        }


        [Queue("notdefault")]
        //[AutomaticRetry(Attempts = 5)]
        public async Task CleanAsync(CancellationToken cancellationToken)
        {
            //_logger.LogInformation("Initializing Job with Id: {jobId}", _performingContext.BackgroundJob.Id);

            //var items = await _repository.ListAsync(new RandomBrandsSpec(), cancellationToken);

            //_logger.LogInformation("Brands Random: {brandsCount} ", items.Count.ToString());

            //foreach (var item in items)
            //{
            //    await _mediator.Send(new DeleteBrandRequest(item.Id), cancellationToken);
            //}

            _logger.LogError("Initializing Job with Id: {jobId}", 1);
        }
    }
}
