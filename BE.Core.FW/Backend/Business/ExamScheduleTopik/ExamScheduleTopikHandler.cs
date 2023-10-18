using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using Microsoft.Extensions.Options;
using Serilog;
using Shared.Caching.Interface;
using System;
using System.Globalization;
using System.Text.Json;

namespace Backend.Business.ExamScheduleTopik
{
    public class ExamScheduleTopikHandler : IExamScheduleTopikHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly HttpClient client = new();
        private readonly string catalogServiceUrl = "";
        private readonly ICached _cached;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");

        public ExamScheduleTopikHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, ICached cached)
        {
            _mapper = mapper;
            _cached = cached;
            _httpContextAccessor = httpContextAccessor;
            catalogServiceUrl = Utils.GetConfig("Catalog.Service");
        }

        public ResponseData Create(ExamScheduleTopikModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var existName = unitOfWork.Repository<SysExamScheduleTopik>().Get(x => x.ExaminationName == model.ExaminationName).FirstOrDefault();
                if (existName != null)
                {
                    return new ResponseData(Code.BadRequest, "Tên lịch thi đã tồn tại");
                }

                model.Id = Guid.NewGuid();
                var sysExamScheduleTopik = new SysExamScheduleTopik();
                sysExamScheduleTopik.EnglishName = model.EnglishName;
                sysExamScheduleTopik.ExaminationName = !string.IsNullOrEmpty(model.ExaminationName) ? model.ExaminationName : string.Empty;
                sysExamScheduleTopik.KoreaName = model.KoreaName;
                sysExamScheduleTopik.ExamWorkShiftId = model.ExamWorkShiftId;
                sysExamScheduleTopik.ExamTime = !string.IsNullOrEmpty(model.ExamTime) ? model.ExamTime : string.Empty;
                sysExamScheduleTopik.ExamId = model.ExamId;
                sysExamScheduleTopik.ExamPeriodId = model.ExamPeriodId;
                sysExamScheduleTopik.Note = model.Note;
                sysExamScheduleTopik.Public = model.Public;
                sysExamScheduleTopik.NoteTimeEnterExamRoom = model.NoteTimeEnterExamRoom;
                sysExamScheduleTopik.Status = model.Status;
                sysExamScheduleTopik.ExamDate = DateTime.ParseExact(model.ExamDate, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date;
                sysExamScheduleTopik.StartRegister = DateTime.ParseExact(model.StartRegister, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date;
                sysExamScheduleTopik.EndRegister = DateTime.ParseExact(model.EndRegister, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date;
                unitOfWork.Repository<SysExamScheduleTopik>().Insert(sysExamScheduleTopik);

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
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var examScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().GetById(id);
                if (examScheduleTopik != null)
                {
                    var existRegister = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(x => x.TestScheduleId == examScheduleTopik.Id).FirstOrDefault();
                    if (existRegister != null)
                    {
                        return new ResponseData(Code.NotFound, "Kỳ thi đã có thí sinh đăng ký");
                    }
                    unitOfWork.Repository<SysExamScheduleTopik>().Delete(examScheduleTopik);
                    unitOfWork.Save();
                    return new ResponseData(Code.Success, "");
                }
                return new ResponseData(Code.NotFound, "Không tồn tại lịch thi của bài thi Topik");
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
                var examScheduleTopiks = unitOfWork.Repository<SysExamScheduleTopik>().Get(x => ids.Contains(x.Id.ToString()));
                if (examScheduleTopiks.Count() > 0)
                {
                    foreach (var item in examScheduleTopiks)
                    {
                        unitOfWork.Repository<SysExamScheduleTopik>().Delete(item);
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

        public ResponseData Get(Guid? examId, bool? isCong, int? status, Guid? examPeriodId)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    PropertyNameCaseInsensitive = true,
                };
                string keyCache = $"ExamScheduleTopik" + examId.ToString();

                var checkKeyExist = _cached.CheckKeyExist(keyCache);
                if (checkKeyExist)
                {
                    var dataFromRedis = _cached.Get<string>(keyCache);
                    var dataResult = JsonSerializer.Deserialize<ResponseDataObject<List<ExamScheduleTopikModel>>>(dataFromRedis, options);
                    if (dataResult != null)
                    {
                        dataResult.Message = "Data from Redis";
                        return dataResult;
                    }
                }
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysExamScheduleTopik>().Get();
                if (status != null)
                    data = data.Where(p => p.Status == status).ToList();
                if (isCong != null)
                    data = data.Where(p => p.StartRegister.Date <= DateTime.Now.Date && p.EndRegister.Date >= DateTime.Now.Date).ToList();
                if (examId.HasValue)
                    data = data.Where(p => p.ExamId == examId).ToList();
                if (examPeriodId.HasValue)
                    data = data.Where(p => p.ExamPeriodId == examPeriodId).ToList();

                data = data.OrderBy(x => x.LastModifiedOnDate).Reverse();

                var result = new List<ExamScheduleTopikModel>();
                foreach (var item in data)
                {
                    var model = _mapper.Map<ExamScheduleTopikModel>(item);
                    model.ExamDate = item.ExamDate.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
                    result.Add(model);
                }
                var dataSerialize = JsonSerializer.Serialize(new ResponseDataObject<List<ExamScheduleTopikModel>>(result, Code.Success, ""), options);
                _cached.Add(keyCache, dataSerialize, 10);
                return new ResponseDataObject<List<ExamScheduleTopikModel>>(result, Code.Success, "");
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
                var data = unitOfWork.Repository<SysExamScheduleTopik>().GetById(id);
                if (data == null)
                {
                    return new ResponseData(Code.NotFound, "Không tồn tại bản ghi lịch thi Topik");
                }
                return new ResponseDataObject<ExamScheduleTopikModel>(_mapper.Map<ExamScheduleTopikModel>(data), Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ExamScheduleTopikModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysExamScheduleTopik>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                exist.ExaminationName = string.IsNullOrEmpty(model.ExaminationName) ? string.Empty : model.ExaminationName;
                exist.ExamDate = DateTime.ParseExact(model.ExamDate, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date;
                exist.ExamTime = string.IsNullOrEmpty(model.ExamTime) ? string.Empty : model.ExamTime;
                exist.ExamId = model.ExamId;
                exist.ExamWorkShiftId = model.ExamWorkShiftId;

                exist.Status = model.Status;
                exist.Public = model.Public;
                exist.StartRegister = DateTime.ParseExact(model.StartRegister, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date;
                exist.EndRegister = DateTime.ParseExact(model.EndRegister, "dd/MM/yyyy", CultureInfo.InvariantCulture).Date;

                exist.Note = model.Note;
                exist.EnglishName = model.EnglishName;
                exist.KoreaName = model.KoreaName;
                exist.ExamPeriodId = model.ExamPeriodId;
                exist.NoteTimeEnterExamRoom = model.NoteTimeEnterExamRoom;

                unitOfWork.Repository<SysExamScheduleTopik>().Update(exist);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public Stream DownloadImportTemplate() => File.OpenRead(Path.Combine(Environment.CurrentDirectory, "TemplateExcel", "Blacklist_import_template.xlsx"));
    }
}
