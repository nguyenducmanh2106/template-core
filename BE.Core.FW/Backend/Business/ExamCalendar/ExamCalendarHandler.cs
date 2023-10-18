using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using Serilog;
using System.Globalization;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.ExamCalendar
{
    public class ExamCalendarHandler : IExamCalendarHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private static readonly string apiBasicUriCatalog = Utils.GetConfig("Catalog");

        public ExamCalendarHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(ExamCalendarModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                model.Id = Guid.NewGuid();
                unitOfWork.Repository<SysExamCalendar>().Insert(_mapper.Map<SysExamCalendar>(model));

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysExamCalendar>().FirstOrDefault(x => x.Id == id);
                var checkUse = unitOfWork.Repository<SysExamCalendar>().FirstOrDefault(p => p.Id == id && p.CreatedOnDate > DateTime.Now);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                unitOfWork.Repository<SysExamCalendar>().Delete(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData DeleteMany(List<string> ids)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existNavs = unitOfWork.Repository<SysExamCalendar>().Get(x => ids.Contains(x.Id.ToString()));
                if (existNavs.Count() > 0)
                {
                    foreach (var item in existNavs)
                    {
                        unitOfWork.Repository<SysExamCalendar>().Delete(item);
                    }
                }

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> Get(Guid? areaId, Guid? headerQuarter, Guid? exam, string? dateReceive, string? dateAccept, string? accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysExamCalendar>().Get();
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                    data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.HeaderQuarterId));
                else
                    data = data.Where(p => p.Id == Guid.Empty);

                if (areaId != null)
                {
                    var headQuaters = await HttpHelper.Get<ResponseDataObject<List<HeadQuarterModel>>>(apiBasicUriCatalog, "HeadQuarter", accessToken != null ? accessToken : "");
                    if (headQuaters != null && headQuaters.Data != null && headQuaters.Data.Count > 0)
                    {
                        var ids = headQuaters.Data.Where(p => p.AreaId == areaId).Select(p => p.Id);
                        data = data.Where(p => ids.Contains(p.HeaderQuarterId));
                    }
                }
                //if (exam != null)
                //    data = data.Where(p => p.ExamId == exam);
                if (headerQuarter != null)
                    data = data.Where(p => p.HeaderQuarterId == headerQuarter);
                if (!string.IsNullOrEmpty(dateReceive))
                {
                    var date = dateReceive.Split(",");
                    DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data = data.Where(p => p.DateTest >= dateConvert1 && p.DateTest <= dateConvert2);
                }
                if (!string.IsNullOrEmpty(dateAccept))
                {
                    var date = dateAccept.Split(",");
                    DateTime dateConvert1 = DateTime.ParseExact(date[0], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    DateTime dateConvert2 = DateTime.ParseExact(date[1], "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data = data.Where(p => p.DateTest >= dateConvert1 && p.DateTest <= dateConvert2);
                }
                var examIds = string.Join(", ", data.Select(p => p.ExamId).Distinct());
                var examGet = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, "Exam/GetByListId?ids=" + string.Join(",", examIds), accessToken != null ? accessToken : "");
                var exams = new List<ExamModel>();
                if (examGet != null && examGet.Data != null)
                {
                    exams = examGet.Data;
                }
                var result = new List<ExamCalendarModel>();
                foreach (var item in data)
                {
                    var examSe = exams.FirstOrDefault(p => p.Id.ToString().ToLower() == item.ExamId.ToLower());
                    var test = unitOfWork.Repository<SysManageRegisteredCandidateIT>().Count(p => p.StatusPaid == (int)StatusPaid.Paid && p.ExamRegistedData.ToLower().Contains(item.Id.ToString().ToLower()));
                    result.Add(new ExamCalendarModel
                    {
                        Id = item.Id,
                        DateTest = item.DateTest,
                        HeaderQuarterId = item.HeaderQuarterId,
                        ExamId = item.ExamId,
                        ExamShift = item.ExamShift,
                        Room = item.Room,
                        Status = item.Status,
                        TimeTest = item.TimeTest,
                        Note = item.Note,
                        EndDateRegister = item.EndDateRegister,
                        QuantityCandidate = item.QuantityCandidate,
                        Registed = (examSe != null && examSe.ExamForm == 2) ? unitOfWork.Repository<SysManageRegisteredCandidateIT>().Count(p => p.StatusPaid == (int)StatusPaid.Paid && p.ExamRegistedData.ToLower().Contains(item.Id.ToString().ToLower())) : unitOfWork.Repository<SysManageRegisteredCandidates>().Count(p => p.ExamScheduleId == item.Id)
                    });
                }
                return new ResponseDataObject<List<ExamCalendarModel>>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetById(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysExamCalendar>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                var result = new ExamCalendarModel
                {
                    Id = existData.Id,
                    DateTest = existData.DateTest,
                    HeaderQuarterId = existData.HeaderQuarterId,
                    ExamId = existData.ExamId,
                    ExamShift = existData.ExamShift,
                    Room = existData.Room,
                    Status = existData.Status,
                    TimeTest = existData.TimeTest,
                    Note = existData.Note,
                    EndDateRegister = existData.EndDateRegister,
                    QuantityCandidate = existData.QuantityCandidate,
                };
                return new ResponseDataObject<ExamCalendarModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ExamCalendarModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysExamCalendar>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Id = model.Id;
                exist.DateTest = model.DateTest;
                exist.HeaderQuarterId = model.HeaderQuarterId;
                exist.ExamId = model.ExamId;
                exist.ExamShift = model.ExamShift;
                exist.Room = model.Room;
                exist.Status = model.Status;
                exist.TimeTest = model.TimeTest;
                exist.Note = model.Note;
                exist.EndDateRegister = model.EndDateRegister;
                exist.QuantityCandidate = model.QuantityCandidate;

                unitOfWork.Repository<SysExamCalendar>().Update(exist);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
    }
}
