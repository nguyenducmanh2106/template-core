using AutoMapper;
using Backend.Business.ManageApplicationTime;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Globalization;
using System.Linq;

namespace Backend.Business.TimeFrameInDay
{
    public class ManageApplicationTimeHandler : IManageApplicationTimeHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ManageApplicationTimeHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(ManageApplicationTimeModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                if (model.SysTimeFrameId != new Guid() && model.ListReceivedDate != null && model.ListReceivedDate.Count > 0)
                {
                    var dateStart = model.ListReceivedDate.FirstOrDefault().Date;
                    var dateEnd = model.ListReceivedDate.LastOrDefault().Date;
                    int totalDays = (int)(dateEnd - dateStart).TotalDays + 1;
                    var listTimeFrame = unitOfWork.Repository<SysTimeFrameInDay>().Get(p => p.SysTimeFrameId == model.SysTimeFrameId && p.IsShow);
                    var listAddRange = new List<SysManageApplicationTime>();
                    for (int i = 0; i < totalDays; i++)
                    {
                        foreach (var item in listTimeFrame)
                        {
                            listAddRange.Add(new SysManageApplicationTime
                            {
                                SysTimeFrameId = item.SysTimeFrameId,
                                HeaderQuarterId = model.HeaderQuarterId,
                                IsShow = true,
                                MaxRegistry = item.MaxRegistry,
                                ReceivedDate = dateStart.AddDays(i),
                                Registed = 0,
                                TimeStart = item.TimeStart,
                                TimeEnd = item.TimeEnd
                            });
                        }
                    }

                    unitOfWork.Repository<SysManageApplicationTime>().InsertRange(_mapper.Map<List<SysManageApplicationTime>>(listAddRange));
                }
                else
                {
                    model.Id = Guid.NewGuid();
                    model.ReceivedDate = model.ReceivedDate.Date;
                    unitOfWork.Repository<SysManageApplicationTime>().Insert(_mapper.Map<SysManageApplicationTime>(model));
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

        public ResponseData Delete(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysManageApplicationTime>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysManageApplicationTime>().Delete(exits);

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
                var existNavs = unitOfWork.Repository<SysManageApplicationTime>().Get(x => ids.Contains(x.Id.ToString()));
                if (existNavs.Count() > 0)
                {
                    foreach (var item in existNavs)
                    {
                        unitOfWork.Repository<SysManageApplicationTime>().Delete(item);
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

        public async Task<ResponseData> Get(Guid headerQuarterId, string? from, string? to, bool isCong, int pageNumber, int pageSize, string accessToken, bool isFullData = false)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysManageApplicationTime>().Get();
                if (!isCong)
                {
                    var roles = await HttpHelper.GetInfoUserLoginAsync(_httpContextAccessor, accessToken != null ? accessToken : string.Empty);
                    if (roles != null && roles.AccessDataHeaderQuater.Count() > 0)
                        data = data.Where(p => roles.AccessDataHeaderQuater.Contains(p.HeaderQuarterId));
                    else
                        data = data.Where(p => p.Id == Guid.Empty);
                }

                if (headerQuarterId != default(Guid))
                    data = data.Where(p => p.HeaderQuarterId == headerQuarterId);
                DateTime date = DateTime.Now.AddDays(1).Date;

                var result = new List<ManageApplicationTimeModel>();

                if (isCong)
                {
                    if (!string.IsNullOrEmpty(from))
                    {
                        if (date < DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture))
                            date = DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    }
                    var timeSetup = unitOfWork.Repository<SysTimeReciveApplication>().FirstOrDefault(p => p.HeaderQuarterId == headerQuarterId);
                    if (timeSetup != null)
                    {
                        var timeEnd = timeSetup.Weekdays;
                        if (DateTime.Now.DayOfWeek == DayOfWeek.Saturday)
                        {
                            timeEnd = timeSetup.Weekend;
                            if (DateTime.Now.TimeOfDay > new TimeSpan(Convert.ToInt32(timeEnd.Split(":")[0]), Convert.ToInt32(timeEnd.Split(":")[1]), 00))
                                data = data.Where(p => p.ReceivedDate.Date > DateTime.Now.AddDays(2).Date);
                        }
                        if (DateTime.Now.DayOfWeek != DayOfWeek.Saturday && DateTime.Now.DayOfWeek != DayOfWeek.Sunday)
                        {
                            if (DateTime.Now.TimeOfDay > new TimeSpan(Convert.ToInt32(timeEnd.Split(":")[0]), Convert.ToInt32(timeEnd.Split(":")[1]), 00))
                                data = data.Where(p => p.ReceivedDate.Date > DateTime.Now.AddDays(1).Date);
                        }
                    }

                    data = data.Where(p => p.ReceivedDate.Date >= date);

                    if (!string.IsNullOrEmpty(to))
                    {
                        DateTime dateTo = DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(p => p.ReceivedDate <= dateTo);
                    }
                    foreach (var item in data.ToList())
                    {
                        result.Add(new ManageApplicationTimeModel
                        {
                            Id = item.Id,
                            IsShow = item.IsShow,
                            TimeStart = item.TimeStart,
                            TimeEnd = item.TimeEnd,
                            MaxRegistry = item.MaxRegistry,
                            SysTimeFrameId = item.SysTimeFrameId,
                            Registed = unitOfWork.Repository<SysUserSubmitTime>().Count(p => p.SubmissionTimeId == item.Id),
                            HeaderQuarterId = item.HeaderQuarterId,
                            ReceivedDate = item.ReceivedDate
                        });
                    }
                    if (!isFullData)
                        result = result.Where(p => p.MaxRegistry > p.Registed).ToList();
                }
                else
                {
                    var listSubmissionTime = data.Select(item => item.Id);
                    var listCandidateInSubmisstionTime = unitOfWork.Repository<SysUserSubmitTime>().Get(item => listSubmissionTime.Contains(item.SubmissionTimeId));
                    if (!string.IsNullOrEmpty(from))
                    {
                        var dateFrom = DateTime.ParseExact(from, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(item => item.ReceivedDate.Date >= dateFrom.Date);
                    }
                    if (!string.IsNullOrEmpty(to))
                    {
                        var dateTo = DateTime.ParseExact(to, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        data = data.Where(item => item.ReceivedDate.Date <= dateTo.Date);
                    }

                    var totalRecord = data.Count();
                    data = data
                        .OrderByDescending(item => item.ReceivedDate).ThenByDescending(item => item.TimeStart.Replace(":", string.Empty))
                        .Skip((pageNumber - 1) * pageSize).Take(pageSize);
                   
                    foreach (var item in data)
                    {
                        result.Add(new ManageApplicationTimeModel
                        {
                            Id = item.Id,
                            IsShow = item.IsShow,
                            TimeStart = item.TimeStart,
                            TimeEnd = item.TimeEnd,
                            MaxRegistry = item.MaxRegistry,
                            SysTimeFrameId = item.SysTimeFrameId,
                            Registed = listCandidateInSubmisstionTime.Count(p => p.SubmissionTimeId == item.Id),
                            HeaderQuarterId = item.HeaderQuarterId,
                            ReceivedDate = item.ReceivedDate
                        });
                    }

                    return new PageableData<IEnumerable<ManageApplicationTimeModel>>()
                    {
                        Data = result,
                        PageNumber = pageNumber,
                        PageSize = pageSize,
                        TotalCount = totalRecord
                    };
                }
                return new ResponseDataObject<List<ManageApplicationTimeModel>>(result.OrderBy(o => o.ReceivedDate).ThenBy(p => new TimeSpan(Convert.ToInt32(p.TimeStart.Split(":")[0]), Convert.ToInt32(p.TimeStart.Split(":")[1]), 00)).ToList(), Code.Success, "");
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
                var existData = unitOfWork.Repository<SysManageApplicationTime>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                var result = new ManageApplicationTimeModel
                {
                    Id = existData.Id,
                    IsShow = existData.IsShow,
                    TimeStart = existData.TimeStart,
                    TimeEnd = existData.TimeEnd,
                    MaxRegistry = existData.MaxRegistry,
                    SysTimeFrameId = existData.SysTimeFrameId,
                    Registed = existData.Registed,
                    HeaderQuarterId = existData.HeaderQuarterId,
                    ReceivedDate = existData.ReceivedDate
                };
                return new ResponseDataObject<ManageApplicationTimeModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ManageApplicationTimeModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysManageApplicationTime>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Id = model.Id;
                exist.TimeStart = model.TimeStart;
                exist.TimeEnd = model.TimeEnd;
                exist.MaxRegistry = model.MaxRegistry;
                exist.SysTimeFrameId = model.SysTimeFrameId;
                exist.HeaderQuarterId = model.HeaderQuarterId;
                exist.IsShow = model.IsShow;
                exist.ReceivedDate = model.ReceivedDate;

                unitOfWork.Repository<SysManageApplicationTime>().Update(exist);
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
