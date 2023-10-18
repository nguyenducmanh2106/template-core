using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Linq;

namespace Backend.Business
{
    public class ExamScheduleAPHandler : IExamScheduleAPHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExamScheduleAPHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(ExamScheduleAPModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var entity = _mapper.Map<SysExamScheduleAP>(model);
                entity.Id = Guid.NewGuid();
                unitOfWork.Repository<SysExamScheduleAP>().Insert(entity);

                foreach (var examId in model.ExamId)
                {
                    unitOfWork.Repository<SysExamScheduleDetailAP>().Insert(new SysExamScheduleDetailAP
                    {
                        Id = Guid.NewGuid(),
                        ExamId = examId,
                        ExamScheduleId = entity.Id
                    });
                }

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(IEnumerable<Guid> ids)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var dataEntitiesInDb = unitOfWork.Repository<SysExamScheduleAP>().Get(x => ids.Contains(x.Id));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                var examScheduleDetail = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(detail => ids.Contains(detail.ExamScheduleId));

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysExamScheduleAP>().Delete(item);

                foreach (var item in examScheduleDetail)
                    unitOfWork.Repository<SysExamScheduleDetailAP>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(ExamScheduleAPSearchModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var scheduleQuery = unitOfWork.Repository<SysExamScheduleAP>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Name))
                    scheduleQuery = scheduleQuery.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));
                if (model.ExamDate.HasValue)
                    scheduleQuery = scheduleQuery.Where(item => item.ExamDate.Date == model.ExamDate.Value.Date);

                var listSchedule = scheduleQuery.OrderBy(x => x.ExamDate).ToList();

                var listScheduleDetail = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(item => listSchedule.Select(schedule => schedule.Id).Contains(item.ExamScheduleId));

                return new ResponseDataObject<IEnumerable<ExamScheduleAPModel>>
                {
                    Data = listSchedule.GroupJoin(listScheduleDetail, schedule => schedule.Id, detail => detail.ExamScheduleId, (schedule, detail) => new ExamScheduleAPModel
                    {
                        Id = schedule.Id,
                        ExamDate = schedule.ExamDate,
                        ExamPeriodId = schedule.ExamPeriodId,
                        ExamTime = schedule.ExamTime,
                        ExamWorkShiftId = schedule.ExamWorkShiftId,
                        IsOpen = schedule.IsOpen,
                        Name = schedule.Name,
                        ExamId = detail.Select(item => item.ExamId)
                    })
                };
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
                var data = unitOfWork.Repository<SysExamScheduleAP>().GetById(id);
                if (data == null)
                {
                    return new ResponseData(Code.NotFound, "Không tồn tại bản ghi lịch thi Topik");
                }
                return new ResponseDataObject<ExamScheduleAPModel>(_mapper.Map<ExamScheduleAPModel>(data), Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetExamIdInPeriod(Guid examPeriodId, Guid? examScheduleId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var scheduleQuery = unitOfWork.Repository<SysExamScheduleAP>().GetQueryable(item => item.ExamPeriodId == examPeriodId);
                if (examScheduleId.HasValue)
                    scheduleQuery = scheduleQuery.Where(item => item.Id != examScheduleId);

                var listScheduleId = scheduleQuery.Select(item => item.Id);

                var scheduleDetailQuery = unitOfWork.Repository<SysExamScheduleDetailAP>().GetQueryable(item => listScheduleId.Contains(item.ExamScheduleId));
                return new ResponseDataObject<IEnumerable<Guid>>
                {
                    Data = scheduleDetailQuery.Select(item => item.ExamId).ToList()
                };
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ExamScheduleAPModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysExamScheduleAP>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                exist.Name = model.Name;
                exist.ExamDate = model.ExamDate;
                exist.ExamWorkShiftId = model.ExamWorkShiftId;
                exist.ExamTime = model.ExamTime;
                exist.ExamPeriodId = model.ExamPeriodId;
                exist.IsOpen = model.IsOpen;

                unitOfWork.Repository<SysExamScheduleAP>().Update(exist);

                var oldExamScheduleDetail = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(item => item.ExamScheduleId == model.Id);
                var listOldExamId = oldExamScheduleDetail.Select(item => item.ExamId);
                var listExamIdDelete = listOldExamId.Except(model.ExamId);
                var listExamIdAdd = model.ExamId.Except(listOldExamId);

                foreach (var examId in listExamIdDelete)
                {
                    var oldExamSchedule = oldExamScheduleDetail.First(item => item.ExamId == examId);
                    var isExamScheduleRegistered = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstQueryable(item => item.ScheduleDetailIds.Contains(oldExamSchedule.Id.ToString()));
                    if(isExamScheduleRegistered != null)
                        return new ResponseDataError(Code.BadRequest, "Không cập nhật được do bài thi đã được đăng ký");

                    unitOfWork.Repository<SysExamScheduleDetailAP>().Delete(oldExamSchedule);
                }

                foreach (var examId in listExamIdAdd)
                {
                    unitOfWork.Repository<SysExamScheduleDetailAP>().Insert(new SysExamScheduleDetailAP
                    {
                        Id = Guid.NewGuid(),
                        ExamId = examId,
                        ExamScheduleId = model.Id
                    });
                }

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetFromPortal(ExamScheduleAPSearchModel model, string accessToken, string tenant)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var scheduleQuery = unitOfWork.Repository<SysExamScheduleAP>().GetQueryable(item => item.IsOpen);
                var examPeriodQuery = unitOfWork.Repository<SysExamPeriodAP>().FirstOrDefault(item => item.IsOpen);
                var listExam = (await HttpHelper.Get<ResponseDataObject<IEnumerable<ExamModel>>>(Utils.GetConfig("Catalog"), "Exam", accessToken, tenant)).Data ?? Enumerable.Empty<ExamModel>();
                listExam = listExam.Where(item => item.CanRegister);
                var listExamWorkShift = (await HttpHelper.Get<ResponseDataObject<IEnumerable<ExamWorkShiftModel>>>(Utils.GetConfig("Catalog"), "ExamWorkShift", accessToken, tenant)).Data;

                if (!string.IsNullOrEmpty(model.Name))
                    scheduleQuery = scheduleQuery.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));
                if (model.ExamDate.HasValue)
                    scheduleQuery = scheduleQuery.Where(item => item.ExamDate.Date == model.ExamDate.Value.Date);

                var listSchedule = scheduleQuery.Where(item => examPeriodQuery != null && item.ExamPeriodId == examPeriodQuery.Id).OrderBy(x => x.ExamDate).ToList();

                var listScheduleDetail = unitOfWork.Repository<SysExamScheduleDetailAP>().Get(item => listSchedule.Select(schedule => schedule.Id).Contains(item.ExamScheduleId)
                    && listExam.Select(exam => exam.Id).Contains(item.ExamId));

                return new ResponseDataObject<IEnumerable<object>>
                {
                    Data = listSchedule.GroupJoin(listScheduleDetail, schedule => schedule.Id, detail => detail.ExamScheduleId, (schedule, detail) => new { schedule, detail })
                   .Where(item => item.detail.Any()).Select(item => new
                   {
                       item.schedule.Id,
                       item.schedule.ExamDate,
                       item.schedule.ExamPeriodId,
                       item.schedule.ExamTime,
                       item.schedule.ExamWorkShiftId,
                       examWorkShiftName = listExamWorkShift?.FirstOrDefault(workShift => workShift.Id == item.schedule.ExamWorkShiftId)?.Name,
                       item.schedule.IsOpen,
                       item.schedule.Name,
                       Exam = item.detail.Select(detail =>
                       {
                           var exam = listExam.First(exam => detail.ExamId == exam.Id);
                           return new
                           {
                               detail.Id,
                               detail.ExamId,
                               exam.Code,
                               exam.Price,
                               exam.Name
                           };
                       })
                   })
                };
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
    }
}
