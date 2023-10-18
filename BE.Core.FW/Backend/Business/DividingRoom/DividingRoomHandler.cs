using AutoMapper;
using Backend.Business.DividingRoom;
using Backend.Business.ExamScheduleTopik;
using Backend.Business.Mailing;
using Backend.Business.ManageRegisteredCandidateTopik;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Vml.Office;
using Microsoft.Data.SqlClient;
using Serilog;
using System;
using System.Collections.Concurrent;
using System.ComponentModel;
using System.Data;
using System.Globalization;
using System.Net.Mail;
using System.Net.Mime;
using System.Net;
using System.Text;
using static Backend.Infrastructure.Utils.Constant;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Localization;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Backend.Business.Payment;
using DocumentFormat.OpenXml.Office2016.Excel;
using Backend.Business.User;
using System.Linq;
using DocumentFormat.OpenXml.EMMA;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Office.Interop.Excel;
using NetCasbin.Model;
using Backend.Infrastructure.BackgroundJobs;
using AutoMapper.Internal;
using Backend.Infrastructure.Dapper.Interfaces;

namespace Backend.Business.DividingRoom
{
    public class DividingRoomHandler : IDividingRoomHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");
        private static readonly string apiBasicUriUser = Backend.Infrastructure.Utils.Utils.GetConfig("User");
        private readonly IStringLocalizer<DividingRoomHandler> _localizer;
        private readonly IJobService _jobService;
        private readonly IDapperUnitOfWork _dapper;

        public DividingRoomHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment hostingEnvironment, IEmailTemplateHandler emailTemplateHandler, IStringLocalizer<DividingRoomHandler> localizer,
            IJobService jobService, IDapperUnitOfWork dapper)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
            _emailTemplateHandler = emailTemplateHandler;
            _localizer = localizer;
            _jobService = jobService;
            _dapper = dapper;
        }
        public async Task<ResponseData> DivideExamRoom(SelectionCriterialModel model, string? accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var checkExistRecord = unitOfWork.Repository<SysDividingExamPlace>().Get(g => g.ExamScheduleTopikId == model.ExamScheduleTopikId && g.ExamPlaceId == model.ExamPlaceId)?.FirstOrDefault();
                if (checkExistRecord != null)
                {
                    return new ResponseDataObject<bool>(false, Code.BadRequest, "Địa điểm thi và kỳ thi đã tồn tại");
                }
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, $"ExamRoom?HeadQuarterId={model.ExamPlaceId}", accessToken != null ? accessToken : string.Empty);
                var headerQuaters = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + model.ExamPlaceId, accessToken != null ? accessToken : string.Empty);
                var areaQuery = await HttpHelper.Get<ResponseDataObject<AreaModel>>(apiBasicUriCatalog, "Area/" + model.ExamAreaId, accessToken != null ? accessToken : string.Empty);
                HeadQuarterModel headQuarter = new HeadQuarterModel();
                if (headerQuaters.Code == Code.Success && headerQuaters.Data != null)
                {
                    headQuarter = headerQuaters.Data;
                }
                List<ExamRoomModel> examRoom = new List<ExamRoomModel>();
                if (examRoomQuery.Code == Code.Success && examRoomQuery.Data != null)
                {
                    examRoom = examRoomQuery.Data.Where(g => g.IsShow).OrderBy(x => x.Order).ToList();
                }
                var manageRegisteredCandidateTopiks = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetQueryable(g =>
                model.ExamAreaId == g.AreaTest && model.ExamPlaceId == g.PlaceTest && model.ExamScheduleTopikId == g.TestScheduleId && (g.IsPaid.HasValue && g.IsPaid.Value == (int)Constant.StatusPaid.Paid)
            );
                var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().GetAll();
                var result = new List<SysUserProfileRegistered>();

                if (manageRegisteredCandidateTopiks != null && manageRegisteredCandidateTopiks.Count() > 0 && userProfileRegistereds != null && userProfileRegistereds.Count() > 0)
                {
                    result = (from manageRegisteredCandidateTopik in manageRegisteredCandidateTopiks
                              join userProfileRegistered in userProfileRegistereds on manageRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                              select userProfileRegistered
                              ).ToList();
                }

                switch (model.TypeOrdering)
                {
                    case (int)TypeOrdering.Name_Ascing:
                        result = result.OrderBy(g => g.LastName).ThenBy(l => l.FirstName).ToList();
                        break;
                    case (int)TypeOrdering.Name_Descing:
                        result = result.OrderByDescending(g => g.LastName).ThenByDescending(l => l.FirstName).ToList();
                        break;
                    case (int)TypeOrdering.Birthday_Ascing:
                        result = result.OrderBy(g => g.Month).ThenBy(g => g.Date).ToList();
                        break;
                    case (int)TypeOrdering.Birthday_Descing:
                        result = result.OrderByDescending(g => g.Month).ThenByDescending(g => g.Date).ToList();
                        break;
                    case (int)TypeOrdering.RegistrationDate_Ascing:
                        result = result.OrderBy(g => g.CreatedOnDate).ToList();
                        break;
                    case (int)TypeOrdering.RegistrationDate_Descing:
                        result = result.OrderByDescending(g => g.CreatedOnDate).ToList();
                        break;
                    default:
                        break;
                }

                SysDividingExamPlace entity = new SysDividingExamPlace()
                {
                    Id = Guid.NewGuid(),
                    ExamAreaId = model.ExamAreaId,
                    ExamAreaName = areaQuery.Code == Code.Success && areaQuery.Data != null ? areaQuery.Data.Name : "",
                    ExamPlaceId = model.ExamPlaceId,
                    ExamPlaceName = headerQuaters.Code == Code.Success && headerQuaters.Data != null ? headerQuaters.Data.Name : "",
                    ExamScheduleTopikId = model.ExamScheduleTopikId,
                    ExamScheduleTopikName = unitOfWork.Repository<SysExamScheduleTopik>().GetById(model.ExamScheduleTopikId)?.ExaminationName ?? "",
                    TypeOrdering = model.TypeOrdering
                };
                var dividingExamPlace = CreateDividingExamPlace(entity, examRoom);

                bool isComplete = await CreateDividingExamRoom(result, examRoom, entity.Id, headQuarter, accessToken);
                if (!isComplete)
                {
                    unitOfWork.Repository<SysDividingExamPlace>().Delete(entity);
                    unitOfWork.Save();
                    return new ResponseDataObject<bool>(isComplete, Code.BadRequest, "Hạn mức tiếp nhận của địa điểm đang thấp hơn số thí sinh đăng ký");
                }
                return new ResponseDataObject<bool>(isComplete, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }


        /// <summary>
        /// thực hiện tạo địa điểm thi khi chia phòng
        /// </summary>
        /// <returns></returns>
        private SysDividingExamPlace CreateDividingExamPlace(SysDividingExamPlace entity, List<ExamRoomModel> examRooms)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                int capacity = (int)(examRooms?.Sum(g => g.AcceptanceLimit) ?? 0);
                entity.Capacity = capacity;
                unitOfWork.Repository<SysDividingExamPlace>().Insert(entity);

                unitOfWork.Save();
                return entity;
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return default;
            }
        }

        /// <summary>
        /// thực hiện chia thí sinh vào các phòng
        /// </summary>
        /// <param name="manageRegisteredCandidateTopiks">danh sách thí sinh</param>
        /// <param name="examRooms">danh sách phòng</param>
        /// <param name="dividingExamPlaceId">Id địa điểm thi đã được chia</param>
        /// <returns></returns>
        private async Task<bool> CreateDividingExamRoom(List<SysUserProfileRegistered> manageRegisteredCandidateTopiks, List<ExamRoomModel> examRooms, Guid dividingExamPlaceId, HeadQuarterModel headQuarter, string? accessToken)
        {
            try
            {
                if (manageRegisteredCandidateTopiks == null || (manageRegisteredCandidateTopiks != null && manageRegisteredCandidateTopiks.Count() == 0))
                {
                    return false;
                }
                var examQuery = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam", accessToken != null ? accessToken : string.Empty);
                var areaQuery = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, $"Area", accessToken != null ? accessToken : string.Empty);
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                List<SysExamRoomDivided> entityExamRooms = new List<SysExamRoomDivided>();

                int roomIndex = 0;//biến để đọc thứ tự của phòng
                int manageRegisteredCandidateTopikIndex = 0;//biến đếm để chia thí sinh vào phòng
                int ordering = 0;//biến đọc số thứ tự

                List<SysUserProfileRegistered> whiteListContain = new List<SysUserProfileRegistered>();//Lưu danh sách thí sinh đặc biệt
                foreach (var manageRegisteredCandidateTopik in manageRegisteredCandidateTopiks)
                {
                    var manageRegisteredCandidateTopikEntity = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetById(manageRegisteredCandidateTopik.CandidateRegisterId);
                    if (manageRegisteredCandidateTopikEntity == null)
                    {
                        continue;
                    }
                    if (manageRegisteredCandidateTopikEntity != null && manageRegisteredCandidateTopik.IsDisabilities)
                    {
                        whiteListContain.Add(manageRegisteredCandidateTopik);
                        continue;
                    }

                    //nếu vẫn còn học sinh mà thiếu phòng
                    if (roomIndex >= examRooms.Count)
                    {
                        //break;//tiến hành không chia nữa và lưu lại thông tin của những học sinh đã được chia
                        return false;
                    }

                    string examCode = "";
                    string areaCode = "";
                    string headQuarterCode = headQuarter.RegistrationCode ?? "";
                    ordering++;
                    string strOrdering = string.Format("{0:0000}", ordering);
                    if (examQuery.Code == Code.Success && examQuery.Data != null)
                    {
                        examCode = examQuery.Data.FirstOrDefault(g => g.Id == manageRegisteredCandidateTopikEntity.ExamId)?.RegistrationCode ?? "";
                    }

                    if (areaQuery.Code == Code.Success && areaQuery.Data != null)
                    {
                        areaCode = areaQuery.Data.FirstOrDefault(g => g.Id == manageRegisteredCandidateTopikEntity.AreaTest)?.RegistrationCode ?? "";
                    }

                    //nếu chia đủ số thí sinh cho 1 phòng thì tiến hành chia cho phòng tiếp theo
                    if (manageRegisteredCandidateTopikIndex + 1 > examRooms[roomIndex].AcceptanceLimit)
                    {

                        if (roomIndex + 1 >= examRooms.Count)
                        {
                            //break;//tiến hành không chia nữa và lưu lại thông tin của những học sinh đã được chia
                            return false;
                        }
                        SysExamRoomDivided entityExamRoom = new SysExamRoomDivided()
                        {
                            Id = Guid.NewGuid(),
                            ExamRoomId = examRooms[roomIndex + 1].Id,
                            DividingExamPlaceId = dividingExamPlaceId,
                            Capacity = (int)examRooms[roomIndex + 1].AcceptanceLimit,
                            //ActualQuantity = manageRegisteredCandidateTopikIndex,
                            CandidateName = manageRegisteredCandidateTopik?.FullName ?? "",
                            CandidateBirthday = manageRegisteredCandidateTopik?.Birthday ?? null,
                            CandidateEmail = manageRegisteredCandidateTopik?.Email ?? "",
                            CandidateNumber = $"013{areaCode}{examCode}{headQuarterCode}{strOrdering}",
                            CandidatePhone = manageRegisteredCandidateTopik?.Phone ?? "",
                            UserProfileId = manageRegisteredCandidateTopikEntity?.UserProfileId ?? default,
                            LanguageSendMail = manageRegisteredCandidateTopik?.LanguageName ?? "ko",
                            CandidateRegisterId = manageRegisteredCandidateTopik.CandidateRegisterId

                        };
                        roomIndex++;//chuyển sang phòng tiếp theo
                        manageRegisteredCandidateTopikIndex = 0;//đồng thời reset bộ đếm thí sinh về mặc định
                                                                //nếu vẫn còn học sinh mà thiếu phòng
                        entityExamRooms.Add(entityExamRoom);

                    }
                    else
                    {
                        SysExamRoomDivided entityExamRoom = new SysExamRoomDivided()
                        {
                            Id = Guid.NewGuid(),
                            ExamRoomId = examRooms[roomIndex].Id,
                            DividingExamPlaceId = dividingExamPlaceId,
                            Capacity = (int)examRooms[roomIndex].AcceptanceLimit,
                            //ActualQuantity = manageRegisteredCandidateTopikIndex + 1,
                            CandidateName = manageRegisteredCandidateTopik?.FullName ?? "",
                            CandidateBirthday = manageRegisteredCandidateTopik?.Birthday ?? null,
                            CandidateEmail = manageRegisteredCandidateTopik?.Email ?? "",
                            CandidateNumber = $"013{areaCode}{examCode}{headQuarterCode}{strOrdering}",
                            CandidatePhone = manageRegisteredCandidateTopik?.Phone ?? "",
                            UserProfileId = manageRegisteredCandidateTopikEntity?.UserProfileId ?? default,
                            LanguageSendMail = manageRegisteredCandidateTopik?.LanguageName ?? "ko",
                            CandidateRegisterId = manageRegisteredCandidateTopik.CandidateRegisterId
                        };
                        entityExamRooms.Add(entityExamRoom);

                    }
                    manageRegisteredCandidateTopikIndex++;

                }

                //Tiến hành chia thí sinh đặc biệt vào phòng cuối
                //thí sinh đặc biệt luôn có số báo danh luôn luôn là số lẻ
                if (ordering % 2 == 0)
                {
                    ordering++;
                }
                else
                {
                    ordering += 2;
                }
                whiteListContain.ForEach(whiteListItem =>
                {
                    var manageRegisteredCandidateTopikEntity = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetById(whiteListItem.CandidateRegisterId);
                    string examCode = "";
                    string areaCode = "";
                    string headQuarterCode = headQuarter.RegistrationCode ?? "";

                    string strOrdering = string.Format("{0:0000}", ordering);
                    ordering += 2;
                    if (examQuery.Code == Code.Success && examQuery.Data != null)
                    {
                        examCode = examQuery.Data.FirstOrDefault(g => g.Id == manageRegisteredCandidateTopikEntity.ExamId)?.RegistrationCode ?? "";
                    }

                    if (areaQuery.Code == Code.Success && areaQuery.Data != null)
                    {
                        areaCode = areaQuery.Data.FirstOrDefault(g => g.Id == manageRegisteredCandidateTopikEntity.AreaTest)?.RegistrationCode ?? "";
                    }

                    SysExamRoomDivided entityExamRoom = new SysExamRoomDivided()
                    {
                        Id = Guid.NewGuid(),
                        ExamRoomId = examRooms[examRooms.Count() - 1].Id,
                        DividingExamPlaceId = dividingExamPlaceId,
                        Capacity = (int)examRooms[roomIndex].AcceptanceLimit,
                        //ActualQuantity = manageRegisteredCandidateTopikIndex + 1,
                        CandidateName = whiteListItem?.FullName ?? "",
                        CandidateBirthday = whiteListItem?.Birthday ?? null,
                        CandidateEmail = whiteListItem?.Email ?? "",
                        CandidateNumber = $"013{areaCode}{examCode}{headQuarterCode}{strOrdering}",
                        CandidatePhone = whiteListItem?.Phone ?? "",
                        UserProfileId = manageRegisteredCandidateTopikEntity?.UserProfileId ?? default,
                        LanguageSendMail = whiteListItem?.LanguageName ?? "ko",
                        CandidateRegisterId = manageRegisteredCandidateTopikEntity.Id
                    };
                    entityExamRooms.Add(entityExamRoom);
                });

                unitOfWork.Repository<SysExamRoomDivided>().InsertRange(entityExamRooms);
                unitOfWork.Save();
                return true;
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return false;
            }
        }

        /// <summary>
        /// Quản lý địa điểm đã được chia phòng
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<ResponseData> ManagementPlaceDividedExamRoom(SelectionCriterialModel model, string? accessToken, int pageIndex = 1, int pageSize = 10)
        {
            try
            {
                var headerQuaterQuerys = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : string.Empty);
                var areaQuerys = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, "Area", accessToken != null ? accessToken : string.Empty);

                List<HeadQuarterModel> headQuarters = new List<HeadQuarterModel>();
                if (headerQuaterQuerys != null && headerQuaterQuerys.Code == Code.Success && headerQuaterQuerys.Data != null)
                {
                    headQuarters = headerQuaterQuerys.Data;
                }
                List<AreaModel> areaExam = new List<AreaModel>();
                if (areaQuerys != null && areaQuerys.Code == Code.Success && areaQuerys.Data != null)
                {
                    areaExam = areaQuerys.Data;
                }
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                List<DividingExamPlaceModel> result = new List<DividingExamPlaceModel>();

                var examRoomDividedEntity = unitOfWork.Repository<SysExamRoomDivided>().GetAll();

                result = (from _dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet
                          join _examScheduleTopik in unitOfWork.Repository<SysExamScheduleTopik>().dbSet on _dividingExamPlace.ExamScheduleTopikId equals _examScheduleTopik.Id into defaultIfNull
                          from _examScheduleTopikNull in defaultIfNull.DefaultIfEmpty()
                          join _examPeriod in unitOfWork.Repository<SysExamPeriod>().dbSet on _examScheduleTopikNull.ExamPeriodId equals _examPeriod.Id into defaultExamPeriodIfNull
                          from _examPeriodNull in defaultExamPeriodIfNull.DefaultIfEmpty()
                          where (model.ExamAreaId == default(Guid) || model.ExamAreaId == _dividingExamPlace.ExamAreaId)
                           && (model.ExamPlaceId == default(Guid) || model.ExamPlaceId == _dividingExamPlace.ExamPlaceId)
                           && (model.ExamPeriodId == default(Guid) && _examPeriodNull != null && _examPeriodNull.IsCurrent || (model.ExamPeriodId != default(Guid) && _examPeriodNull != null && _examPeriodNull.Id == model.ExamPeriodId))
                           && (model.ExamScheduleTopikId == default(Guid) || model.ExamScheduleTopikId == _dividingExamPlace.ExamScheduleTopikId)
                           && (model.IsSendMail == (int)Constant.StatusSendMail.All || (model.IsSendMail == (int)Constant.StatusSendMail.Sent && _dividingExamPlace.IsSendMail == 1) || (model.IsSendMail == (int)Constant.StatusSendMail.Unsent && _dividingExamPlace.IsSendMail == 0))
                          select new DividingExamPlaceModel()
                          {
                              ExamScheduleTopikId = _dividingExamPlace.ExamScheduleTopikId,
                              Capacity = _dividingExamPlace.Capacity,
                              ExamAreaId = _dividingExamPlace.ExamAreaId,
                              ExamPlaceId = _dividingExamPlace.ExamPlaceId,
                              Id = _dividingExamPlace.Id,
                              ExamScheduleTopikName = _examScheduleTopikNull.ExaminationName,
                              IsSendMail = _dividingExamPlace.IsSendMail,
                              CreatedOnDate = _dividingExamPlace.CreatedOnDate,
                              TypeOrdering = _dividingExamPlace.TypeOrdering,
                              IsDisable = !_examPeriodNull.IsCurrent && !_examPeriodNull.Status
                          }
                          ).OrderByDescending(g => g.CreatedOnDate).Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList();

                result.ForEach(item =>
                {
                    item.ExamAreaName = areaExam.Where(g => g.Id == item.ExamAreaId)?.FirstOrDefault()?.Name ?? "";
                    item.ExamPlaceName = headQuarters.Where(g => g.Id == item.ExamPlaceId)?.FirstOrDefault()?.Name ?? "";
                    item.ActualQuantity = examRoomDividedEntity?.Where(g => g.DividingExamPlaceId == item.Id).Count() ?? 0;
                });

                int countTotal = (from _dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet
                                  join _examScheduleTopik in unitOfWork.Repository<SysExamScheduleTopik>().dbSet on _dividingExamPlace.ExamScheduleTopikId equals _examScheduleTopik.Id into defaultIfNull
                                  from _examScheduleTopikNull in defaultIfNull.DefaultIfEmpty()
                                  join _examPeriod in unitOfWork.Repository<SysExamPeriod>().dbSet on _examScheduleTopikNull.ExamPeriodId equals _examPeriod.Id into defaultExamPeriodIfNull
                                  from _examPeriodNull in defaultExamPeriodIfNull.DefaultIfEmpty()
                                  where (model.ExamAreaId == default(Guid) || model.ExamAreaId == _dividingExamPlace.ExamAreaId)
                                   && (model.ExamPlaceId == default(Guid) || model.ExamPlaceId == _dividingExamPlace.ExamPlaceId)
                                   && (model.ExamPeriodId == default(Guid) && _examPeriodNull != null && _examPeriodNull.IsCurrent || (model.ExamPeriodId != default(Guid) && _examPeriodNull != null && _examPeriodNull.Id == model.ExamPeriodId))
                                   && (model.ExamScheduleTopikId == default(Guid) || model.ExamScheduleTopikId == _dividingExamPlace.ExamScheduleTopikId)
                                   && (model.IsSendMail == (int)Constant.StatusSendMail.All || (model.IsSendMail == (int)Constant.StatusSendMail.Sent && _dividingExamPlace.IsSendMail == 1) || (model.IsSendMail == (int)Constant.StatusSendMail.Unsent && _dividingExamPlace.IsSendMail == 0))
                                  select new DividingExamPlaceModel()
                                  {
                                      Id = _dividingExamPlace.Id,
                                  }
                                 )?.Count() ?? 0;

                int totalPage = (int)Math.Ceiling((decimal)countTotal / pageSize);
                var pagination = new Pagination(pageIndex, pageSize, countTotal, totalPage);
                return new PageableData<List<DividingExamPlaceModel>>(result, pagination, Code.Success, "");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.ToString());
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        /// <summary>
        /// Thực hiện xóa danh sách phòng thi và địa điểm thi
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<ResponseData> DeleteManagementPlaceDividedExamRoom(Guid id, string? accessToken)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var dividingExamPlaceEntity = unitOfWork.Repository<SysDividingExamPlace>().GetById(id);
                if (dividingExamPlaceEntity == null)
                {
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy");
                }
                var examRoomDividedEntity = unitOfWork.Repository<SysExamRoomDivided>().Get(g => g.DividingExamPlaceId == id);

                unitOfWork.Repository<SysDividingExamPlace>().Delete(dividingExamPlaceEntity);
                // Create a queue to hold the records from the Excel file
                ConcurrentQueue<SysExamRoomDivided> queue = new ConcurrentQueue<SysExamRoomDivided>();

                WriteIntoQueue(examRoomDividedEntity?.ToList() ?? new List<SysExamRoomDivided>(), queue);
                // Create a number of worker threads to process the records in the queue
                int numThreads = 4;
                Thread[] threads = new Thread[numThreads];
                for (int i = 0; i < numThreads; i++)
                {
                    threads[i] = new Thread(() => ProcessQueue(queue));
                    threads[i].Start();
                }

                // Wait for the worker threads to complete
                for (int i = 0; i < numThreads; i++)
                {
                    threads[i].Join();
                }
                unitOfWork.Save();
                return new ResponseDataObject<bool>(true, Code.Success, "Xóa thành công");

            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.ToString());
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }


        /// <summary>
        /// Thực hiện đẩy vào queue
        /// </summary>
        /// <param name="models"></param>
        /// <param name="queue"></param>
        static void WriteIntoQueue(List<SysExamRoomDivided> models, ConcurrentQueue<SysExamRoomDivided> queue)
        {
            foreach (var examRoomDivided in models)
            {
                queue.Enqueue(examRoomDivided);
            }
        }

        /// <summary>
        /// Thực hiện các tác vụ với dữ liệu lấy từ queue
        /// </summary>
        /// <param name="queue"></param>
        private void ProcessQueue(ConcurrentQueue<SysExamRoomDivided> queue)
        {
            SysExamRoomDivided record;
            while (queue.TryDequeue(out record))
            {
                // Process the record
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                unitOfWork.Repository<SysExamRoomDivided>().Delete(record);
                unitOfWork.Save();
            }
        }

        /// <summary>
        /// Thực hiện check kỳ thi khi chọn địa điểm thi
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public async Task<ResponseData> CheckExamScheduleTopik(SelectionCriterialModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);

                var result = new List<DividingExamPlaceModel>();
                if (model != null)
                {
                    var dividingExamPlaceEntity = unitOfWork.Repository<SysDividingExamPlace>().Get(g => model.ExamPlaceId == g.ExamPlaceId);

                    if (dividingExamPlaceEntity != null && dividingExamPlaceEntity.Count() > 0)
                    {
                        result = _mapper.Map<List<DividingExamPlaceModel>>(dividingExamPlaceEntity);
                    }
                }
                return new ResponseDataObject<List<DividingExamPlaceModel>>(result, Code.Success, "");

            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.ToString());
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        /// <summary>
        /// Quản lý phòng thi theo địa điểm thi
        /// </summary>
        /// <param name="examPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> ManagementDividedExamRoom(Guid DividingExamPlaceId, Guid examPlaceId, int pageIndex = 1, int pageSize = 10, string? accessToken = "")
        {
            try
            {
                List<ExamRoomDividedModel> result = new List<ExamRoomDividedModel>();
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, $"ExamRoom?HeadQuarterId={examPlaceId}", accessToken != null ? accessToken : string.Empty);
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().Get(g => g.DividingExamPlaceId == DividingExamPlaceId);
                var dividingExamPlaceEntity = unitOfWork.Repository<SysDividingExamPlace>().GetById(DividingExamPlaceId);
                int countTotal = 0;

                if (examRoomDivided != null)
                {
                    var examRoomDividedGroupBy = examRoomDivided.GroupBy(g => new
                    {
                        ExamRoomId = g.ExamRoomId,
                        DividingExamPlaceId = g.DividingExamPlaceId,
                    },
                        g => new SysExamRoomDivided()
                        {
                            ExamRoomId = g.ExamRoomId,
                            DividingExamPlaceId = g.DividingExamPlaceId,
                            ActualQuantity = g.ActualQuantity,
                            Capacity = g.Capacity,
                            Id = g.Id,
                            UserProfileId = g.UserProfileId,
                        }, (key, g) => new SysExamRoomDivided()
                        {
                            ExamRoomId = key.ExamRoomId,
                            DividingExamPlaceId = key.DividingExamPlaceId,
                            ActualQuantity = g?.Count() ?? 0,
                            Capacity = g?.FirstOrDefault()?.Capacity ?? 0,
                        });

                    if (examRoomQuery.Code == Code.Success && examRoomQuery.Data != null)
                    {
                        var examRoomActive = examRoomQuery.Data;
                        countTotal = examRoomDividedGroupBy.Count();
                        //var examRoomOrder = examRoomQuery.Data?.OrderBy(g => g.Order)?.ToList() ?? new List<ExamRoomModel>();
                        //examRoomOrder.ForEach(item =>
                        //{
                        //    ExamRoomDividedModel model = new ExamRoomDividedModel()
                        //    {
                        //        ActualQuantity = examRoomDividedGroupBy?.Where(g => g.ExamRoomId == item.Id)?.FirstOrDefault()?.ActualQuantity ?? 0,
                        //        Capacity = examRoomDividedGroupBy?.Where(g => g.ExamRoomId == item.Id)?.FirstOrDefault()?.Capacity ?? 0,
                        //        ExamRoomId = item.Id,
                        //        DividingExamPlaceId = examRoomDividedGroupBy?.Where(g => g.ExamRoomId == item.Id)?.FirstOrDefault()?.DividingExamPlaceId ?? default(Guid),
                        //        ExamAreaName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamAreaName : "",
                        //        ExamPlaceName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamPlaceName : "",
                        //        ExamRoomName = item.Name,
                        //        ExamScheduleTopikName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamScheduleTopikName : "",
                        //    };

                        //    result.Add(model);
                        //});

                        result = (from examRoomDivideds in examRoomDividedGroupBy
                                  join rooms in examRoomActive on examRoomDivideds.ExamRoomId equals rooms.Id

                                  select new ExamRoomDividedModel()
                                  {
                                      ActualQuantity = examRoomDivideds?.ActualQuantity ?? 0,
                                      Capacity = examRoomDivideds?.Capacity ?? 0,
                                      ExamRoomId = examRoomDivideds.ExamRoomId,
                                      DividingExamPlaceId = examRoomDivideds?.DividingExamPlaceId ?? default(Guid),
                                      ExamAreaName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamAreaName : "",
                                      ExamPlaceName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamPlaceName : "",
                                      ExamRoomName = rooms?.Name ?? "",
                                      ExamScheduleTopikName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamScheduleTopikName : "",
                                      Order = rooms.Order
                                  }).OrderBy(g => g.Order).ToList();

                    }
                }

                int totalPage = (int)Math.Ceiling((decimal)countTotal / pageSize);
                var pagination = new Pagination(pageIndex, pageSize, countTotal, totalPage);
                return new PageableData<List<ExamRoomDividedModel>>(result.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList(), pagination, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }

        }

        /// <summary>
        /// Quản lý thí sinh theo kỳ thi và phòng thi
        /// </summary>
        /// <param name="DividingExamPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> ManagementDividedCandidate(Guid DividingExamPlaceId, Guid examRoomId, string? candidateName = "", string? candidatePhone = "", string? candidateEmail = "", int pageNumber = 1, int pageSize = 10, string? accessToken = "")
        {
            try
            {
                List<ExamRoomDividedModel> result = new List<ExamRoomDividedModel>();
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, $"ExamRoom/{examRoomId}", accessToken != null ? accessToken : string.Empty);
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                //var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().GetAll();
                var dividingExamPlaceEntity = unitOfWork.Repository<SysDividingExamPlace>().GetById(DividingExamPlaceId);
                //var manageRegisteredCandidateTopiks = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetQueryable(manageRegisteredCandidateTopik => manageRegisteredCandidateTopik.PlaceTest == dividingExamPlaceEntity.ExamPlaceId && manageRegisteredCandidateTopik.TestScheduleId == dividingExamPlaceEntity.ExamScheduleTopikId);


                var examRoomDividedEntitys = unitOfWork.Repository<SysExamRoomDivided>().GetQueryable(g => g.DividingExamPlaceId == DividingExamPlaceId && g.ExamRoomId == examRoomId);

                IQueryable<ExamRoomDividedModel> examRoomDivided = null;
                //if (manageRegisteredCandidateTopiks != null && userProfileRegistereds != null && examRoomDividedEntitys != null && dividingExamPlaceEntity != null)
                if (examRoomDividedEntitys != null && dividingExamPlaceEntity != null)
                {
                    examRoomDivided = (
                                       from examRoomDividedEntity in examRoomDividedEntitys
                                       join _dividingExamPlace in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDividedEntity.DividingExamPlaceId equals _dividingExamPlace.Id
                                       join _examScheduleTopik in unitOfWork.Repository<SysExamScheduleTopik>().dbSet on _dividingExamPlace.ExamScheduleTopikId equals _examScheduleTopik.Id into defaultIfNull
                                       from _examScheduleTopikNull in defaultIfNull.DefaultIfEmpty()
                                       join _examPeriod in unitOfWork.Repository<SysExamPeriod>().dbSet on _examScheduleTopikNull.ExamPeriodId equals _examPeriod.Id into defaultExamPeriodIfNull
                                       from _examPeriodNull in defaultExamPeriodIfNull.DefaultIfEmpty()
                                       where examRoomDividedEntity.DividingExamPlaceId == DividingExamPlaceId
                                       && (string.IsNullOrEmpty(candidateName) || (!string.IsNullOrEmpty(candidateName) && examRoomDividedEntity.CandidateName.ToLower().Contains(candidateName.Trim().ToLower())))
                                        && (string.IsNullOrEmpty(candidatePhone) || (!string.IsNullOrEmpty(candidatePhone) && examRoomDividedEntity.CandidatePhone.ToLower().Contains(candidatePhone.Trim().ToLower())))
                                        && (string.IsNullOrEmpty(candidateEmail) || (!string.IsNullOrEmpty(candidateEmail) && examRoomDividedEntity.CandidateEmail.ToLower().Contains(candidateEmail.Trim().ToLower())))
                                       select new ExamRoomDividedModel()
                                       {
                                           Id = examRoomDividedEntity.Id,
                                           UserProfileId = examRoomDividedEntity.UserProfileId,
                                           IsSendMail = examRoomDividedEntity.IsSendMail,
                                           CandidateNumber = examRoomDividedEntity.CandidateNumber,
                                           CandidateBirthday = examRoomDividedEntity.CandidateBirthday,
                                           CandidateEmail = examRoomDividedEntity.CandidateEmail,
                                           CandidatePhone = examRoomDividedEntity.CandidatePhone,
                                           CandidateName = examRoomDividedEntity.CandidateName,
                                           ExamRoomId = examRoomDividedEntity.ExamRoomId,
                                           LanguageSendMail = examRoomDividedEntity.LanguageSendMail,
                                           IsDisable = !_examPeriodNull.IsCurrent && !_examPeriodNull.Status
                                       }
                                      );
                    //examRoomDivided = (from examRoomDividedEntity in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                    //                   join dividingExamPlaceEntity1 in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDividedEntity.DividingExamPlaceId equals dividingExamPlaceEntity1.Id
                    //                   join manageRegisteredCandidateTopik in unitOfWork.Repository<SysManageRegisteredCandidateTopik>().dbSet on examRoomDividedEntity.UserProfileId equals manageRegisteredCandidateTopik.UserProfileId
                    //                   join userProfileRegistered in unitOfWork.Repository<SysUserProfileRegistered>().dbSet on manageRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                    //                   join examScheduleTopikEntity in unitOfWork.Repository<SysExamScheduleTopik>().dbSet on dividingExamPlaceEntity1.ExamScheduleTopikId equals examScheduleTopikEntity.Id
                    //                   where manageRegisteredCandidateTopik.AreaTest == dividingExamPlaceEntity.ExamAreaId && manageRegisteredCandidateTopik.PlaceTest == dividingExamPlaceEntity.ExamPlaceId
                    //                   && manageRegisteredCandidateTopik.TestScheduleId == dividingExamPlaceEntity.ExamScheduleTopikId
                    //                   && (manageRegisteredCandidateTopik.IsPaid.HasValue && manageRegisteredCandidateTopik.IsPaid.Value == (int)Constant.StatusPaid.Paid)
                    //                   && examRoomDividedEntity.DividingExamPlaceId == DividingExamPlaceId && examRoomDividedEntity.ExamRoomId == examRoomId
                    //                   select new SysExamRoomDivided()
                    //                   {
                    //                       Id = examRoomDividedEntity.Id,
                    //                       UserProfileId = examRoomDividedEntity.UserProfileId,
                    //                       IsSendMail = examRoomDividedEntity.IsSendMail,
                    //                       CandidateNumber = examRoomDividedEntity.CandidateNumber,
                    //                       CandidateBirthday = examRoomDividedEntity.CandidateBirthday,
                    //                       CandidateEmail = examRoomDividedEntity.CandidateEmail,
                    //                       CandidatePhone = examRoomDividedEntity.CandidatePhone,
                    //                       CandidateName = examRoomDividedEntity.CandidateName,
                    //                       ExamRoomId = examRoomDividedEntity.ExamRoomId,
                    //                       LanguageSendMail = examRoomDividedEntity.LanguageSendMail
                    //                   }
                    //                  );
                }

                if (examRoomDivided != null)
                {
                    if (examRoomDivided.Count() > 0)
                    {
                        result = examRoomDivided.OrderBy(g => g.CandidateNumber).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                        result.ForEach(item =>
                        {
                            item.ExamAreaName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamAreaName : "";
                            item.ExamPlaceName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamPlaceName : "";
                            item.ExamRoomName = examRoomQuery.Code == Code.Success && examRoomQuery.Data != null ? examRoomQuery.Data?.Name : "";
                            item.ExamScheduleTopikName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamScheduleTopikName : "";
                        });
                    }
                }

                int totalPage = (int)Math.Ceiling((decimal)(examRoomDivided?.Count() ?? 0) / pageSize);
                var pagination = new Pagination(pageNumber, pageSize, examRoomDivided?.Count() ?? 0, totalPage);
                return new PageableData<List<ExamRoomDividedModel>>(result.OrderByDescending(g => g.Capacity).ToList(), pagination, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }


        /// <summary>
        /// Xuất file danh sách thí sinh
        /// </summary>
        /// <param name="DividingExamPlaceId"></param>
        /// <param name="examRoomId"></param>
        /// <param name="candidateName"></param>
        /// <param name="candidatePhone"></param>
        /// <param name="candidateEmail"></param>
        /// <returns></returns>
        public async Task<ResponseDataObject<List<ExamRoomDividedModel>>> ExportExcelManagementDividedCandidate(Guid DividingExamPlaceId, Guid examRoomId, string? candidateName = "", string? candidatePhone = "", string? candidateEmail = "", string? accessToken = "")
        {
            try
            {
                List<ExamRoomDividedModel> result = new List<ExamRoomDividedModel>();
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, $"ExamRoom/{examRoomId}", accessToken != null ? accessToken : string.Empty);
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                //var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().Get(g => g.DividingExamPlaceId == DividingExamPlaceId && g.ExamRoomId == examRoomId
                //&& (string.IsNullOrEmpty(candidateName) || (!string.IsNullOrEmpty(candidateName) && g.CandidateName.ToLower().Contains(candidateName.Trim().ToLower())))
                //&& (string.IsNullOrEmpty(candidatePhone) || (!string.IsNullOrEmpty(candidatePhone) && g.CandidatePhone.ToLower().Contains(candidatePhone.Trim().ToLower())))
                //&& (string.IsNullOrEmpty(candidateEmail) || (!string.IsNullOrEmpty(candidateEmail) && g.CandidateEmail.ToLower().Contains(candidateEmail.Trim().ToLower())))
                //);
                //var dividingExamPlaceEntity = unitOfWork.Repository<SysDividingExamPlace>().GetById(DividingExamPlaceId);

                var queryJoin = (from managerRegisteredCandidateTopik in unitOfWork.Repository<SysManageRegisteredCandidateTopik>().dbSet
                                 join userProfileRegistered in unitOfWork.Repository<SysUserProfileRegistered>().dbSet on managerRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                                 join examRoomDivide in unitOfWork.Repository<SysExamRoomDivided>().dbSet on managerRegisteredCandidateTopik.UserProfileId equals examRoomDivide.UserProfileId
                                 join dividingExamPlaceEntity in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDivide.DividingExamPlaceId equals dividingExamPlaceEntity.Id
                                 where examRoomDivide.DividingExamPlaceId == DividingExamPlaceId && examRoomDivide.ExamRoomId == examRoomId
                                && (string.IsNullOrEmpty(candidateName) || (!string.IsNullOrEmpty(candidateName) && examRoomDivide.CandidateName.ToLower().Contains(candidateName.Trim().ToLower())))
                                 && (string.IsNullOrEmpty(candidatePhone) || (!string.IsNullOrEmpty(candidatePhone) && examRoomDivide.CandidatePhone.ToLower().Contains(candidatePhone.Trim().ToLower())))
                                 && (string.IsNullOrEmpty(candidateEmail) || (!string.IsNullOrEmpty(candidateEmail) && examRoomDivide.CandidateEmail.ToLower().Contains(candidateEmail.Trim().ToLower())))
                                 select new ExamRoomDividedModel()
                                 {
                                     ExamId = managerRegisteredCandidateTopik.ExamId,
                                     ExamAreaName = dividingExamPlaceEntity.ExamAreaName,
                                     ExamPlaceName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamPlaceName : "",
                                     ExamRoomName = examRoomQuery != null && examRoomQuery.Code == Code.Success && examRoomQuery.Data != null ? examRoomQuery.Data.Name : "",
                                     ExamScheduleTopikName = dividingExamPlaceEntity.ExamScheduleTopikName,
                                     CandidateNumber = examRoomDivide.CandidateNumber,
                                     CandidateName = examRoomDivide.CandidateName,
                                     CandidateKoreaName = userProfileRegistered.FullNameKorea,
                                     CandidateGender = userProfileRegistered.Sex == "man" ? 1 : userProfileRegistered.Sex == "woman" ? 2 : 0,
                                     CandidateBirthday = userProfileRegistered.Birthday,
                                     CandidateImageStr = userProfileRegistered.Image3x4
                                 });

                //if (examRoomDivided != null)
                //{
                //    if (examRoomDivided.Count() > 0)
                //    {
                //        result = _mapper.Map<List<ExamRoomDividedModel>>(examRoomDivided);
                //        result.ForEach(item =>
                //        {
                //            item.ExamAreaName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamAreaName : "";
                //            item.ExamPlaceName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamPlaceName : "";
                //            item.ExamRoomName = examRoomQuery.Code == Code.Success && examRoomQuery.Data != null ? examRoomQuery.Data?.Name : "";
                //            item.ExamScheduleTopikName = dividingExamPlaceEntity != null ? dividingExamPlaceEntity.ExamScheduleTopikName : "";
                //        });
                //    }
                //}

                result = queryJoin.OrderBy(g => g.CandidateNumber).ToList();

                return new ResponseDataObject<List<ExamRoomDividedModel>>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataObject<List<ExamRoomDividedModel>>(new List<ExamRoomDividedModel>(), Code.BadRequest, "");
            }
        }

        /// <summary>
        /// Gửi email thông báo SBD và phòng thi cho cả địa điểm thi
        /// </summary>
        /// <param name="dividingExamPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> SendMailCandidates(Guid dividingExamPlaceId, string accessToken)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().GetQueryable(g => g.DividingExamPlaceId == dividingExamPlaceId);
                var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().GetById(dividingExamPlaceId);
                if (dividingExamPlace == null)
                {
                    return new ResponseDataObject<bool>(false, Code.NotFound, $"Không tìm thấy dividingExamPlace có id: {dividingExamPlaceId}");
                }
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, $"ExamRoom?HeadQuarterId={dividingExamPlace.ExamPlaceId}", accessToken != null ? accessToken : string.Empty);
                //var examQuery = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam?isOpen=true", accessToken != null ? accessToken : string.Empty);
                var examQuery = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam", accessToken != null ? accessToken : string.Empty);
                var headerQuaterQuery = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, $"HeadQuarter?AreaId={dividingExamPlace.ExamAreaId}", accessToken != null ? accessToken : string.Empty);
                var areaQuery = await HttpHelper.Get<ResponseDataObject<List<AreaModel>>>(apiBasicUriCatalog, $"Area", accessToken != null ? accessToken : string.Empty);
                List<ExamRoomModel> examRooms = new List<ExamRoomModel>();
                List<ExamModel> exams = new List<ExamModel>();
                List<HeadQuarterModel> headerQuaters = new List<HeadQuarterModel>();
                List<AreaModel> areas = new List<AreaModel>();

                if (examRoomQuery != null && examRoomQuery.Code == Code.Success && examRoomQuery.Data != null)
                {
                    examRooms = examRoomQuery.Data;
                }
                if (examQuery != null && examQuery.Code == Code.Success && examQuery.Data != null)
                {
                    exams = examQuery.Data;
                }
                if (headerQuaterQuery != null && headerQuaterQuery.Code == Code.Success && headerQuaterQuery.Data != null)
                {
                    headerQuaters = headerQuaterQuery.Data;
                }
                if (areaQuery != null && areaQuery.Code == Code.Success && areaQuery.Data != null)
                {
                    areas = areaQuery.Data;
                }


                IQueryable<EmailGenerateTemplateModel> examRoomDividedResult = null;
                if (examRooms != null && exams != null && headerQuaters != null && examRoomDivided != null)
                {
                    examRoomDividedResult = (from examRoomDividedEntity in examRoomDivided
                                             join dividingExamPlaceEntity in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDividedEntity.DividingExamPlaceId equals dividingExamPlaceEntity.Id
                                             join manageRegisteredCandidateTopik in unitOfWork.Repository<SysManageRegisteredCandidateTopik>().dbSet on examRoomDividedEntity.UserProfileId equals manageRegisteredCandidateTopik.UserProfileId
                                             join userProfileRegistered in unitOfWork.Repository<SysUserProfileRegistered>().dbSet on manageRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                                             join examScheduleTopikEntity in unitOfWork.Repository<SysExamScheduleTopik>().dbSet on dividingExamPlaceEntity.ExamScheduleTopikId equals examScheduleTopikEntity.Id
                                             where manageRegisteredCandidateTopik.AreaTest == dividingExamPlace.ExamAreaId && manageRegisteredCandidateTopik.PlaceTest == dividingExamPlace.ExamPlaceId
                                             && manageRegisteredCandidateTopik.TestScheduleId == dividingExamPlace.ExamScheduleTopikId
                                             && examRoomDividedEntity.IsSendMail == 0
                                             && (manageRegisteredCandidateTopik.IsPaid.HasValue && manageRegisteredCandidateTopik.IsPaid.Value == (int)Constant.StatusPaid.Paid)
                                             select new EmailGenerateTemplateModel()
                                             {
                                                 SysExamRoomDivided = examRoomDividedEntity.Id,
                                                 CandidateNumber = examRoomDividedEntity.CandidateNumber,
                                                 Birthday = userProfileRegistered.Birthday.ToString("dd/MM/yyyy"),
                                                 ToEmail = userProfileRegistered.Email,
                                                 FullNameVietnamese = userProfileRegistered.FullName,
                                                 FullNameKorea = userProfileRegistered.FullNameKorea,
                                                 LanguageSendMail = examRoomDividedEntity.LanguageSendMail,
                                                 ExamId = manageRegisteredCandidateTopik.ExamId,
                                                 AreaName = dividingExamPlaceEntity.ExamAreaName,
                                                 PlaceName = dividingExamPlaceEntity.ExamPlaceName,
                                                 ExamPlaceId = manageRegisteredCandidateTopik.PlaceTest,
                                                 ExamAreaId = manageRegisteredCandidateTopik.AreaTest,
                                                 ExamRoomId = examRoomDividedEntity.ExamRoomId,
                                                 ExamDate = examScheduleTopikEntity.ExamDate.ToString("dd/MM/yyyy"),
                                                 TimeEndsToEnterExamRoom = examScheduleTopikEntity.NoteTimeEnterExamRoom ?? "",
                                                 ExamTime = examScheduleTopikEntity.ExamTime,
                                             }
                                      );
                }

                if (examRoomDividedResult != null && examRoomDividedResult.Count() > 0)
                {
                    if (dividingExamPlace != null)
                    {
                        dividingExamPlace.IsSendMail = 2;
                        unitOfWork.Repository<SysDividingExamPlace>().Update(dividingExamPlace);
                        unitOfWork.Save();
                    }

                    // Đưa background job vào ThreadPool để thực thi
                    var invalid = unitOfWork.Repository<SysCandidateInvalidTopik>().Get();
                    if (invalid != null)
                    {
                        var ids = invalid.Select(p => p.SBD);
                        examRoomDividedResult = examRoomDividedResult.Where(p => !ids.Contains(p.CandidateNumber));
                    }

                    BackgroundState<EmailGenerateTemplateModel> state = new BackgroundState<EmailGenerateTemplateModel>()
                    {
                        //HttpContextAccessor = _httpContextAccessor,
                        State = examRoomDividedResult?.ToList() ?? new List<EmailGenerateTemplateModel>(),
                        //EmailTemplate = _emailTemplateHandler,
                        //Localizer = _localizer,
                        examRooms = examRooms,
                        exams = exams,
                        headerQuaters = headerQuaters,
                        areas = areas
                    };

                    // Tạo một đối tượng Task để thực thi background job
                    var jobId = _jobService.Enqueue<ISendJobs>(x => x.SendMailJobAsync(state, dividingExamPlace.ExamPlaceName, dividingExamPlace.ExamScheduleTopikName, examRoomDividedResult.Count(), dividingExamPlace.Id, default));
                    //Task backgroundTask = Task.Run(() => BackgroundJobSendMail(state)); // có thể thay thế bằng Task.RunLongRunning
                    ////update trạng thái trong database
                    //examRoomDivided?.ToList().ForEach(item =>
                    //{
                    //    item.IsSendMail = true;
                    //    unitOfWork.Repository<SysExamRoomDivided>().Update(item);
                    //});

                    return new ResponseDataObject<bool>(true, Code.Success, "Quá trình gửi mail đang tiến hành, trạng thái gửi mail sẽ được cập nhật trong ít phút");

                }
                return new ResponseDataObject<bool>(false, Code.NotFound, "Không tìm thấy danh sách thí sinh");

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataObject<bool>(false, Code.BadRequest, "");
            }
        }

        /// <summary>
        /// Tạo backgroud chạy ngầm để gửi mail
        /// </summary>
        /// <param name="state"></param>
        //public static async Task BackgroundJobSendMail(object state)
        //{
        //    if (state != null)
        //    {
        //        BackgroundState<EmailGenerateTemplateModel> backgroundState = (BackgroundState<EmailGenerateTemplateModel>)state;
        //        List<EmailGenerateTemplateModel> sendMails = backgroundState?.State ?? new List<EmailGenerateTemplateModel>();
        //        List<ExamRoomModel> examRooms = backgroundState?.examRooms ?? new List<ExamRoomModel>();
        //        List<ExamModel> exams = backgroundState?.exams ?? new List<ExamModel>();
        //        List<HeadQuarterModel> headerQuaters = backgroundState?.headerQuaters ?? new List<HeadQuarterModel>();
        //        List<AreaModel> areas = backgroundState?.areas ?? new List<AreaModel>();
        //        var _localizer = backgroundState.Localizer;
        //        var _emailTemplateHandler = backgroundState.EmailTemplate;
        //        IHttpContextAccessor httpContextAccessor = backgroundState.HttpContextAccessor;
        //        using UnitOfWork unitOfWork = new(httpContextAccessor);


        // Thời gian nghỉ giữa các lần gửi (tính bằng mili giây)
        //int delay = 5000;
        //foreach (var item in sendMails)
        //{
        //    ExamRoomModel examRoomModel = new ExamRoomModel();
        //    string examRoomName = "";
        //    if (examRooms != null && examRooms.Count > 0)
        //    {
        //        examRoomModel = examRooms.FirstOrDefault(g => g.Id == item.ExamRoomId);
        //    }
        //    AreaModel areaModel = new AreaModel();
        //    string areaName = "";
        //    if (areas != null && areas.Count > 0)
        //    {
        //        areaModel = areas.FirstOrDefault(g => g.Id == item.ExamAreaId);
        //    }
        //    HeadQuarterModel headQuarterModel = new HeadQuarterModel();
        //    string headQuarterName = "";
        //    if (headerQuaters != null && headerQuaters.Count > 0)
        //    {
        //        headQuarterModel = headerQuaters.FirstOrDefault(g => g.Id == item.ExamPlaceId);
        //    }

        //            var culture = new CultureInfo("ko-KR");

        //            if (!string.IsNullOrEmpty(item.LanguageSendMail))
        //            {
        //                switch (item.LanguageSendMail)
        //                {
        //                    case "vi":
        //                        areaName = areaModel?.Name ?? "";
        //                        headQuarterName = headQuarterModel?.Name ?? "";
        //                        examRoomName = examRoomModel?.Name ?? "";
        //                        culture = new CultureInfo("vi-VN");
        //                        break;
        //                    case "ko":
        //                        areaName = areaModel?.KoreaName ?? "";
        //                        headQuarterName = headQuarterModel?.KoreaName ?? "";
        //                        examRoomName = examRoomModel?.NameInKorean ?? "";
        //                        culture = new CultureInfo("ko-KR");
        //                        break;
        //                    case "en":
        //                        areaName = areaModel?.EnglishName ?? "";
        //                        headQuarterName = headQuarterModel?.EnglishName ?? "";
        //                        examRoomName = examRoomModel?.NameInEnglish ?? "";
        //                        culture = new CultureInfo("en-US");
        //                        break;
        //                    default:
        //                        culture = new CultureInfo("ko-KR");
        //                        break;
        //                }
        //            }
        //            Thread.CurrentThread.CurrentCulture = culture;
        //            Thread.CurrentThread.CurrentUICulture = culture;
        //            EmailGenerateTemplateModel emailGenerateTemplateModel = new EmailGenerateTemplateModel()
        //            {
        //                TitleFullNameVietnamese = _localizer["TitleFullNameVietnamese"],
        //                TitleFullNameKorea = _localizer["TitleFullNameKorea"],
        //                TitleBirthday = _localizer["TitleBirthday"],
        //                TitleCandidateNumber = _localizer["TitleCandidateNumber"],
        //                TitleExamName = _localizer["TitleExamName"],
        //                TitleAreaName = _localizer["TitleAreaName"],
        //                TitlePlaceName = _localizer["TitlePlaceName"],
        //                TitleAddressPlaceName = _localizer["TitleAddressPlaceName"],
        //                TitleCandidateRoom = _localizer["TitleCandidateRoom"],
        //                TitleExamDate = _localizer["TitleExamDate"],
        //                TitleTimeEndsToEnterExamRoom = _localizer["TitleTimeEndsToEnterExamRoom"],
        //                TitleExamTime = _localizer["TitleExamTime"],
        //                FullNameVietnamese = item.FullNameVietnamese,
        //                FullNameKorea = item.FullNameKorea,
        //                Birthday = item.Birthday,
        //                CandidateNumber = item.CandidateNumber,
        //                ExamName = exams.FirstOrDefault(g => g.Id == item.ExamId)?.Name ?? "",
        //                AreaName = areaName,
        //                PlaceName = headQuarterName,
        //                AddressPlaceName = headerQuaters.FirstOrDefault(g => g.Id == item.ExamPlaceId)?.Address ?? "",
        //                CandidateRoom = examRoomName,
        //                ExamDate = item.ExamDate,
        //                TimeEndsToEnterExamRoom = item.TimeEndsToEnterExamRoom ?? "",
        //                ExamTime = item.ExamTime,
        //                TitleMailSBD = _localizer["TitleMailSBD"],
        //                GreetingMailSBD = string.Format(_localizer["GreetingMailSBD"], item.FullNameVietnamese),
        //                TextLinkMailSBD = _localizer["TextLinkMailSBD"],
        //                ContentMailSBD1 = _localizer["ContentMailSBD1"],
        //                ContentMailSBD2 = _localizer["ContentMailSBD2"],
        //                ContentMailSBD3 = _localizer["ContentMailSBD3"],
        //                ContentMailSBD4 = _localizer["ContentMailSBD4"],
        //                ContentMailSBD5 = _localizer["ContentMailSBD5"],
        //                ContentMailSBD6 = _localizer["ContentMailSBD6"],
        //                ContentMailSBD7 = _localizer["ContentMailSBD7"],
        //                ContentMailSBD8 = _localizer["ContentMailSBD8"],
        //                ContentMailSBD9 = _localizer["ContentMailSBD9"],
        //                ContentMailSBD10 = _localizer["ContentMailSBD10"],
        //                ContentMailSBD11 = _localizer["ContentMailSBD11"],
        //                ContentMailSBD12 = _localizer["ContentMailSBD12"],
        //            };
        //            string templateBody = _emailTemplateHandler.GenerateEmailTemplate("email-confirmation", emailGenerateTemplateModel);

        //            // Gửi email
        //            try
        //            {
        //                var request = (new EmailRequest()
        //                {
        //                    Body = templateBody,
        //                    HTMLBody = templateBody,
        //                    Subject = _localizer["TitleMailSBD"],
        //                    //ToEmail = new List<string>() { item.ToEmail },
        //                    //ToAddress = item.ToEmail,
        //                    ToEmail = new List<string>() { "nguyenducmanh2017603373@gmail.com" },
        //                    ToAddress = "nguyenducmanh2017603373@gmail.com",
        //                });
        //                var res = await _emailTemplateHandler.SendOneZetaEmail(request);

        //                //client.Send(message);
        //                if (res.Code == Code.Success)
        //                {
        //                    var itemUpdate = unitOfWork.Repository<SysExamRoomDivided>().GetById(item.SysExamRoomDivided);
        //                    if (itemUpdate != null)
        //                    {
        //                        itemUpdate.IsSendMail = true;
        //                        unitOfWork.Repository<SysExamRoomDivided>().InsertOrUpdate(itemUpdate);
        //                    }
        //                }

        //            }
        //            catch (Exception ex)
        //            {
        //                Log.Error(ex, ex.Message);
        //                //Console.WriteLine($"Gửi mail {item.CandidateName} error");
        //            }

        //            // Chờ một khoảng thời gian trước khi gửi email cho người tiếp theo
        //            //Thread.Sleep(delay);
        //        }

        //    }

        //}

        /// <summary>
        /// Gửi email thông báo SBD và phòng thi cho 1 thí sinh
        /// </summary>
        /// <param name="dividingExamPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> SendMailCandidate(Guid examRoomDividedId, string accessToken)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().GetById(examRoomDividedId);
                if (examRoomDivided == null)
                {
                    return new ResponseDataObject<bool>(false, Code.NotFound, "Không tìm thấy danh sách thí sinh");
                }
                if (unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) != null)
                {
                    return new ResponseDataObject<bool>(false, Code.Forbidden, "Thí sinh nằm trong danh sách không hợp lệ");
                }
                var manageRegisteredCandidateTopiks = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetQueryable(g => g.UserProfileId == examRoomDivided.UserProfileId)?.FirstOrDefault();
                if (manageRegisteredCandidateTopiks != null)
                {
                    var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().GetQueryable(g => g.CandidateRegisterId == manageRegisteredCandidateTopiks.Id)?.FirstOrDefault();
                    examRoomDivided.CandidateName = userProfileRegistereds?.FullName ?? "";
                    examRoomDivided.CandidateEmail = userProfileRegistereds?.Email ?? "";
                }
                ConcurrentQueue<RegisterUserEmailModel> queue = new ConcurrentQueue<RegisterUserEmailModel>();

                WriteIntoQueueToSendMail(new List<SysExamRoomDivided>() { examRoomDivided }, queue);
                // Create a number of worker threads to process the records in the queue
                int numThreads = 2;
                Thread[] threads = new Thread[numThreads];
                for (int i = 0; i < numThreads; i++)
                {
                    threads[i] = new Thread(async () => await ProcessQueueSendMail(queue, accessToken));
                    threads[i].Start();
                }

                // Wait for the worker threads to complete
                for (int i = 0; i < numThreads; i++)
                {
                    threads[i].Join();
                }
                if (examRoomDivided != null)
                {
                    examRoomDivided.IsSendMail = 1;
                    unitOfWork.Repository<SysExamRoomDivided>().Update(examRoomDivided);
                    unitOfWork.Save();
                }
                var candidateInExamPlace = unitOfWork.Repository<SysExamRoomDivided>().Get(g => g.DividingExamPlaceId == examRoomDivided.DividingExamPlaceId);
                if (candidateInExamPlace != null && candidateInExamPlace.Count() > 0)
                {
                    int checkSendCompleteCandidateInExamPlace = candidateInExamPlace.Where(g => g.IsSendMail == 1)?.Count() ?? 0;
                    if (checkSendCompleteCandidateInExamPlace == candidateInExamPlace.Count())
                    {
                        var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().GetById(examRoomDivided.DividingExamPlaceId);
                        if (dividingExamPlace != null)
                        {
                            dividingExamPlace.IsSendMail = 1;
                        }
                    }
                }
                unitOfWork.Save();
                return new ResponseDataObject<bool>(true, Code.Success, "Gửi email thành công");

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataObject<bool>(false, Code.BadRequest, "");
            }
        }

        /// <summary>
        /// Thực hiện đẩy vào queue
        /// </summary>
        /// <param name="models"></param>
        /// <param name="queue"></param>
        static void WriteIntoQueueToSendMail(List<SysExamRoomDivided> models, ConcurrentQueue<RegisterUserEmailModel> queue)
        {
            foreach (var examRoomDivided in models)
            {
                RegisterUserEmailModel emailModel = new RegisterUserEmailModel()
                {
                    UserName = examRoomDivided.CandidateName,
                    ToEmail = examRoomDivided.CandidateEmail,
                    Id = examRoomDivided.Id,
                    LanguageSendMail = examRoomDivided.LanguageSendMail
                };
                queue.Enqueue(emailModel);
            }
        }

        /// <summary>
        /// Thực hiện các tác vụ với dữ liệu lấy từ queue để gửi mail
        /// </summary>
        /// <param name="queue"></param>
        private async Task ProcessQueueSendMail(ConcurrentQueue<RegisterUserEmailModel> queue, string accessToken)
        {
            try
            {
                RegisterUserEmailModel eMailModel;
                while (queue.TryDequeue(out eMailModel))
                {
                    // Process the record
                    string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
                    string tmplFolder = Path.Combine(baseDirectory, "EmailTemplates");
                    string filePath = Path.Combine(tmplFolder, "ho_so.jpg");

                    using UnitOfWork unitOfWork = new(_httpContextAccessor);
                    var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().GetById(eMailModel.Id);
                    if (examRoomDivided == null)
                    {
                        break;
                    }
                    var examRoomQuery = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, $"ExamRoom/{examRoomDivided.ExamRoomId}", accessToken != null ? accessToken : string.Empty);
                    string candidateRoom = "";
                    ExamRoomModel examRoomModel = new ExamRoomModel();
                    if (examRoomQuery != null && examRoomQuery.Code == Code.Success)
                    {
                        examRoomModel = examRoomQuery.Data ?? new ExamRoomModel();
                    }
                    var dividingExamPlaceEntity = unitOfWork.Repository<SysDividingExamPlace>().GetById(examRoomDivided.DividingExamPlaceId);

                    if (dividingExamPlaceEntity == null)
                    {
                        break;
                    }
                    var examScheduleTopikEntity = unitOfWork.Repository<SysExamScheduleTopik>().GetById(dividingExamPlaceEntity.ExamScheduleTopikId);
                    if (examScheduleTopikEntity == null)
                    {
                        break;
                    }
                    var examQuery = await HttpHelper.Get<ResponseDataObject<ExamModel>>(apiBasicUriCatalog, $"Exam/{examScheduleTopikEntity.ExamId}", accessToken != null ? accessToken : string.Empty);
                    string examName = "";
                    if (examQuery != null && examQuery.Code == Code.Success)
                    {
                        examName = examQuery.Data?.Name ?? "";
                    }

                    var areaQuery = await HttpHelper.Get<ResponseDataObject<AreaModel>>(apiBasicUriCatalog, "Area/" + dividingExamPlaceEntity.ExamAreaId, accessToken != null ? accessToken : string.Empty);
                    AreaModel areaModel = new AreaModel();
                    string areaName = "";
                    if (areaQuery != null && areaQuery.Code == Code.Success)
                    {
                        areaModel = areaQuery.Data ?? new AreaModel();
                    }

                    var headerQuaters = await HttpHelper.Get<ResponseDataObject<HeadQuarterModel>>(apiBasicUriCatalog, "HeadQuarter/" + dividingExamPlaceEntity.ExamPlaceId, accessToken != null ? accessToken : string.Empty);
                    HeadQuarterModel headQuarterModel = new HeadQuarterModel();
                    string headQuarterName = "";
                    if (headerQuaters != null && headerQuaters.Code == Code.Success)
                    {
                        headQuarterModel = headerQuaters.Data ?? new HeadQuarterModel();
                    }

                    string linkGoogleMapDefault = "https://topik.iigvietnam.com/ko/location-exam/";
                    var culture = new CultureInfo("ko-KR");

                    if (examRoomDivided != null)
                    {
                        switch (eMailModel.LanguageSendMail)
                        {
                            case "vi":
                                areaName = areaModel?.Name ?? "";
                                headQuarterName = headQuarterModel?.Name ?? "";
                                candidateRoom = examRoomModel?.Name ?? "";
                                culture = new CultureInfo("vi-VN");
                                linkGoogleMapDefault = "https://topik.iigvietnam.com/vi/location-exam/";
                                break;
                            case "ko":
                                areaName = areaModel?.KoreaName ?? "";
                                headQuarterName = headQuarterModel?.KoreaName ?? "";
                                candidateRoom = examRoomModel?.NameInKorean ?? "";
                                culture = new CultureInfo("ko-KR");
                                linkGoogleMapDefault = "https://topik.iigvietnam.com/ko/location-exam/";
                                break;
                            case "en":
                                areaName = areaModel?.EnglishName ?? "";
                                headQuarterName = headQuarterModel?.EnglishName ?? "";
                                candidateRoom = examRoomModel?.NameInEnglish ?? "";
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

                    var candidateInforReceiveEmail = (
                       from manageRegisteredCandidateTopik in unitOfWork.Repository<SysManageRegisteredCandidateTopik>().dbSet
                       join userProfileRegistered in unitOfWork.Repository<SysUserProfileRegistered>().dbSet on manageRegisteredCandidateTopik.Id equals userProfileRegistered.CandidateRegisterId
                       where manageRegisteredCandidateTopik.AreaTest == dividingExamPlaceEntity.ExamAreaId && manageRegisteredCandidateTopik.PlaceTest == dividingExamPlaceEntity.ExamPlaceId
                           && manageRegisteredCandidateTopik.TestScheduleId == dividingExamPlaceEntity.ExamScheduleTopikId && manageRegisteredCandidateTopik.UserProfileId == examRoomDivided.UserProfileId
                       select new EmailGenerateTemplateModel()
                       {
                           //UrlImage = Utils.ConvertImageIntoBase64(filePath),
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
                           FullNameVietnamese = userProfileRegistered.FullName,
                           FullNameKorea = userProfileRegistered.FullNameKorea,
                           Birthday = userProfileRegistered.Birthday.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                           CandidateNumber = examRoomDivided.CandidateNumber,
                           ExamName = examName,
                           AreaName = areaName,
                           PlaceName = headQuarterName,
                           AddressPlaceName = headQuarterModel.Address ?? "",
                           CandidateRoom = candidateRoom,
                           ExamDate = examScheduleTopikEntity.ExamDate.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                           TimeEndsToEnterExamRoom = examScheduleTopikEntity.NoteTimeEnterExamRoom ?? "",
                           ExamTime = examScheduleTopikEntity.ExamTime,
                           TitleMailSBD = _localizer["TitleMailSBD"],
                           GreetingMailSBD = string.Format(_localizer["GreetingMailSBD"], userProfileRegistered.FullName),
                           TextLinkMailSBD = _localizer["TextLinkMailSBD"],
                           ContentMailSBD1 = _localizer["ContentMailSBD1"],
                           ContentMailSBD2 = _localizer["ContentMailSBD2"],
                           ContentMailSBD3 = _localizer["ContentMailSBD3"],
                           ContentMailSBD4 = _localizer["ContentMailSBD4"],
                           ContentMailSBD5 = _localizer["ContentMailSBD5"],
                           ContentMailSBD6 = _localizer["ContentMailSBD6"],
                           ContentMailSBD7 = _localizer["ContentMailSBD7"],
                           ContentMailSBD8 = string.Format(_localizer["ContentMailSBD8"], headQuarterModel.LinkGoogleMap ?? linkGoogleMapDefault),
                           ContentMailSBD9 = _localizer["ContentMailSBD9"],
                           ContentMailSBD10 = _localizer["ContentMailSBD10"],
                           ContentMailSBD11 = _localizer["ContentMailSBD11"],
                           ContentMailSBD12 = _localizer["ContentMailSBD12"],
                       }
                       )?.FirstOrDefault();
                    string templateBody = _emailTemplateHandler.GenerateEmailTemplate("email-confirmation", candidateInforReceiveEmail);

                    var email = new EmailRequest()
                    {
                        ToAddress = eMailModel.ToEmail,
                        Body = templateBody,
                        HTMLBody = templateBody,
                        Subject = _localizer["TitleMailSBD"],
                        ToEmail = new List<string> { eMailModel.ToEmail }
                    };
                    var res = await _emailTemplateHandler.SendOneZetaEmail(email);
                    //bool sendMessage = SendMessageWithEmbeddedImages(email, filePath, _emailTemplateHandler);

                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                throw ex;
            }
        }


        public static bool SendMessageWithEmbeddedImages(EmailRequest request, string filePath, IEmailTemplateHandler emailTemplate)
        {
            string htmlMessage = request.Body;
            //SmtpClient client = new SmtpClient("smtp.office365.com");
            //client.Port = 587;
            //client.Credentials = new NetworkCredential("system@iigvietnam.edu.vn", "IigPM@2022");
            //client.EnableSsl = true;

            //MailAddress.TryCreate("system@iigvietnam.edu.vn", out MailAddress mailAddress);
            //MailMessage msg = new MailMessage()
            //{
            //    Sender = mailAddress,
            //    From = mailAddress,
            //};
            //foreach (var item in request.ToEmail)
            //{
            //    msg.To.Add(item);
            //}
            //// Create the HTML view  
            //AlternateView htmlView = AlternateView.CreateAlternateViewFromString(
            //                                             htmlMessage,
            //                                             Encoding.UTF8,
            //                                             MediaTypeNames.Text.Html);
            // Create a plain text message for client that don't support HTML  

            ////*********cái này để đính kèm file
            //string mediaType = MediaTypeNames.Image.Jpeg;
            //LinkedResource img = new LinkedResource(filePath, mediaType);
            //// Make sure you set all these values!!!  
            //img.ContentId = "EmbeddedContent_1";
            //img.ContentType.MediaType = mediaType;
            //img.TransferEncoding = TransferEncoding.Base64;
            //img.ContentType.Name = img.ContentId;
            //img.ContentLink = new Uri("cid:" + img.ContentId);
            //htmlView.LinkedResources.Add(img);
            //msg.AlternateViews.Add(htmlView);
            //msg.IsBodyHtml = true;
            //msg.Subject = request.Subject;
            //client.Send(msg);

            emailTemplate.SendEmail(new EmailRequest()
            {
                Body = request.Body,
                Subject = request.Subject,
                ToEmail = request.ToEmail
            });

            return true;
        }


        /// <summary>
        /// Gửi email thông báo SBD và phòng thi cho 1 thí sinh
        /// </summary>
        /// <param name="dividingExamPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> UpdateCandidateNumberAndMoveCandidateRoom(Guid examRoomDividedId, ExamRoomDividedModel model, string? accessToken = "")
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().GetById(examRoomDividedId);
                if (examRoomDivided == null)
                {
                    return new ResponseDataObject<bool>(false, Code.NotFound, "Không tìm thấy danh sách thí sinh");
                }
                var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().GetById(examRoomDivided.DividingExamPlaceId);
                if (dividingExamPlace == null)
                {
                    return new ResponseDataObject<bool>(false, Code.BadRequest, "Không tồn tại địa này trong danh sách chia số báo danh");
                }
                //var checkExistCandidateNumber = unitOfWork.Repository<SysExamRoomDivided>().Get(g => g.CandidateNumber == model.CandidateNumber && g.Id != examRoomDividedId)?.FirstOrDefault();
                //if (checkExistCandidateNumber != null)
                //{
                //    return new ResponseDataObject<bool>(false, Code.NotFound, "Số báo danh đã tồn tại trong danh sách");
                //}
                if (unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) != null)
                {
                    return new ResponseDataObject<bool>(false, Code.Forbidden, "Thí sinh nằm trong danh sách không hợp lệ");
                }

                //thực hiện check xem phòng thi đã đầy chưa
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<ExamRoomModel>>(apiBasicUriCatalog, $"ExamRoom/{model.ExamRoomId}", accessToken != null ? accessToken : string.Empty);
                if (examRoomQuery != null && examRoomQuery.Data != null && examRoomQuery.Data.IsShow)
                {
                    //số lượng thí sinh hiện tại trong phòng, phòng này phải khác phòng của thí sinh đang ở hiện tại
                    int countCandidates = unitOfWork.Repository<SysExamRoomDivided>().Count(g => g.ExamRoomId == model.ExamRoomId && g.DividingExamPlaceId == dividingExamPlace.Id && g.ExamRoomId != examRoomDivided.ExamRoomId);
                    if (countCandidates == examRoomQuery.Data.AcceptanceLimit)
                    {
                        return new ResponseDataObject<bool>(false, Code.BadRequest, "Phòng thi đã đủ người, không thể thêm thí sinh");
                    }
                }
                else
                {
                    return new ResponseDataObject<bool>(false, Code.BadRequest, "Phòng thi không tồn tại");
                }

                examRoomDivided.CandidateNumber = model.CandidateNumber;
                examRoomDivided.ExamRoomId = model.ExamRoomId;

                unitOfWork.Save();
                return new ResponseDataObject<bool>(true, Code.Success, "Cập nhật SBD và chuyển phòng thi thành công");

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataObject<bool>(false, Code.BadRequest, exception.Message);
            }
        }

        /// <summary>
        /// Gửi email thông báo SBD và phòng thi cho 1 thí sinh
        /// </summary>
        /// <param name="dividingExamPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> CheckSlotRoom(Guid dividingExamPlaceId, string? accessToken = "")
        {
            try
            {
                List<ExamRoomModel> result = new List<ExamRoomModel>();
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var dividingExamPlace = unitOfWork.Repository<SysDividingExamPlace>().GetById(dividingExamPlaceId);
                if (dividingExamPlace == null)
                {
                    return new ResponseDataObject<bool>(false, Code.BadRequest, "Không tồn tại địa này trong danh sách chia số báo danh");
                }
                var examRoomQuery = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, $"ExamRoom?HeadQuarterId={dividingExamPlace.ExamPlaceId}", accessToken != null ? accessToken : string.Empty);
                var examRoomDividedEntity = unitOfWork.Repository<SysExamRoomDivided>().Get();

                if (examRoomQuery != null && examRoomQuery.Data != null && examRoomQuery.Data.Count() > 0)
                {
                    examRoomQuery.Data.Where(g => g.IsShow).OrderBy(x => x.Order).ToList().ForEach(item =>
                    {
                        int countCandidates = examRoomDividedEntity.Count(g => g.ExamRoomId == item.Id && g.DividingExamPlaceId == dividingExamPlace.Id);//số lượng thí sinh hiện tại trong phòng
                        if (countCandidates < item.AcceptanceLimit)
                        {
                            result.Add(item);
                        }
                    });

                }
                return new ResponseDataObject<List<ExamRoomModel>>(result, Code.Success, "Thành công");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataObject<bool>(false, Code.BadRequest, exception.Message);
            }
        }

        /// <summary>
        /// Quản lý thí sinh theo kỳ thi và phòng thi
        /// </summary>
        /// <param name="DividingExamPlaceId"></param>
        /// <returns></returns>
        public async Task<ResponseData> SearchCandidate(Guid? ExamPeriodId, Guid? ExamScheduleTopikId, string? candidateName = "", string? candidatePhone = "", string? candidateEmail = "", int pageNumber = 1, int pageSize = 10, string? accessToken = "")
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                string @whereExamPeriod = "1 = 1";
                string @whereExamScheduleTopikId = "1 = 1";
                @whereExamPeriod = !ExamPeriodId.HasValue ? "_examPeriod.IsCurrent" : $"_examPeriod.Id = '{ExamPeriodId}'";
                @whereExamScheduleTopikId = !ExamScheduleTopikId.HasValue ? "1 = 1" : $"'{ExamScheduleTopikId}' = dividingExamPlaceEntity.ExamScheduleTopikId";
                string queryData = $"select examRoomDividedEntity.Id,examRoomDividedEntity.UserProfileId,examRoomDividedEntity.IsSendMail,\r\nexamRoomDividedEntity.CandidateNumber,examRoomDividedEntity.CandidateBirthday,examRoomDividedEntity.CandidateEmail,examRoomDividedEntity.CandidatePhone,\r\nexamRoomDividedEntity.CandidateName,examRoomDividedEntity.ExamRoomId,examRoomDividedEntity.DividingExamPlaceId,dividingExamPlaceEntity.ExamAreaName,\r\ndividingExamPlaceEntity.ExamScheduleTopikName,dividingExamPlaceEntity.ExamPlaceName\r\nfrom SysExamRoomDivided examRoomDividedEntity\r\ninner join SysDividingExamPlace dividingExamPlaceEntity on examRoomDividedEntity.DividingExamPlaceId = dividingExamPlaceEntity.Id\r\ninner join ManageRegisteredCandidateTopik manageRegisteredCandidateTopik on examRoomDividedEntity.UserProfileId = manageRegisteredCandidateTopik.UserProfileId\r\nleft join ExamScheduleTopiks _examScheduleTopik on dividingExamPlaceEntity.ExamScheduleTopikId = _examScheduleTopik.Id\r\nleft join ExamPeriod _examPeriod on _examScheduleTopik.ExamPeriodId = _examPeriod.Id\r\nWHERE examRoomDividedEntity.CandidateName like N'%{candidateName}%' \r\nand examRoomDividedEntity.CandidatePhone like N'%{candidatePhone}%'\r\nand examRoomDividedEntity.CandidateEmail like N'%{candidateEmail}%'\r\nand manageRegisteredCandidateTopik.IsPaid = {(int)Constant.StatusPaid.Paid}\r\nand ({@whereExamPeriod})\r\nand ({whereExamScheduleTopikId}) ORDER BY ManageRegisteredCandidateTopik.CreatedOnDate desc\r\nOFFSET {(pageNumber - 1) * pageSize} ROWS\r\nFETCH NEXT {pageSize} ROWS ONLY";
                string queryCount = $"select count(*) \r\nfrom SysExamRoomDivided examRoomDividedEntity\r\ninner join SysDividingExamPlace dividingExamPlaceEntity on examRoomDividedEntity.DividingExamPlaceId = dividingExamPlaceEntity.Id\r\ninner join ManageRegisteredCandidateTopik manageRegisteredCandidateTopik on examRoomDividedEntity.UserProfileId = manageRegisteredCandidateTopik.UserProfileId\r\nleft join ExamScheduleTopiks _examScheduleTopik on dividingExamPlaceEntity.ExamScheduleTopikId = _examScheduleTopik.Id\r\nleft join ExamPeriod _examPeriod on _examScheduleTopik.ExamPeriodId = _examPeriod.Id\r\nWHERE examRoomDividedEntity.CandidateName like N'%{candidateName}%' \r\nand examRoomDividedEntity.CandidatePhone like N'%{candidatePhone}%'\r\nand examRoomDividedEntity.CandidateEmail like N'%{candidateEmail}%'\r\nand manageRegisteredCandidateTopik.IsPaid = {(int)Constant.StatusPaid.Paid}\r\nand ({@whereExamPeriod})\r\nand ({whereExamScheduleTopikId})";
                var examRoomDivided = await _dapper.GetRepository().QueryAsync<ExamRoomDividedModel>(queryData);

                //var queryData = (from examRoomDividedEntity in unitOfWork.Repository<SysExamRoomDivided>().dbSet
                //                 join dividingExamPlaceEntity in unitOfWork.Repository<SysDividingExamPlace>().dbSet on examRoomDividedEntity.DividingExamPlaceId equals dividingExamPlaceEntity.Id
                //                 join manageRegisteredCandidateTopik in unitOfWork.Repository<SysManageRegisteredCandidateTopik>().dbSet on examRoomDividedEntity.UserProfileId equals manageRegisteredCandidateTopik.UserProfileId
                //                 join _examScheduleTopik in unitOfWork.Repository<SysExamScheduleTopik>().dbSet on dividingExamPlaceEntity.ExamScheduleTopikId equals _examScheduleTopik.Id into defaultIfNull
                //                 from _examScheduleTopikNull in defaultIfNull.DefaultIfEmpty()
                //                 join _examPeriod in unitOfWork.Repository<SysExamPeriod>().dbSet on _examScheduleTopikNull.ExamPeriodId equals _examPeriod.Id into defaultExamPeriodIfNull
                //                 from _examPeriodNull in defaultExamPeriodIfNull.DefaultIfEmpty()
                //                 where (string.IsNullOrEmpty(candidateName) || (!string.IsNullOrEmpty(candidateName) && examRoomDividedEntity.CandidateName.ToLower().Contains(candidateName.Trim().ToLower())))
                //                       && (string.IsNullOrEmpty(candidatePhone) || (!string.IsNullOrEmpty(candidatePhone) && examRoomDividedEntity.CandidatePhone.ToLower().Contains(candidatePhone.Trim().ToLower())))
                //                       && (string.IsNullOrEmpty(candidateEmail) || (!string.IsNullOrEmpty(candidateEmail) && examRoomDividedEntity.CandidateEmail.ToLower().Contains(candidateEmail.Trim().ToLower())))
                //                       && (manageRegisteredCandidateTopik.IsPaid.HasValue && manageRegisteredCandidateTopik.IsPaid.Value == (int)Constant.StatusPaid.Paid)
                //                       && ((!ExamPeriodId.HasValue && _examPeriodNull != null && _examPeriodNull.IsCurrent) || (ExamPeriodId.HasValue && _examPeriodNull != null && _examPeriodNull.Id == ExamPeriodId))
                //                       && (!ExamScheduleTopikId.HasValue || (ExamScheduleTopikId.HasValue && ExamScheduleTopikId == dividingExamPlaceEntity.ExamScheduleTopikId))
                //                 select new ExamRoomDividedModel()
                //                 {
                //                     Id = examRoomDividedEntity.Id,
                //                     UserProfileId = examRoomDividedEntity.UserProfileId,
                //                     IsSendMail = examRoomDividedEntity.IsSendMail,
                //                     CandidateNumber = examRoomDividedEntity.CandidateNumber,
                //                     CandidateBirthday = examRoomDividedEntity.CandidateBirthday,
                //                     CandidateEmail = examRoomDividedEntity.CandidateEmail,
                //                     CandidatePhone = examRoomDividedEntity.CandidatePhone,
                //                     CandidateName = examRoomDividedEntity.CandidateName,
                //                     ExamRoomId = examRoomDividedEntity.ExamRoomId,
                //                     DividingExamPlaceId = examRoomDividedEntity.DividingExamPlaceId,
                //                     ExamAreaName = dividingExamPlaceEntity.ExamAreaName,
                //                     ExamScheduleTopikName = dividingExamPlaceEntity.ExamScheduleTopikName,
                //                     ExamPlaceName = dividingExamPlaceEntity.ExamPlaceName,

                //                 });

                //var examRoomDivided = queryData.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();


                //int totalCount = queryData.Count();
                int totalCount = await _dapper.GetRepository().QuerySingleOrDefaultAsync<int>(queryCount);
                int totalPage = (int)Math.Ceiling((decimal)(totalCount) / pageSize);
                var pagination = new Pagination(pageNumber, pageSize, totalCount, totalPage);
                return new PageableData<IEnumerable<ExamRoomDividedModel>>(examRoomDivided, pagination, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        /// <summary>
        /// Gửi email test thông báo SBD cho danh sách liên hệ tự tạo
        /// </summary>
        /// <param name="ids"></param>
        /// <returns></returns>
        public async Task<ResponseData> SendMailTestCandidates(Guid examRoomDividedId, IEnumerable<Guid> ids, string? accessToken = "")
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var examRoomDivided = unitOfWork.Repository<SysExamRoomDivided>().GetById(examRoomDividedId);
                var records = unitOfWork.Repository<SysUserReceiveEmailTest>().Get(g => ids.Contains(g.Id));

                if (examRoomDivided == null)
                {
                    return new ResponseDataObject<bool>(false, Code.NotFound, "Không tìm thấy danh sách thí sinh");
                }
                if (unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(p => p.SBD == examRoomDivided.CandidateNumber) != null)
                {
                    return new ResponseDataObject<bool>(false, Code.Forbidden, "Thí sinh nằm trong danh sách không hợp lệ");
                }
                List<SysExamRoomDivided> listReceiveMail = new List<SysExamRoomDivided>();
                var manageRegisteredCandidateTopiks = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetQueryable(g => g.UserProfileId == examRoomDivided.UserProfileId)?.FirstOrDefault();
                if (manageRegisteredCandidateTopiks != null && records != null && records.Count() > 0)
                {
                    var userProfileRegistereds = unitOfWork.Repository<SysUserProfileRegistered>().GetQueryable(g => g.CandidateRegisterId == manageRegisteredCandidateTopiks.Id)?.FirstOrDefault();
                    foreach (var item in records)
                    {
                        SysExamRoomDivided sysExamRoomDividedInfor = new SysExamRoomDivided()
                        {
                            Id = examRoomDivided.Id,
                            CandidateName = userProfileRegistereds?.FullName ?? "",
                            CandidateEmail = item?.Email ?? "",
                            LanguageSendMail = item.LanguageSendMail ?? "",
                        };
                        listReceiveMail.Add(sysExamRoomDividedInfor);
                    }
                }
                ConcurrentQueue<RegisterUserEmailModel> queue = new ConcurrentQueue<RegisterUserEmailModel>();

                WriteIntoQueueToSendMail(listReceiveMail, queue);
                // Create a number of worker threads to process the records in the queue
                int numThreads = 2;
                Thread[] threads = new Thread[numThreads];
                for (int i = 0; i < numThreads; i++)
                {
                    threads[i] = new Thread(async () => await ProcessQueueSendMail(queue, accessToken));
                    threads[i].Start();
                }

                // Wait for the worker threads to complete
                for (int i = 0; i < numThreads; i++)
                {
                    threads[i].Join();
                }
                // Đưa background job vào ThreadPool để thực thi

                //BackgroundState<SysUserReceiveEmailTest> state = new BackgroundState<SysUserReceiveEmailTest>()
                //{
                //    HttpContextAccessor = _httpContextAccessor,
                //    State = records?.ToList() ?? new List<SysUserReceiveEmailTest>(),
                //    EmailTemplate = _emailTemplateHandler,
                //    Localizer = _localizer,
                //};
                //// Tạo một đối tượng Task để thực thi background job
                //Task backgroundTask = Task.Run(() => BackgroundJobSendMailTest(state));

                unitOfWork.Save();
                return new ResponseDataObject<bool>(true, Code.Success, "Quá trình gửi mail đang tiến hành, trạng thái gửi mail sẽ được cập nhật trong ít phút");

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataObject<bool>(false, Code.BadRequest, "");
            }
        }

    }
}
