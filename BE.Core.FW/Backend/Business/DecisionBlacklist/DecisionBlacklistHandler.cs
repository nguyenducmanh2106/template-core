using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using ExcelDataReader;
using Microsoft.Extensions.Hosting.Internal;
using Serilog;
using System;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection.PortableExecutable;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.DecisionBlacklist
{
    public class DecisionBlacklistHandler : IDecisionBlacklistHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;

        public DecisionBlacklistHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
        }

        public ResponseData Create(DecisionBlacklistModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                model.Id = Guid.NewGuid();
                string username = !string.IsNullOrEmpty(_httpContextAccessor!.HttpContext!.User.Identity!.Name!) ? _httpContextAccessor!.HttpContext!.User.Identity!.Name! : string.Empty;
                model.CreatedBy = username;
                model.Status = (int)StatusBlacklist.WaitingApprove;
                if (model.FileFile != null && model.FileFile.Length > 0)
                {
                    string filePath = "/Blacklist/" + model.DecisionNumber;
                    Task.Run(() => MinioHelpers.UploadFileToMinIO(model.FileFile.OpenReadStream(), filePath));
                    var addFileData = new SysFileData();
                    addFileData.FilePath = filePath;
                    addFileData.TargetId = model.Id;
                    using (var ms = new MemoryStream())
                    {
                        model.FileFile.CopyTo(ms);
                        var fileBytes = ms.ToArray();
                        addFileData.Base64String = Convert.ToBase64String(fileBytes);
                    }
                    unitOfWork.Repository<SysFileData>().Insert(addFileData);
                }
                unitOfWork.Repository<SysDecisionBlacklist>().Insert(_mapper.Map<SysDecisionBlacklist>(model));

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
                var exits = unitOfWork.Repository<SysBlacklist>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysBlacklist>().Delete(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
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
                var p = unitOfWork.Repository<SysDecisionBlacklist>().FirstOrDefault(p => p.Id == id);
                if (p == null)
                    return new ResponseDataError(Code.NotFound, "Id notfound");
                var file = unitOfWork.Repository<SysFileData>().FirstOrDefault(p => p.TargetId == id);
                var data = new DecisionBlacklistModel
                {
                    Id = p.Id,
                    Reason = p.Reason,
                    Note = p.Note,
                    BlacklistId = p.BlacklistId,
                    DecisionDate = p.DecisionDate,
                    DecisionNumber = p.DecisionNumber,
                    EndDate = p.EndDate,
                    ExamIdBan = p.ExamIdBan,
                    FormProcess = p.FormProcess,
                    StartDate = p.StartDate,
                    Status = p.Status,
                    CreatedOnDate = p.CreatedOnDate.ToString("dd/MM/yyyy"),
                    ApproveBy = p.ApproveBy,
                    CreatedBy = p.CreatedBy,
                    DateApprove = p.DateApprove,
                    FilePath = file?.FilePath,
                };
                return new ResponseDataObject<DecisionBlacklistModel>(data, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetByBlacklistId(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysDecisionBlacklist>().Get(p => p.BlacklistId == id).Select(p => new DecisionBlacklistModel
                {
                    Id = p.Id,
                    Reason = p.Reason,
                    Note = p.Note,
                    BlacklistId = p.BlacklistId,
                    DecisionDate = p.DecisionDate,
                    DecisionNumber = p.DecisionNumber,
                    EndDate = p.EndDate,
                    ExamIdBan = p.ExamIdBan,
                    FormProcess = p.FormProcess,
                    StartDate = p.StartDate,
                    Status = p.Status,
                    CreatedOnDate = p.CreatedOnDate.ToString("dd/MM/yyyy"),
                    ApproveBy = p.ApproveBy,
                    CreatedBy = p.CreatedBy,
                    DateApprove = p.DateApprove,
                    FilePath = p.FilePath
                }).ToList();

                return new ResponseDataObject<List<DecisionBlacklistModel>>(existData, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(DecisionBlacklistModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysDecisionBlacklist>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Id = model.Id;
                exist.DecisionNumber = model.DecisionNumber;
                exist.StartDate = model.StartDate;
                exist.EndDate = model.EndDate;
                exist.Reason = model.Reason;
                exist.DecisionDate = model.DecisionDate;
                exist.Note = model.Note;
                exist.ExamIdBan = model.ExamIdBan;
                if (model.FileFile != null && model.FileFile.Length > 0)
                {
                    string filePath = "/Blacklist/" + model.DecisionNumber;
                    Task.Run(() => MinioHelpers.UploadFileToMinIO(model.FileFile.OpenReadStream(), filePath));
                    var addFileData = new SysFileData();
                    addFileData.FilePath = filePath;
                    addFileData.TargetId = exist.Id;
                    using (var ms = new MemoryStream())
                    {
                        model.FileFile.CopyTo(ms);
                        var fileBytes = ms.ToArray();
                        addFileData.Base64String = Convert.ToBase64String(fileBytes);
                    }
                    unitOfWork.Repository<SysFileData>().Insert(addFileData);
                }

                unitOfWork.Repository<SysDecisionBlacklist>().Update(exist);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Approve(Guid id, bool approve, string? note)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                string username = !string.IsNullOrEmpty(_httpContextAccessor!.HttpContext!.User.Identity!.Name!) ? _httpContextAccessor!.HttpContext!.User.Identity!.Name! : "";
                var exits = unitOfWork.Repository<SysDecisionBlacklist>().FirstOrDefault(x => x.Id == id);
                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                exits.DateApprove = DateTime.Now;
                exits.ApproveBy = username;
                exits.Status = approve ? (int)StatusBlacklist.Blacklist : (int)StatusBlacklist.ExpiredBlacklist;
                unitOfWork.Repository<SysDecisionBlacklist>().Update(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public DateTime ConvertToDatetime(string dateString)
        {
            var dateSplit = dateString.Split("/");
            string date = dateSplit[1] + "/" + dateSplit[0] + "/" + dateSplit[2].Substring(0, 4);
            return DateTime.ParseExact(date, "DD/MM/YYYY", CultureInfo.InvariantCulture);
        }
    }
}
