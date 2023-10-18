using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Serilog;
using System.Linq;

namespace Backend.Business.TimeFrame
{
    public class TimeFrameHandler : ITimeFrameHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TimeFrameHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(TimeFrameModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                model.Id = Guid.NewGuid();
                unitOfWork.Repository<SysTimeFrame>().Insert(_mapper.Map<SysTimeFrame>(model));

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
                var exits = unitOfWork.Repository<SysTimeFrame>().FirstOrDefault(x => x.Id == id);
                var checkUse = unitOfWork.Repository<SysTimeFrameInDay>().FirstOrDefault(p => p.SysTimeFrameId == id && p.CreatedOnDate > DateTime.Now);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                if (checkUse != null)
                    return new ResponseDataError(Code.NotFound, exits.Name + " đang được dùng ở khung thời gian theo ngày");

                unitOfWork.Repository<SysTimeFrame>().Delete(exits);

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
                var existNavs = unitOfWork.Repository<SysTimeFrame>().Get(x => ids.Contains(x.Id.ToString()));
                if (existNavs.Count() > 0)
                {
                    foreach (var item in existNavs)
                    {
                        unitOfWork.Repository<SysTimeFrame>().Delete(item);
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
                var data = unitOfWork.Repository<SysTimeFrame>().Get();

                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken);
                if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                    data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.HeadQuarterId));
                else
                    data = data.Where(p => p.Id == Guid.Empty);
                var result = new List<TimeFrameModel>();
                foreach (var item in data)
                {
                    result.Add(new TimeFrameModel
                    {
                        Id = item.Id,
                        IsShow = item.IsShow,
                        Name = item.Name,
                        HeadQuarterId = item.HeadQuarterId,
                    });
                }
                return new ResponseDataObject<List<TimeFrameModel>>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public async Task<ResponseData> GetByIdAsync(Guid id, string accessToken)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken);
                var existData = unitOfWork.Repository<SysTimeFrame>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                if (roles.AccessDataHeaderQuater.Count > 0 && roles.AccessDataHeaderQuater.Contains(existData.HeadQuarterId))
                {
                    var result = new TimeFrameModel
                    {
                        Id = existData.Id,
                        IsShow = existData.IsShow,
                        Name = existData.Name,
                        HeadQuarterId = existData.HeadQuarterId
                    };
                    return new ResponseDataObject<TimeFrameModel>(result, Code.Success, "");
                }
                else
                {
                    return new ResponseDataObject<TimeFrameModel>(new TimeFrameModel(), Code.Success, "");
                }

            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(TimeFrameModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysTimeFrame>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Name = model.Name;
                exist.IsShow = model.IsShow;
                exist.HeadQuarterId = model.HeadQuarterId;
                unitOfWork.Repository<SysTimeFrame>().Update(exist);
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
