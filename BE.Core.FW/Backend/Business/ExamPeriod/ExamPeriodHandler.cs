using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;

namespace Backend.Business
{
    public class ExamPeriodHandler : IExamPeriodHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExamPeriodHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(ExamPeriodModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                var sysExamPeriod = _mapper.Map<SysExamPeriod>(model);
                sysExamPeriod.Id = Guid.NewGuid();
                sysExamPeriod.Name = model.Name.Trim();
                sysExamPeriod.CreatedOnDate = DateTime.Now;

                if (model.IsCurrent)
                {
                    var listExamPeriodIsOpening = unitOfWork.Repository<SysExamPeriod>().Get(item => item.IsCurrent);
                    foreach (var item in listExamPeriodIsOpening)
                    {
                        item.IsCurrent = false;
                        item.Status = false;
                    }
                }

                unitOfWork.Repository<SysExamPeriod>().Insert(sysExamPeriod);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(IEnumerable<string> ids)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntitiesInDb = unitOfWork.Repository<SysExamPeriod>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                var scheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(item => ids.Contains(item.ExamPeriodId.ToString()));
                if (scheduleTopik != null)
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng ở trong lịch thi");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysExamPeriod>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(ExamPeriodSearch model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysExamPeriod>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Name))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));

                if (model.Status.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.Status == model.Status);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysExamPeriod>>(dataEntityInDb);
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
                var stockEntityInDb = unitOfWork.Repository<SysExamPeriod>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysExamPeriod>(stockEntityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(Guid id, ExamPeriodModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysExamPeriod>().GetById(id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.Name != model.Name)
                {
                    if (IsNameExist(model.Name))
                        return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");
                }

                if (dataEntityInDb.Status && !model.Status)
                {
                    var isExistsInScheduleOpen = unitOfWork.Repository<SysExamScheduleTopik>().FirstOrDefault(item => item.ExamPeriodId == id && item.Status == 0);
                    if (isExistsInScheduleOpen != null)
                        return new ResponseDataError(Code.BadRequest, "Không cập nhật được do tồn tại lịch thi đang mở");
                }

                if (model.IsCurrent)
                {
                    var listExamPeriodIsOpening = unitOfWork.Repository<SysExamPeriod>().Get(item => item.IsCurrent && item.Id != id);
                    foreach (var item in listExamPeriodIsOpening)
                    {
                        item.IsCurrent = false;
                    }
                }

                _mapper.Map(model, dataEntityInDb);
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysExamPeriod>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        private bool IsNameExist(string name)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            return unitOfWork.Repository<SysExamPeriod>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }
    }
}
