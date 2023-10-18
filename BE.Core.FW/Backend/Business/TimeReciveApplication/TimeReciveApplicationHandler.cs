using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Serilog;
using System.Data;

namespace Backend.Business.TimeReciveApplication
{
    public class TimeReciveApplicationHandler : ITimeReciveApplicationHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;

        public TimeReciveApplicationHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
        }

        public ResponseData Create(TimeReciveApplicationModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                model.Id = Guid.NewGuid();

                unitOfWork.Repository<SysTimeReciveApplication>().Insert(_mapper.Map<SysTimeReciveApplication>(model));

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
                var exits = unitOfWork.Repository<SysTimeReciveApplication>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                unitOfWork.Repository<SysTimeReciveApplication>().Delete(exits);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
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
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysTimeReciveApplication>().Get().Select(p => new TimeReciveApplicationModel
                {
                    Id = p.Id,
                    HeaderQuarterId = p.HeaderQuarterId,
                    Weekdays = p.Weekdays,
                    Weekend = p.Weekend
                }).ToList();

                return new ResponseDataObject<List<TimeReciveApplicationModel>>(data, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(TimeReciveApplicationModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysTimeReciveApplication>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Weekend = model.Weekend;
                exist.Weekdays = model.Weekdays;
                exist.HeaderQuarterId = model.HeaderQuarterId;
                unitOfWork.Repository<SysTimeReciveApplication>().Update(exist);
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
