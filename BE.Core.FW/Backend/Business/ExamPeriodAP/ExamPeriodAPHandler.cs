using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class ExamPeriodAPHandler : IExamPeriodAPHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExamPeriodAPHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(ExamPeriodAPModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                if (IsNameExist(model.Name))
                    return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");

                var sysExamPeriodAP = _mapper.Map<SysExamPeriodAP>(model);
                sysExamPeriodAP.Id = Guid.NewGuid();
                sysExamPeriodAP.CreatedOnDate = DateTime.Now;
                if (sysExamPeriodAP.IsOpen)
                {
                    var listExamPeriod = unitOfWork.Repository<SysExamPeriodAP>().Get(item => item.IsOpen);
                    foreach (var item in listExamPeriod)
                    {
                        item.IsOpen = false;
                    }
                }

                unitOfWork.Repository<SysExamPeriodAP>().Insert(sysExamPeriodAP);
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
                var dataEntitiesInDb = unitOfWork.Repository<SysExamPeriodAP>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                var schedule = unitOfWork.Repository<SysExamScheduleAP>().FirstOrDefault(item => ids.Contains(item.ExamPeriodId.ToString()));
                if (schedule != null)
                    return new ResponseDataError(Code.BadRequest, "Không xóa được do kì thi tồn tại lịch thi");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysExamPeriodAP>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(ExamPeriodAPSearch model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysExamPeriodAP>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Name))
                    dataEntityInDb = dataEntityInDb.Where(item => EF.Functions.Like(item.Name, $"%{model.Name}%"));

                if (model.IsOpen.HasValue)
                    dataEntityInDb = dataEntityInDb.Where(item => item.IsOpen == model.IsOpen);

                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysExamPeriodAP>>(dataEntityInDb);
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
                var stockEntityInDb = unitOfWork.Repository<SysExamPeriodAP>().GetById(id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysExamPeriodAP>(stockEntityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(Guid id, ExamPeriodAPModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysExamPeriodAP>().GetById(id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (dataEntityInDb.Name != model.Name)
                {
                    if (IsNameExist(model.Name))
                        return new ResponseDataError(Code.BadRequest, "Tên đã tồn tại");
                }

                //if (dataEntityInDb.IsOpen && !model.IsOpen)
                //{
                //    var isExistsInScheduleOpen = unitOfWork.Repository<SysExamScheduleAP>().FirstOrDefault(item => item.ExamPeriodId == id && item.IsOpen);
                //    if (isExistsInScheduleOpen != null)
                //        return new ResponseDataError(Code.BadRequest, "Không đóng được kì thi do tồn tại lịch thi đang mở");
                //}

                if (model.IsOpen && !dataEntityInDb.IsOpen)
                {
                    var listExamPeriod = unitOfWork.Repository<SysExamPeriodAP>().Get(item => item.IsOpen);
                    foreach (var item in listExamPeriod)
                    {
                        item.IsOpen = false;
                    }
                }

                _mapper.Map(model, dataEntityInDb);
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysExamPeriodAP>().Update(dataEntityInDb);
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
            return unitOfWork.Repository<SysExamPeriodAP>().Get(item => EF.Functions.Collate(item.Name, Constant.SQL_COLLATION_CASE_SENSITIVE) == name.Trim()).Any();
        }
    }
}
