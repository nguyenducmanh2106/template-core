using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.HoldPosition
{
    public class HoldPositionHandler : IHoldPositionHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HoldPositionHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(HoldPositionModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var calendar = unitOfWork.Repository<SysExamCalendar>().FirstQueryable(p => p.Id == model.ExamCalendarId);
                if (calendar == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy lịch thi");
                var getHoldPositions = unitOfWork.Repository<SysHoldPosition>().Get(p => p.ExamCalendarId == model.ExamCalendarId && p.Id != model.Id);

                if (getHoldPositions != null && getHoldPositions.Count() > 0)
                {
                    if ((getHoldPositions.Sum(p => p.Quantity) + model.Quantity) > calendar.QuantityCandidate)
                        return new ResponseDataError(Code.NotFound, "Tổng số lượng không thể lớn hơn số lượng lịch thi !");
                }
                else
                {
                    if (model.Quantity > calendar.QuantityCandidate)
                        return new ResponseDataError(Code.NotFound, "Tổng số lượng không thể lớn hơn số lượng lịch thi !");
                }
                unitOfWork.Repository<SysHoldPosition>().Insert(_mapper.Map<SysHoldPosition>(model));
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get()
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysHoldPosition>().GetQueryable(item => true);


                dataEntityInDb = dataEntityInDb.OrderByDescending(item => item.CreatedOnDate);

                return new ResponseDataObject<IEnumerable<SysHoldPosition>>(dataEntityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetByCalendarId(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var stockEntityInDb = unitOfWork.Repository<SysHoldPosition>().Get(p => p.ExamCalendarId == id);
                if (stockEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<List<SysHoldPosition>>(stockEntityInDb.OrderByDescending(p => p.CreatedOnDate).ToList());
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(HoldPositionModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysHoldPosition>().GetById(model.Id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                var calendar = unitOfWork.Repository<SysExamCalendar>().FirstQueryable(p => p.Id == model.ExamCalendarId);
                if (calendar == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy lịch thi");
                var getHoldPositions = unitOfWork.Repository<SysHoldPosition>().Get(p => p.ExamCalendarId == model.ExamCalendarId && p.Id != model.Id);

                if (getHoldPositions != null && getHoldPositions.Count() > 0)
                {
                    if ((getHoldPositions.Sum(p => p.Quantity) + model.Quantity) > calendar.QuantityCandidate)
                        return new ResponseDataError(Code.NotFound, "Tổng số lượng không thể lớn hơn số lượng lịch thi !");
                }
                else
                {
                    if (model.Quantity > calendar.QuantityCandidate)
                        return new ResponseDataError(Code.NotFound, "Tổng số lượng không thể lớn hơn số lượng lịch thi !");
                }
                _mapper.Map(model, dataEntityInDb);
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysHoldPosition>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
        
    }
}
