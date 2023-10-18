using AutoMapper;
using Backend.Business.TimeFrame;
using Backend.Business.User;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Serilog;
using System.Linq;

namespace Backend.Business.TimeFrameInDay
{
    public class TimeFrameInDayHandler : ITimeFrameInDayHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TimeFrameInDayHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(TimeFrameInDayModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                model.Id = Guid.NewGuid();
                unitOfWork.Repository<SysTimeFrameInDay>().Insert(_mapper.Map<SysTimeFrameInDay>(model));

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
                var exits = unitOfWork.Repository<SysTimeFrameInDay>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysTimeFrameInDay>().Delete(exits);

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
                var existNavs = unitOfWork.Repository<SysTimeFrameInDay>().Get(x => ids.Contains(x.Id.ToString()));
                if (existNavs.Count() > 0)
                {
                    foreach (var item in existNavs)
                    {
                        unitOfWork.Repository<SysTimeFrameInDay>().Delete(item);
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

        public async Task<ResponseData> GetAsync(string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysTimeFrameInDay>().Get();
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                {
                    var timeFrames = unitOfWork.Repository<SysTimeFrame>().Get(p => roles.AccessDataHeaderQuater.Contains(p.HeadQuarterId)).Select(p => p.Id);
                    data = data.Where(p => timeFrames.Contains(p.SysTimeFrameId));
                    var result = new List<TimeFrameInDayModel>();
                    foreach (var item in data)
                    {
                        result.Add(new TimeFrameInDayModel
                        {
                            Id = item.Id,
                            IsShow = item.IsShow,
                            TimeStart = item.TimeStart,
                            TimeEnd = item.TimeEnd,
                            MaxRegistry = item.MaxRegistry,
                            SysTimeFrameId = item.SysTimeFrameId
                        });
                    }
                    return new ResponseDataObject<List<TimeFrameInDayModel>>(result.OrderBy(p=>p.SysTimeFrameId).ThenBy(item => item.TimeStart.Replace(":", string.Empty)).ToList(), Code.Success, "");
                }
                else
                    return new ResponseDataObject<List<TimeFrameInDayModel>>(new List<TimeFrameInDayModel>(), Code.Success, "");

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetById(Guid id, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken);
                var existData = unitOfWork.Repository<SysTimeFrameInDay>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                var getTimeFrame = unitOfWork.Repository<SysTimeFrame>().GetById(existData.SysTimeFrameId);
                if (getTimeFrame != null && roles != null && roles.AccessDataHeaderQuater.Count() > 0 && roles.AccessDataHeaderQuater.Contains(getTimeFrame.HeadQuarterId))
                {
                    var result = new TimeFrameInDayModel
                    {
                        Id = existData.Id,
                        IsShow = existData.IsShow,
                        TimeStart = existData.TimeStart,
                        TimeEnd = existData.TimeEnd,
                        MaxRegistry = existData.MaxRegistry,
                        SysTimeFrameId = existData.SysTimeFrameId
                    };
                    return new ResponseDataObject<TimeFrameInDayModel>(result, Code.Success, "");
                }
                else
                {
                    return new ResponseDataObject<TimeFrameInDayModel>(new TimeFrameInDayModel(), Code.Success, "");
                }

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(TimeFrameInDayModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysTimeFrameInDay>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Id = model.Id;
                exist.TimeStart = model.TimeStart;
                exist.TimeEnd = model.TimeEnd;
                exist.MaxRegistry = model.MaxRegistry;
                exist.SysTimeFrameId = model.SysTimeFrameId;
                exist.IsShow = model.IsShow;

                unitOfWork.Repository<SysTimeFrameInDay>().Update(exist);
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
