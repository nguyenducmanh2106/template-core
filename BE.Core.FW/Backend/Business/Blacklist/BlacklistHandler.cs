using AutoMapper;
using Backend.Business.DecisionBlacklist;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using ExcelDataReader;
using Microsoft.Extensions.Hosting.Internal;
using Serilog;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection.PortableExecutable;

namespace Backend.Business.Blacklist
{
    public class BlacklistHandler : IBlacklistHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;

        public BlacklistHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
        }

        public ResponseData Create(BlacklistShowModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var blacklist = new SysBlacklist();
                blacklist.Id = Guid.NewGuid();
                blacklist.FullName = model.FullName;
                blacklist.DateOfBirth = model.DateOfBirth.Date;
                blacklist.Sex = model.Sex;
                blacklist.TypeIdCard = model.TypeIdCard;
                blacklist.Target = model.Target;
                blacklist.IDNumberCard = model.IDNumberCard;
                blacklist.ExamId = model.ExamId;
                var add = new SysDecisionBlacklist();
                add.Id = Guid.NewGuid();
                add.BlacklistId = blacklist.Id;
                add.DecisionNumber = model.DecisionNumber;
                add.StartDate = model.StartDate;
                add.EndDate = model.EndDate;
                add.Reason = model.Reason;
                add.DecisionDate = model.DecisionDate;
                add.Note = model.Note;
                add.ExamIdBan = model.ExamIdBan;
                if (model.FileFile != null && model.FileFile.Length > 0)
                {
                    string filePath = "/Blacklist/" + model.DecisionNumber + "/" + model.FileFile.FileName;
                    Task.Run(() => MinioHelpers.UploadFileToMinIO(model.FileFile.OpenReadStream(), filePath));
                    var addFileData = new SysFileData();
                    addFileData.FilePath = filePath;
                    addFileData.TargetId = add.Id;
                    using (var ms = new MemoryStream())
                    {
                        model.FileFile.CopyTo(ms);
                        var fileBytes = ms.ToArray();
                        addFileData.Base64String = Convert.ToBase64String(fileBytes);
                    }
                    unitOfWork.Repository<SysFileData>().Insert(addFileData);
                }
                unitOfWork.Repository<SysDecisionBlacklist>().Insert(add);
                unitOfWork.Repository<SysBlacklist>().Insert(blacklist);

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
                exits.IsDelete = true;
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(string? name, string? dob, string? cccd, bool? isDeleted)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                if (isDeleted == null) isDeleted = false;
                var data = unitOfWork.Repository<SysBlacklist>().Get(p => !p.IsDelete);
                if (!string.IsNullOrEmpty(name))
                {
                    data = data.Where(p => p.FullName == name);
                }
                if (!string.IsNullOrEmpty(dob))
                {
                    DateTime date = DateTime.ParseExact(dob, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data = data.Where(p => p.DateOfBirth == date);
                }

                data = data.OrderByDescending(l => l.CreatedOnDate).ToList();
                var result = new List<BlacklistShowModel>();
                foreach (var item in data)
                {
                    var ls = unitOfWork.Repository<SysDecisionBlacklist>().Get(p => p.BlacklistId == item.Id);
                    foreach (var l in ls)
                    {
                        result.Add(new BlacklistShowModel
                        {
                            Id = l.Id,
                            FullName = item.FullName,
                            DateOfBirth = item.DateOfBirth,
                            TypeIdCard = item.TypeIdCard,
                            ExamId = item.ExamId,
                            IDNumberCard = item.IDNumberCard,
                            IsAutoFill = item.IsAutoFill,
                            Target = item.Target,
                            BlacklistId = l.BlacklistId,
                            DateApprove = l.DateApprove,
                            ApproveBy = l.ApproveBy,
                            DecisionDate = l.DecisionDate,
                            DecisionNumber = l.DecisionNumber,
                            EndDate = l.EndDate,
                            ExamIdBan = l.ExamIdBan,
                            FormProcess = l.FormProcess,
                            Note = l.Note,
                            Reason = l.Reason,
                            StartDate = l.StartDate,
                            Status = l.Status,
                            FilePath = l.FilePath,
                        });
                    }
                }
                return new ResponseDataObject<List<BlacklistShowModel>>(result, Code.Success, "");
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
                var existData = unitOfWork.Repository<SysBlacklist>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");

                var result = new BlacklistShowDataModel
                {
                    Id = existData.Id,
                    FullName = existData.FullName,
                    Sex = existData.Sex,
                    DateOfBirth = existData.DateOfBirth,
                    TypeIdCard = existData.TypeIdCard,
                    ExamId = existData.ExamId,
                    IDNumberCard = existData.IDNumberCard,
                    IsAutoFill = existData.IsAutoFill,
                    Target = existData.Target,
                    DecisionBlackLists = unitOfWork.Repository<SysDecisionBlacklist>().Get(p => p.BlacklistId == existData.Id).Select(l => new DecisionBlacklistModel
                    {
                        Id = l.Id,
                        BlacklistId = l.BlacklistId,
                        DateApprove = l.DateApprove,
                        ApproveBy = l.ApproveBy,
                        DecisionDate = l.DecisionDate,
                        DecisionNumber = l.DecisionNumber,
                        EndDate = l.EndDate,
                        ExamIdBan = l.ExamIdBan,
                        FormProcess = l.FormProcess,
                        Note = l.Note,
                        Reason = l.Reason,
                        StartDate = l.StartDate,
                        Status = l.Status,
                        FilePath = l.FilePath,
                        CreatedBy = l.CreatedBy,
                        CreatedOnDate = l.CreatedOnDate.ToString("dd-MM-yyyy")
                    }).ToList()
                };
                return new ResponseDataObject<BlacklistShowDataModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(BlacklistModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysBlacklist>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.FullName = model.FullName;
                exist.Sex = model.Sex;
                exist.DateOfBirth = model.DateOfBirth.Date;
                exist.TypeIdCard = model.TypeIdCard;
                exist.IDNumberCard = model.IDNumberCard;
                exist.Target = model.Target;

                unitOfWork.Repository<SysBlacklist>().Update(exist);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData ReadDataFromFile(bool isCheck, string fileName)
        {
            try
            {
                string res = string.Empty;
                string notImport = string.Empty;
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var blacklist = new List<BlacklistModel>();
                string filePath = Path.Combine(_hostingEnvironment.WebRootPath, "FileUploaded", fileName);
                if (File.Exists(filePath))
                {
                    System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
                    var dataTable = LoadDataTable(filePath);
                    int importDone = 0;
                    for (int i = 0; i < dataTable.Rows.Count; i++)
                    {
                        var firstName = dataTable.Rows[i].ItemArray[3].ToString();
                        var lastName = dataTable.Rows[i].ItemArray[4].ToString();
                        var dob = (DateTime)dataTable.Rows[i].ItemArray[6];
                        //var checkExits = unitOfWork.Repository<SysBlacklist>().FirstOrDefault(p => p.FirstName == firstName && p.LastName == lastName && p.DateOfBirth == dob);
                        //if (checkExits != null && isCheck)
                        //{
                        //    if (notImport.Length > 0)
                        //        notImport += ", " + (i + 1);
                        //    else
                        //        notImport += (i + 1);
                        //}
                        //else
                        //{
                        //    importDone++;
                        //    blacklist.Add(new BlacklistModel
                        //    {
                        //        Id = Guid.NewGuid(),
                        //        FirstName = !string.IsNullOrEmpty(dataTable.Rows[i].ItemArray[3].ToString()) ? dataTable.Rows[i].ItemArray[3].ToString() : string.Empty,
                        //        LastName = dataTable.Rows[i].ItemArray[4] != null ? dataTable.Rows[i].ItemArray[4].ToString() : string.Empty,
                        //        FullName = dataTable.Rows[i].ItemArray[3].ToString() + " " + dataTable.Rows[i].ItemArray[4].ToString(),
                        //        Sex = dataTable.Rows[i].ItemArray[5] != null ? dataTable.Rows[i].ItemArray[5].ToString() : string.Empty,
                        //        DateOfBirth = dataTable.Rows[i].ItemArray[6] != null ? DateTime.Parse(dataTable.Rows[i].ItemArray[6].ToString()).Date : DateTime.MinValue,
                        //        CCCD = dataTable.Rows[i].ItemArray[2] != null ? dataTable.Rows[i].ItemArray[2].ToString() : string.Empty,
                        //        Target = dataTable.Rows[i].ItemArray[0] != null ? dataTable.Rows[i].ItemArray[0].ToString() : string.Empty,
                        //        ExamTypeId = dataTable.Rows[i].ItemArray[1] != null ? dataTable.Rows[i].ItemArray[1].ToString() : string.Empty,
                        //        ArrestationDate = !string.IsNullOrEmpty(dataTable.Rows[i].ItemArray[7].ToString()) ? DateTime.Parse(dataTable.Rows[i].ItemArray[7].ToString()).Date : null,
                        //        DeadlineTo = dataTable.Rows[i].ItemArray[8] != null ? dataTable.Rows[i].ItemArray[8].ToString() : string.Empty,
                        //        Note = dataTable.Rows[i].ItemArray[9] != null ? dataTable.Rows[i].ItemArray[9].ToString() : string.Empty,
                        //        LimitedTime = dataTable.Rows[i].ItemArray[10] != null ? dataTable.Rows[i].ItemArray[10].ToString() : string.Empty,
                        //        Reason = dataTable.Rows[i].ItemArray[11] != null ? dataTable.Rows[i].ItemArray[11].ToString() : string.Empty,
                        //        IsDelete = false,
                        //        Status = 2
                        //    });
                        //}

                    }
                    unitOfWork.Repository<SysBlacklist>().InsertRange(_mapper.Map<List<SysBlacklist>>(blacklist));
                    unitOfWork.Save();
                    if (notImport.Length > 0)
                        res = "Import thành công: " + importDone + " dòng|||STT dòng bị trùng dữ liệu: " + notImport;
                    else
                        res = "Import thành công: " + importDone + " dòng";

                    File.Delete(filePath);
                }
                else
                {
                    res = "File bị lỗi, hãy thử lại!";
                }
                return new ResponseData(Code.Success, res);
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

        public static DataTable LoadDataTable(string filePath)
        {
            string fileExtension = Path.GetExtension(filePath);
            switch (fileExtension.ToLower())
            {
                case ".xlsx":
                    return ConvertExcelToDataTable(filePath, true);
                case ".xls":
                    return ConvertExcelToDataTable(filePath);
                case ".csv":
                    return ConvertCsvToDataTable(filePath);
                default:
                    return new DataTable();
            }

        }
        public static DataTable ConvertExcelToDataTable(string filePath, bool isXlsx = false)
        {
            FileStream? stream = null;
            IExcelDataReader? excelReader = null;
            DataTable dataTable = new();
            stream = File.Open(filePath, FileMode.Open, FileAccess.Read);
            excelReader = isXlsx ? ExcelReaderFactory.CreateOpenXmlReader(stream) : ExcelReaderFactory.CreateBinaryReader(stream);
            DataSet result = excelReader.AsDataSet(new ExcelDataSetConfiguration()
            {
                ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                {
                    UseHeaderRow = true
                }
            });
            if (result != null && result.Tables.Count > 0)
                dataTable = result.Tables[0];
            stream.Close();
            return dataTable;
        }

        public static DataTable ConvertCsvToDataTable(string filePath)
        {
            DataTable dt = new DataTable();
            using (StreamReader sr = new StreamReader(filePath))
            {
                string[] headers = sr.ReadLine().Split(',');
                foreach (string header in headers)
                {
                    dt.Columns.Add(header);
                }
                while (!sr.EndOfStream)
                {
                    string[] rows = sr.ReadLine().Split(',');
                    DataRow dr = dt.NewRow();
                    for (int i = 0; i < headers.Length; i++)
                    {
                        dr[i] = rows[i];
                    }
                    dt.Rows.Add(dr);
                }

            }
            return dt;
        }
    }
}
