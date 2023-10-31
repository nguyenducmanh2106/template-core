using AutoMapper;
using Backend.Business.User;
using Backend.Infrastructure.Common.Interfaces;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Middleware.Auth;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.Bibliography;
using IIG.Core.Framework.ICom.Infrastructure.Utils;
using Newtonsoft.Json;
using Org.BouncyCastle.Asn1.X509;
using Serilog;
using Shared.Caching.Interface;
using System.Data;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.Target
{
    public class TargetHandler : ITargetHandler
    {
        private readonly ICached _cached;
        private readonly IMapper _mapper;
        private readonly ICurrentUser _currentUser;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly HttpClient client = new();
        private readonly string notificationServiceUrl = "";
        private readonly string emailServiceUrl = "";
        public TargetHandler(IHttpContextAccessor httpContextAccessor, IMapper mapper, ICached cached, ICurrentUser currentUser)
        {
            _cached = cached;
            _mapper = mapper;
            _currentUser = currentUser;
            _httpContextAccessor = httpContextAccessor;
            //workflowTargetServiceUrl = Utils.GetConfig("Workflow.Target.Service");
            //authServiceUrl = Utils.GetConfig("Auth.Service");
            notificationServiceUrl = Utils.GetConfig("Notification");
            emailServiceUrl = Utils.GetConfig("Email.Service");
        }

        public ResponseData Approve(Guid id, Guid documentId, string commandName, string comment, Guid userId)
        {
            throw new NotImplementedException();
        }

        public ResponseData Delete(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<ResponseData> DownloadFileImport()
        {
            try
            {
                // Tạo bảng dữ liệu chung ( Master ) 
                DataTable Master = new DataTable();
                Master.TableName = "Master";

                DataRow dr = null;
                dr = Master.NewRow();

                // Tạo bảng dữ liệu Chi tiết ( Details )
                DataTable detailProduct = new DataTable();
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var productTypeEntityQuerys = unitOfWork.Repository<SysProductType>().Get();

                if (productTypeEntityQuerys != null && productTypeEntityQuerys.Count() > 0)
                {
                    detailProduct = Commonyy.ToDataTable<SysProductType>(productTypeEntityQuerys.ToList());
                    detailProduct.TableName = "Products";
                }

                Master.Rows.Add(dr);
                // Tạo Dataset ghi dữ liệu Master + Details 
                var ds = new DataSet();
                ds.Tables.Add(detailProduct);
                ds.Tables.Add(Master);

                // Lấy tên file đầu vào và đầu ra 
                var fileTmp = $"Mau_giao_Target.xlsx";
                var fileOutput = $"Mau_giao_Target.xlsx";

                ExcelFillData.FillReport(fileOutput, fileTmp, ds, new string[] { "{", "}" });


                var result = new FileModel() { Extention = ".xlsx" };
                var currentDirectory = Directory.GetCurrentDirectory();
                var filePath = "";
                result.Name = "Mẫu giao Target";
                result.Description = "File import target";
                filePath = currentDirectory + Utils.GetConfig("ImportTemplateFilePath:Template_Import_Target");
                if (System.IO.File.Exists(filePath))
                {
                    var bytes = System.IO.File.ReadAllBytes(filePath);
                    result.Base64 = Convert.ToBase64String(bytes);
                }
                return new ResponseDataObject<FileModel>(result, Code.Success, "");


            }
            catch (Exception ex)
            {
                Log.Error(ex.ToString());
                throw ex;
            }
        }

        public ResponseData Get(string filter)
        {
            try
            {
                IEnumerable<SysDepartment> departments;

                var filterModel = JsonConvert.DeserializeObject<TargetFilterModel>(filter);
                if (filterModel == null)
                    return new ResponseDataError(Code.BadRequest, "Filter invalid");
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);

                //nếu mức truy cập dữ liệu không phải là cao nhất hoặc Id phòng ban pass lên không phải ở mức cao nhất
                if (!_currentUser.IsManager() && !filterModel.DepartmentId.HasValue)
                {
                    filterModel.DepartmentId = _currentUser?.GetDepartmentdId();
                }

                if (_currentUser.IsManager() && !filterModel.DepartmentId.HasValue)
                {
                    string employeeAccessLevelArray = _currentUser.GetDepartmentAccess() ?? "";
                    SysDepartment departmentLevelMax = unitOfWork.Repository<SysDepartment>().Get(x => x.ParentId == null)?.FirstOrDefault();
                    departments = departmentLevelMax != null ? unitOfWork.Repository<SysDepartment>().Get(x => x.ParentId == departmentLevelMax.Id && x.IsCom && employeeAccessLevelArray.Contains(x.Id.ToString())) : null;
                }
                else
                {
                    departments = unitOfWork.Repository<SysDepartment>().Get(x => x.ParentId == filterModel.DepartmentId && x.IsCom);
                }

                int targetYearParse = filterModel.TargetYear.HasValue ? filterModel.TargetYear.Value : 0;
                List<TargetModel> result = new();

                IEnumerable<SysTarget> data = unitOfWork.Repository<SysTarget>().Get();

                var employeeAll = unitOfWork.Repository<SysUser>().Get();
                //if (filterModel.CustomerId.HasValue)
                //{
                //    data = data.Where(x => x.CustomerId == filterModel.CustomerId.Value);
                //}
                //if (filterModel.DepartmentId.HasValue)
                //{
                //    data = data.Where(x => x.DepartmentId == filterModel.DepartmentId.Value);
                //}
                //if (filterModel.ProductTypeId.HasValue)
                //{
                //    data = data.Where(x => x.ProductTypeId == filterModel.ProductTypeId.Value);
                //}
                //if (!string.IsNullOrEmpty(filterModel.TextSearch))
                //{

                //}
                //if (filterModel.Type.HasValue)
                //{
                //    data = data.Where(x => x.Type == filterModel.Type.Value);
                //}
                //if (!string.IsNullOrEmpty(filterModel.Username))
                //{
                //    data = data.Where(x => x.Username == filterModel.Username);
                //}
                //if (filterModel.TargetYear.HasValue)
                //{
                //    data = data.Where(x => x.Year == filterModel.TargetYear.Value);
                //}

                //nếu đang ở mục tiêu doanh số của phòng ban
                if (departments != null && departments.Count() > 0)
                {
                    //nếu không phải đơn vị cao nhất thì thêm dòng hiển thị "Chỉ tiêu được giao"
                    if (filterModel.DepartmentId.HasValue)
                    {
                        var targetByDepartment = data.FirstOrDefault(g => g.DepartmentId == filterModel.DepartmentId && g.Type == (int)TargetType.Department && g.Year == targetYearParse);
                        result.Add(new TargetModel()
                        {
                            Apr = targetByDepartment != null ? targetByDepartment.Apr : 0,
                            Aug = targetByDepartment != null ? targetByDepartment.Aug : 0,
                            //CustomerId = targetByDepartment != null ? targetByDepartment.CustomerId : default(Guid),
                            //CustomerName = targetByDepartment != null && targetByDepartment.CustomerId != Guid.Empty ? unitOfWork.Repository<SysCustomer>().GetById(targetByDepartment.CustomerId.Value)?.Name : string.Empty,
                            Dec = targetByDepartment != null ? targetByDepartment.Dec : 0,
                            DepartmentId = targetByDepartment != null ? targetByDepartment.DepartmentId : filterModel.DepartmentId,
                            DepartmentName = "Chỉ tiêu được giao",
                            Feb = targetByDepartment != null ? targetByDepartment.Feb : 0,
                            Id = targetByDepartment != null ? targetByDepartment.Id : default(Guid),
                            Jan = targetByDepartment != null ? targetByDepartment.Jan : 0,
                            July = targetByDepartment != null ? targetByDepartment.July : 0,
                            Jun = targetByDepartment != null ? targetByDepartment.Jun : 0,
                            Mar = targetByDepartment != null ? targetByDepartment.Mar : 0,
                            May = targetByDepartment != null ? targetByDepartment.May : 0,
                            Nov = targetByDepartment != null ? targetByDepartment.Nov : 0,
                            Oct = targetByDepartment != null ? targetByDepartment.Oct : 0,
                            //ProductId = targetByDepartment != null ? targetByDepartment.ProductId : default(Guid),
                            //ProductName = targetByDepartment != null && targetByDepartment.ProductId != Guid.Empty ? unitOfWork.Repository<SysProduct>().GetById(targetByDepartment.ProductId.Value)?.Name : string.Empty,
                            Sep = targetByDepartment != null ? targetByDepartment.Sep : 0,
                            Type = -1,
                            Username = "Chỉ tiêu được giao",
                            Fullname = "Chỉ tiêu được giao",
                            Year = targetByDepartment != null ? targetByDepartment.Year : 0,
                            //Total = targetByDepartment != null ? targetByDepartment.Apr + targetByDepartment.Aug + targetByDepartment.Dec + targetByDepartment.Feb + targetByDepartment.Jan + targetByDepartment.July + targetByDepartment.Jun + targetByDepartment.Mar + targetByDepartment.May + targetByDepartment.Nov + targetByDepartment.Oct + targetByDepartment.Sep : 0,
                            Total = targetByDepartment != null ? targetByDepartment.Total : 0,
                            DocumentId = targetByDepartment != null ? targetByDepartment.DocumentId : default(Guid),
                            CreatedByUserId = targetByDepartment != null ? targetByDepartment.CreatedByUserId : default(Guid),
                            CreatedOnDate = targetByDepartment != null ? targetByDepartment.CreatedOnDate : default(DateTime),
                            LastModifiedByUserId = targetByDepartment != null ? targetByDepartment.LastModifiedByUserId : default(Guid),
                            LastModifiedOnDate = targetByDepartment != null ? targetByDepartment.LastModifiedOnDate : default(DateTime),
                            State = targetByDepartment != null ? targetByDepartment.State : null,
                            StateName = targetByDepartment != null ? targetByDepartment.StateName : null,
                            QuantityJan = targetByDepartment != null ? targetByDepartment.QuantityJan : 0,
                            QuantityFeb = targetByDepartment != null ? targetByDepartment.QuantityFeb : 0,
                            QuantityMar = targetByDepartment != null ? targetByDepartment.QuantityMar : 0,
                            QuantityApr = targetByDepartment != null ? targetByDepartment.QuantityApr : 0,
                            QuantityMay = targetByDepartment != null ? targetByDepartment.QuantityMay : 0,
                            QuantityJun = targetByDepartment != null ? targetByDepartment.QuantityJun : 0,
                            QuantityJuly = targetByDepartment != null ? targetByDepartment.QuantityJuly : 0,
                            QuantityAug = targetByDepartment != null ? targetByDepartment.QuantityAug : 0,
                            QuantitySep = targetByDepartment != null ? targetByDepartment.QuantitySep : 0,
                            QuantityOct = targetByDepartment != null ? targetByDepartment.QuantityOct : 0,
                            QuantityNov = targetByDepartment != null ? targetByDepartment.QuantityNov : 0,
                            QuantityDec = targetByDepartment != null ? targetByDepartment.QuantityDec : 0,
                        });
                    }

                    foreach (var item in departments)
                    {
                        var targetByDepartment = data.FirstOrDefault(g => g.DepartmentId == item.Id && g.Type == (int)TargetType.Department && g.Year == targetYearParse);

                        result.Add(new TargetModel()
                        {
                            Apr = targetByDepartment != null ? targetByDepartment.Apr : 0,
                            Aug = targetByDepartment != null ? targetByDepartment.Aug : 0,
                            //CustomerId = targetByDepartment != null ? targetByDepartment.CustomerId : default(Guid),
                            //CustomerName = targetByDepartment != null && targetByDepartment.CustomerId != Guid.Empty ? unitOfWork.Repository<SysCustomer>().GetById(targetByDepartment.CustomerId.Value)?.Name : string.Empty,
                            Dec = targetByDepartment != null ? targetByDepartment.Dec : 0,
                            DepartmentId = targetByDepartment != null ? targetByDepartment.DepartmentId : item.Id,
                            DepartmentName = targetByDepartment != null && targetByDepartment.DepartmentId != Guid.Empty ? unitOfWork.Repository<SysDepartment>().GetById(targetByDepartment.DepartmentId)?.Name : item.Name,
                            Feb = targetByDepartment != null ? targetByDepartment.Feb : 0,
                            Id = targetByDepartment != null ? targetByDepartment.Id : default(Guid),
                            Jan = targetByDepartment != null ? targetByDepartment.Jan : 0,
                            July = targetByDepartment != null ? targetByDepartment.July : 0,
                            Jun = targetByDepartment != null ? targetByDepartment.Jun : 0,
                            Mar = targetByDepartment != null ? targetByDepartment.Mar : 0,
                            May = targetByDepartment != null ? targetByDepartment.May : 0,
                            Nov = targetByDepartment != null ? targetByDepartment.Nov : 0,
                            Oct = targetByDepartment != null ? targetByDepartment.Oct : 0,
                            //ProductId = targetByDepartment != null ? targetByDepartment.ProductId : default(Guid),
                            //ProductName = targetByDepartment != null && targetByDepartment.ProductId != Guid.Empty ? unitOfWork.Repository<SysProduct>().GetById(targetByDepartment.ProductId.Value)?.Name : string.Empty,
                            Sep = targetByDepartment != null ? targetByDepartment.Sep : 0,
                            Type = targetByDepartment != null ? targetByDepartment.Type : 0,
                            Username = targetByDepartment != null ? targetByDepartment.Username : null,
                            Year = targetByDepartment != null ? targetByDepartment.Year : 0,
                            //Total = targetByDepartment != null ? targetByDepartment.Apr + targetByDepartment.Aug + targetByDepartment.Dec + targetByDepartment.Feb + targetByDepartment.Jan + targetByDepartment.July + targetByDepartment.Jun + targetByDepartment.Mar + targetByDepartment.May + targetByDepartment.Nov + targetByDepartment.Oct + targetByDepartment.Sep : 0,
                            Total = targetByDepartment != null ? targetByDepartment.Total : 0,
                            DocumentId = targetByDepartment != null ? targetByDepartment.DocumentId : default(Guid),
                            CreatedByUserId = targetByDepartment != null ? targetByDepartment.CreatedByUserId : default(Guid),
                            CreatedOnDate = targetByDepartment != null ? targetByDepartment.CreatedOnDate : default(DateTime),
                            LastModifiedByUserId = targetByDepartment != null ? targetByDepartment.LastModifiedByUserId : default(Guid),
                            LastModifiedOnDate = targetByDepartment != null ? targetByDepartment.LastModifiedOnDate : default(DateTime),
                            State = targetByDepartment != null ? targetByDepartment.State : null,
                            StateName = targetByDepartment != null ? targetByDepartment.StateName : null,
                            QuantityJan = targetByDepartment != null ? targetByDepartment.QuantityJan : 0,
                            QuantityFeb = targetByDepartment != null ? targetByDepartment.QuantityFeb : 0,
                            QuantityMar = targetByDepartment != null ? targetByDepartment.QuantityMar : 0,
                            QuantityApr = targetByDepartment != null ? targetByDepartment.QuantityApr : 0,
                            QuantityMay = targetByDepartment != null ? targetByDepartment.QuantityMay : 0,
                            QuantityJun = targetByDepartment != null ? targetByDepartment.QuantityJun : 0,
                            QuantityJuly = targetByDepartment != null ? targetByDepartment.QuantityJuly : 0,
                            QuantityAug = targetByDepartment != null ? targetByDepartment.QuantityAug : 0,
                            QuantitySep = targetByDepartment != null ? targetByDepartment.QuantitySep : 0,
                            QuantityOct = targetByDepartment != null ? targetByDepartment.QuantityOct : 0,
                            QuantityNov = targetByDepartment != null ? targetByDepartment.QuantityNov : 0,
                            QuantityDec = targetByDepartment != null ? targetByDepartment.QuantityDec : 0,
                        });
                    }

                }

                //tìm kiếm mục tiêu doanh số theo cá nhân
                if (departments == null || departments.Count() <= 0)
                {
                    var targetByEmployeeHead = data.FirstOrDefault(g => g.DepartmentId == filterModel.DepartmentId && g.Type == (int)TargetType.Department && g.Year == targetYearParse);

                    result.Add(new TargetModel()
                    {
                        Apr = targetByEmployeeHead != null ? targetByEmployeeHead.Apr : 0,
                        Aug = targetByEmployeeHead != null ? targetByEmployeeHead.Aug : 0,
                        //CustomerId = targetByEmployeeHead != null ? targetByEmployeeHead.CustomerId : default(Guid),
                        //CustomerName = targetByEmployeeHead != null && targetByEmployeeHead.CustomerId != Guid.Empty ? unitOfWork.Repository<SysCustomer>().GetById(targetByEmployeeHead.CustomerId.Value)?.Name : string.Empty,
                        Dec = targetByEmployeeHead != null ? targetByEmployeeHead.Dec : 0,
                        DepartmentId = targetByEmployeeHead != null ? targetByEmployeeHead.DepartmentId : filterModel.DepartmentId,
                        DepartmentName = targetByEmployeeHead != null && targetByEmployeeHead.DepartmentId != Guid.Empty ? unitOfWork.Repository<SysDepartment>().GetById(targetByEmployeeHead.DepartmentId)?.Name : default(string),
                        Feb = targetByEmployeeHead != null ? targetByEmployeeHead.Feb : 0,
                        Id = targetByEmployeeHead != null ? targetByEmployeeHead.Id : default(Guid),
                        Jan = targetByEmployeeHead != null ? targetByEmployeeHead.Jan : 0,
                        July = targetByEmployeeHead != null ? targetByEmployeeHead.July : 0,
                        Jun = targetByEmployeeHead != null ? targetByEmployeeHead.Jun : 0,
                        Mar = targetByEmployeeHead != null ? targetByEmployeeHead.Mar : 0,
                        May = targetByEmployeeHead != null ? targetByEmployeeHead.May : 0,
                        Nov = targetByEmployeeHead != null ? targetByEmployeeHead.Nov : 0,
                        Oct = targetByEmployeeHead != null ? targetByEmployeeHead.Oct : 0,
                        //ProductId = targetByEmployeeHead != null ? targetByEmployeeHead.ProductId : default(Guid),
                        //ProductName = targetByEmployeeHead != null && targetByEmployeeHead.ProductId != Guid.Empty ? unitOfWork.Repository<SysProduct>().GetById(targetByEmployeeHead.ProductId.Value)?.Name : string.Empty,
                        Sep = targetByEmployeeHead != null ? targetByEmployeeHead.Sep : 0,
                        Type = -1,
                        Username = "Chỉ tiêu được giao",
                        Fullname = "Chỉ tiêu được giao",
                        Year = targetByEmployeeHead != null ? targetByEmployeeHead.Year : 0,
                        //Total = targetByEmployeeHead != null ? targetByEmployeeHead.Apr + targetByEmployeeHead.Aug + targetByEmployeeHead.Dec + targetByEmployeeHead.Feb + targetByEmployeeHead.Jan + targetByEmployeeHead.July + targetByEmployeeHead.Jun + targetByEmployeeHead.Mar + targetByEmployeeHead.May + targetByEmployeeHead.Nov + targetByEmployeeHead.Oct + targetByEmployeeHead.Sep : 0,
                        Total = targetByEmployeeHead != null ? targetByEmployeeHead.Total : 0,
                        DocumentId = targetByEmployeeHead != null ? targetByEmployeeHead.DocumentId : default(Guid),
                        CreatedByUserId = targetByEmployeeHead != null ? targetByEmployeeHead.CreatedByUserId : default(Guid),
                        CreatedOnDate = targetByEmployeeHead != null ? targetByEmployeeHead.CreatedOnDate : default(DateTime),
                        LastModifiedByUserId = targetByEmployeeHead != null ? targetByEmployeeHead.LastModifiedByUserId : default(Guid),
                        LastModifiedOnDate = targetByEmployeeHead != null ? targetByEmployeeHead.LastModifiedOnDate : default(DateTime),
                        State = targetByEmployeeHead != null ? targetByEmployeeHead.State : null,
                        StateName = targetByEmployeeHead != null ? targetByEmployeeHead.StateName : null,
                        QuantityJan = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityJan : 0,
                        QuantityFeb = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityFeb : 0,
                        QuantityMar = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityMar : 0,
                        QuantityApr = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityApr : 0,
                        QuantityMay = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityMay : 0,
                        QuantityJun = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityJun : 0,
                        QuantityJuly = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityJuly : 0,
                        QuantityAug = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityAug : 0,
                        QuantitySep = targetByEmployeeHead != null ? targetByEmployeeHead.QuantitySep : 0,
                        QuantityOct = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityOct : 0,
                        QuantityNov = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityNov : 0,
                        QuantityDec = targetByEmployeeHead != null ? targetByEmployeeHead.QuantityDec : 0,
                    });

                    var employeeBelongDepartment = employeeAll.Where(g => g.DepartmentId == filterModel.DepartmentId);
                    if (employeeBelongDepartment != null && employeeBelongDepartment.Count() > 0)
                    {
                        foreach (var item in employeeBelongDepartment)
                        {
                            var targetByEmployee = data.FirstOrDefault(g => g.DepartmentId == item.DepartmentId && g.Type == (int)TargetType.Personal && g.Username == item.Username && g.Year == targetYearParse);

                            result.Add(new TargetModel()
                            {
                                Apr = targetByEmployee != null ? targetByEmployee.Apr : 0,
                                Aug = targetByEmployee != null ? targetByEmployee.Aug : 0,
                                //CustomerId = targetByEmployee != null ? targetByEmployee.CustomerId : default(Guid),
                                //CustomerName = targetByEmployee != null && targetByEmployee.CustomerId != Guid.Empty ? unitOfWork.Repository<SysCustomer>().GetById(targetByEmployee.CustomerId.Value)?.Name : string.Empty,
                                Dec = targetByEmployee != null ? targetByEmployee.Dec : 0,
                                DepartmentId = targetByEmployee != null ? targetByEmployee.DepartmentId : item.DepartmentId,
                                DepartmentName = targetByEmployee != null && targetByEmployee.DepartmentId != Guid.Empty ? unitOfWork.Repository<SysDepartment>().GetById(targetByEmployee.DepartmentId)?.Name : "",
                                Feb = targetByEmployee != null ? targetByEmployee.Feb : 0,
                                Id = targetByEmployee != null ? targetByEmployee.Id : default(Guid),
                                Jan = targetByEmployee != null ? targetByEmployee.Jan : 0,
                                July = targetByEmployee != null ? targetByEmployee.July : 0,
                                Jun = targetByEmployee != null ? targetByEmployee.Jun : 0,
                                Mar = targetByEmployee != null ? targetByEmployee.Mar : 0,
                                May = targetByEmployee != null ? targetByEmployee.May : 0,
                                Nov = targetByEmployee != null ? targetByEmployee.Nov : 0,
                                Oct = targetByEmployee != null ? targetByEmployee.Oct : 0,
                                //ProductId = targetByEmployee != null ? targetByEmployee.ProductId : default(Guid),
                                //ProductName = targetByEmployee != null && targetByEmployee.ProductId != Guid.Empty ? unitOfWork.Repository<SysProduct>().GetById(targetByEmployee.ProductId.Value)?.Name : string.Empty,
                                Sep = targetByEmployee != null ? targetByEmployee.Sep : 0,
                                Type = targetByEmployee != null ? targetByEmployee.Type : 1,
                                Fullname = targetByEmployee != null && !string.IsNullOrEmpty(targetByEmployee.Username) ? employeeAll.Where(g => g.Username == targetByEmployee.Username)?.FirstOrDefault()?.Fullname : item.Fullname,
                                Username = targetByEmployee != null && !string.IsNullOrEmpty(targetByEmployee.Username) ? targetByEmployee.Username : item.Username,
                                Year = targetByEmployee != null ? targetByEmployee.Year : 0,
                                //Total = targetByEmployee != null ? targetByEmployee.Apr + targetByEmployee.Aug + targetByEmployee.Dec + targetByEmployee.Feb + targetByEmployee.Jan + targetByEmployee.July + targetByEmployee.Jun + targetByEmployee.Mar + targetByEmployee.May + targetByEmployee.Nov + targetByEmployee.Oct + targetByEmployee.Sep : 0,
                                Total = targetByEmployee != null ? targetByEmployee.Total : 0,
                                DocumentId = targetByEmployee != null ? targetByEmployee.DocumentId : default(Guid),
                                CreatedByUserId = targetByEmployee != null ? targetByEmployee.CreatedByUserId : default(Guid),
                                CreatedOnDate = targetByEmployee != null ? targetByEmployee.CreatedOnDate : default(DateTime),
                                LastModifiedByUserId = targetByEmployee != null ? targetByEmployee.LastModifiedByUserId : default(Guid),
                                LastModifiedOnDate = targetByEmployee != null ? targetByEmployee.LastModifiedOnDate : default(DateTime),
                                State = targetByEmployee != null ? targetByEmployee.State : null,
                                StateName = targetByEmployee != null ? targetByEmployee.StateName : null,
                                QuantityJan = targetByEmployee != null ? targetByEmployee.QuantityJan : 0,
                                QuantityFeb = targetByEmployee != null ? targetByEmployee.QuantityFeb : 0,
                                QuantityMar = targetByEmployee != null ? targetByEmployee.QuantityMar : 0,
                                QuantityApr = targetByEmployee != null ? targetByEmployee.QuantityApr : 0,
                                QuantityMay = targetByEmployee != null ? targetByEmployee.QuantityMay : 0,
                                QuantityJun = targetByEmployee != null ? targetByEmployee.QuantityJun : 0,
                                QuantityJuly = targetByEmployee != null ? targetByEmployee.QuantityJuly : 0,
                                QuantityAug = targetByEmployee != null ? targetByEmployee.QuantityAug : 0,
                                QuantitySep = targetByEmployee != null ? targetByEmployee.QuantitySep : 0,
                                QuantityOct = targetByEmployee != null ? targetByEmployee.QuantityOct : 0,
                                QuantityNov = targetByEmployee != null ? targetByEmployee.QuantityNov : 0,
                                QuantityDec = targetByEmployee != null ? targetByEmployee.QuantityDec : 0,
                            });
                        }

                    }
                }

                decimal dDecimal = default(decimal);
                var (iJan, iFeb, iMar, iApr, iMay, iJun, iJuly, iAug, iSep, iOct, iNov, iDec, iTotal) = (dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal, dDecimal);

                if (result != null && result.Count() > 0)
                {
                    iJan = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Jan);
                    iFeb = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Feb);
                    iMar = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Mar);
                    iApr = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Apr);
                    iMay = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.May);
                    iJun = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Jun);
                    iJuly = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.July);
                    iAug = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Aug);
                    iSep = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Sep);
                    iOct = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Oct);
                    iNov = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Nov);
                    iDec = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Dec);
                    iTotal = result.Where(g => g.Type == (int)TargetType.Department || g.Type == (int)TargetType.Personal).Sum(g => g.Total);
                }

                var summaryTotal = new TargetModel()
                {
                    Apr = iApr,
                    Aug = iAug,
                    Dec = iDec,
                    Feb = iFeb,
                    Id = default(Guid),
                    Jan = iJan,
                    July = iJuly,
                    Jun = iJun,
                    Mar = iMar,
                    May = iMay,
                    Nov = iNov,
                    Oct = iOct,
                    Sep = iSep,
                    Type = 2,
                    Username = "Tổng",
                    Fullname = "Tổng",
                    Year = targetYearParse,
                    //Total = iJan + iFeb + iMar + iApr + iMay + iJun + iJuly + iAug + iSep + iOct + iNov + iDec,
                    Total = iTotal,
                };
                return new ResponseDataObject<List<TargetModel>>(result, summaryTotal, Code.Success, "Success");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseData GetById(Guid id)
        {
            throw new NotImplementedException();
        }

        public ResponseData Import(TargetImportModel importModel)
        {
            try
            {
                //xóa cache data
                _cached.FlushNameSpace($"{this.GetType().Name}");
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);

                List<Dictionary<string, string>> errorDetails = new();
                Spire.Xls.Workbook workbook = new();
                workbook.LoadFromStream(importModel.File.OpenReadStream());
                Spire.Xls.Worksheet sheet = workbook.Worksheets[0];

                var dt = sheet.ExportDataTable();

                //if (dt.Columns[0].ColumnName != TargetExcelColumnName.col0
                //    || dt.Columns[1].ColumnName != TargetExcelColumnName.col1
                //    //|| dt.Columns[2].ColumnName != TargetExcelColumnName.col2
                //    //|| dt.Columns[3].ColumnName != TargetExcelColumnName.col3
                //    || dt.Columns[2].ColumnName != TargetExcelColumnName.col4
                //    || dt.Columns[3].ColumnName != TargetExcelColumnName.col5
                //    || dt.Columns[4].ColumnName != TargetExcelColumnName.col6
                //    || dt.Columns[5].ColumnName != TargetExcelColumnName.col7
                //    || dt.Columns[6].ColumnName != TargetExcelColumnName.col8
                //    || dt.Columns[7].ColumnName != TargetExcelColumnName.col9
                //    || dt.Columns[8].ColumnName != TargetExcelColumnName.col10
                //    || dt.Columns[9].ColumnName != TargetExcelColumnName.col11
                //    || dt.Columns[10].ColumnName != TargetExcelColumnName.col12
                //    || dt.Columns[11].ColumnName != TargetExcelColumnName.col13
                //    || dt.Columns[12].ColumnName != TargetExcelColumnName.col14
                //    || dt.Columns[13].ColumnName != TargetExcelColumnName.col15
                //    || dt.Columns[14].ColumnName != TargetExcelColumnName.col16
                //    || dt.Columns[15].ColumnName != TargetExcelColumnName.col17
                //    || dt.Columns[16].ColumnName != TargetExcelColumnName.col18
                //    || dt.Columns[17].ColumnName != TargetExcelColumnName.col19
                //    || dt.Columns[18].ColumnName != TargetExcelColumnName.col20
                //    || dt.Columns[19].ColumnName != TargetExcelColumnName.col21
                //    || dt.Columns[20].ColumnName != TargetExcelColumnName.col22)
                //{
                //    Dictionary<string, string> error = new() { { "Format", "File không đúng định dạng" } };
                //    errorDetails.Add(error);
                //}

                var infoDepartment = importModel.DepartmentId.HasValue ? unitOfWork.Repository<SysDepartment>().GetById(importModel.DepartmentId.Value) : null;
                var parentDepartment = infoDepartment != null ? infoDepartment.ParentId : Guid.Empty;

                SysTarget target = null;
                if (importModel.Type == (int)Constant.TargetType.Department)
                {
                    target = unitOfWork.Repository<SysTarget>().Get(x => x.Type == (int)Constant.TargetType.Department && x.Year == importModel.Year && x.DepartmentId == importModel.DepartmentId.Value)?.FirstOrDefault();
                }
                else
                {
                    target = unitOfWork.Repository<SysTarget>().Get(x => x.Type == (int)Constant.TargetType.Personal && x.Username == importModel.Username && x.Year == importModel.Year && x.DepartmentId == importModel.DepartmentId.Value)?.FirstOrDefault();
                }
                var targetMappings = target != null ? unitOfWork.Repository<SysTargetMapping>().Get(x => x.TargetId == target.Id) : null;

                //biến lưu trữ dữ liệu để insert giá trị tổng mục tiêu doanh số vào bảng targets
                var dDefault = default(decimal);
                var (sumJan, sumFeb, sumMar, sumApr, sumMay, sumJun, sumJuly, sumAug, sumSep, sumOct, sumNov, sumDec) = (dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault);

                var iDefault = default(int);
                var (sumQuantityJan, sumQuantityFeb, sumQuantityMar, sumQuantityApr, sumQuantityMay, sumQuantityJun, sumQuantityJuly, sumQuantityAug, sumQuantitySep, sumQuantityOct, sumQuantityNov, sumQuantityDec) = (iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault);


                var targetMappingStores = new List<SysTargetMapping>();
                foreach (DataRow item in dt.Rows)
                {
                    int index = dt.Rows.IndexOf(item);
                    if (index < 3)
                    {
                        continue;
                    }
                    //var productCode = item.GetValue(TargetExcelColumnName.col0)?.ToString();
                    var productTypeName = item[0]?.ToString();
                    if (string.IsNullOrEmpty(productTypeName))
                    {
                        continue;
                    }
                    var productType = unitOfWork.Repository<SysProductType>().Get(x => x.Name == productTypeName.Trim()).FirstOrDefault();

                    //tạm thời những cái nào không có thì sẽ bỏ qua
                    if (productType == null)
                    {
                        //Dictionary<string, string> error = new() { { "Data", "Loại sản phẩm " + productTypeName.Trim() + " không tồn tại" } };
                        //errorDetails.Add(error);
                        continue;
                    }

                    //lấy doanh thu
                    _ = decimal.TryParse(item[4].ToString().Replace(",", ""), out decimal t1);
                    _ = decimal.TryParse(item[6].ToString().Replace(",", ""), out decimal t2);
                    _ = decimal.TryParse(item[8].ToString().Replace(",", ""), out decimal t3);
                    _ = decimal.TryParse(item[10].ToString().Replace(",", ""), out decimal t4);
                    _ = decimal.TryParse(item[12].ToString().Replace(",", ""), out decimal t5);
                    _ = decimal.TryParse(item[14].ToString().Replace(",", ""), out decimal t6);
                    _ = decimal.TryParse(item[16].ToString().Replace(",", ""), out decimal t7);
                    _ = decimal.TryParse(item[18].ToString().Replace(",", ""), out decimal t8);
                    _ = decimal.TryParse(item[20].ToString().Replace(",", ""), out decimal t9);
                    _ = decimal.TryParse(item[22].ToString().Replace(",", ""), out decimal t10);
                    _ = decimal.TryParse(item[24].ToString().Replace(",", ""), out decimal t11);
                    _ = decimal.TryParse(item[26].ToString().Replace(",", ""), out decimal t12);

                    //lấy số lượng
                    _ = int.TryParse(item[3].ToString().Replace(",", ""), out int quantityJan);
                    _ = int.TryParse(item[5].ToString().Replace(",", ""), out int quantityFeb);
                    _ = int.TryParse(item[7].ToString().Replace(",", ""), out int quantityMar);
                    _ = int.TryParse(item[9].ToString().Replace(",", ""), out int quantityApr);
                    _ = int.TryParse(item[11].ToString().Replace(",", ""), out int quantityMay);
                    _ = int.TryParse(item[13].ToString().Replace(",", ""), out int quantityJun);
                    _ = int.TryParse(item[15].ToString().Replace(",", ""), out int quantityJuly);
                    _ = int.TryParse(item[17].ToString().Replace(",", ""), out int quantityAug);
                    _ = int.TryParse(item[19].ToString().Replace(",", ""), out int quantitySep);
                    _ = int.TryParse(item[21].ToString().Replace(",", ""), out int quantityOct);
                    _ = int.TryParse(item[23].ToString().Replace(",", ""), out int quantityNov);
                    _ = int.TryParse(item[25].ToString().Replace(",", ""), out int quantityDec);

                    sumJan += t1;
                    sumFeb += t2;
                    sumMar += t3;
                    sumApr += t4;
                    sumMay += t5;
                    sumJun += t6;
                    sumJuly += t7;
                    sumAug += t8;
                    sumSep += t9;
                    sumOct += t10;
                    sumNov += t11;
                    sumDec += t12;

                    sumQuantityJan += quantityJan;
                    sumQuantityFeb += quantityFeb;
                    sumQuantityMar += quantityMar;
                    sumQuantityApr += quantityApr;
                    sumQuantityMay += quantityMay;
                    sumQuantityJun += quantityJun;
                    sumQuantityJuly += quantityJuly;
                    sumQuantityAug += quantityAug;
                    sumQuantitySep += quantitySep;
                    sumQuantityOct += quantityOct;
                    sumQuantityNov += quantityNov;
                    sumQuantityDec += quantityDec;

                    var existData = targetMappings != null && targetMappings.Count() > 0 ? targetMappings.Where(x => x.ProductTypeId == productType.Id)?.FirstOrDefault() : null;

                    var targetMappingStore = new SysTargetMapping()
                    {
                        ProductTypeId = productType.Id,
                        //CustomerCategoryId = customerCategory.Id,
                        Jan = t1,
                        Feb = t2,
                        Mar = t3,
                        Apr = t4,
                        May = t5,
                        Jun = t6,
                        July = t7,
                        Aug = t8,
                        Sep = t9,
                        Oct = t10,
                        Nov = t11,
                        Dec = t12,
                        QuantityJan = quantityJan,
                        QuantityFeb = quantityFeb,
                        QuantityMar = quantityMar,
                        QuantityApr = quantityApr,
                        QuantityMay = quantityMay,
                        QuantityJun = quantityJun,
                        QuantityJuly = quantityJuly,
                        QuantityAug = quantityAug,
                        QuantitySep = quantitySep,
                        QuantityOct = quantityOct,
                        QuantityNov = quantityNov,
                        QuantityDec = quantityDec,
                        TotalQuantity = quantityJan + quantityFeb + quantityMar + quantityApr + quantityMay + quantityJun + quantityJuly + quantityAug + quantitySep + quantityOct + quantityNov + quantityDec,
                        Total = t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8 + t9 + t10 + t11 + t12
                    };
                    //var checkExist = targetMappingStores.Where(g => g.ProductId == product.Id && g.CustomerCategoryId == customerCategory.Id);
                    var checkExist = targetMappingStores.Where(g => g.ProductTypeId == productType.Id);

                    //nếu có dòng dữ liệu có cùng mã sản phẩm và mã đối tượng khách hàng rồi thì những dòng phía sau sẽ bỏ qua
                    if (checkExist != null && checkExist.Count() > 0)
                    {
                        //không làm gì cả
                    }
                    else
                    {
                        targetMappingStores.Add(targetMappingStore);
                    }
                }

                //#region tiến hành validate mục tiêu doanh số của bản ghi upsert không được vượt "chỉ tiêu được giao" của phòng ban cha

                //if (departmentId != default(Guid))
                //{
                //    IEnumerable<SysTarget> targetDepartments;
                //    var targetParentDepartment = unitOfWork.Repository<SysTarget>().Get(g => g.DepartmentId == parentDepartment && g.Type == (int)Constant.TargetType.Department && g.Year == year)?.FirstOrDefault();
                //    if (type == (int)Constant.TargetType.Department)//nếu bản ghi có loại là phòng ban -> tiến hành lấy phòng ban cha
                //    {
                //        var departments = departmentId != default(Guid) ? unitOfWork.Repository<SysDepartment>().Get(g => g.ParentId == parentDepartment) : null;
                //        targetDepartments = unitOfWork.Repository<SysTarget>().Get(g => departments.Select(g => g.Id).ToList().Contains(g.DepartmentId.Value) && g.DepartmentId.Value != departmentId && g.Type == (int)Constant.TargetType.Department && g.Year == year);
                //    }
                //    else
                //    {
                //        var employee = responseDataUser?.Data ?? new List<UserModel>();
                //        var employeeDepartments = employee.Where(g => g.DepartmentId == departmentId);
                //        targetDepartments = unitOfWork.Repository<SysTarget>().Get(g => g.Type == (int)Constant.TargetType.Personal && g.Username != username && employeeDepartments.Select(g => g.Username).ToList().Contains(g.Username) && g.Year == year);
                //    }

                //    if (targetParentDepartment == null && parentDepartment != null)
                //    {
                //        return new ResponseDataError(Code.NotFound, "Chưa có mục tiêu doanh số của phòng ban cha tương ứng");
                //    }
                //    if ((targetParentDepartment != null) && targetParentDepartment.Total < (sumJan + sumFeb + sumMar + sumApr + sumMay + sumJun + sumJuly + sumAug + sumSep + sumOct + sumNov + sumDec))
                //    {
                //        return new ResponseDataError(Code.NotFound, "Mục tiêu doanh số đang vượt quá định mức");
                //    }
                //}
                //#endregion

                if (errorDetails.Count != 0)
                {
                    workbook.Dispose();
                    return new ResponseDataError(Code.BadRequest, Newtonsoft.Json.JsonConvert.SerializeObject(errorDetails), errorDetails);
                }
                else
                {

                    //nếu chưa có bản ghi trong bảng target
                    if (target == null)
                    {
                        Guid? docId = null;
                        string state = null;
                        string stateName = null;

                        var objSave = new SysTarget()
                        {
                            Id = Guid.NewGuid(),
                            Type = importModel.Type,
                            Year = importModel.Year,
                            DepartmentId = importModel.DepartmentId,
                            Username = importModel.Username,
                            Jan = sumJan,
                            Feb = sumFeb,
                            Mar = sumMar,
                            Apr = sumApr,
                            May = sumMay,
                            Jun = sumJun,
                            July = sumJuly,
                            Aug = sumAug,
                            Sep = sumSep,
                            Oct = sumOct,
                            Nov = sumNov,
                            Dec = sumDec,
                            QuantityJan = sumQuantityJan,
                            QuantityFeb = sumQuantityFeb,
                            QuantityMar = sumQuantityMar,
                            QuantityApr = sumQuantityApr,
                            QuantityMay = sumQuantityMay,
                            QuantityJun = sumQuantityJun,
                            QuantityJuly = sumQuantityJuly,
                            QuantityAug = sumQuantityAug,
                            QuantitySep = sumQuantitySep,
                            QuantityOct = sumQuantityOct,
                            QuantityNov = sumQuantityNov,
                            QuantityDec = sumQuantityDec,
                            Total = sumJan + sumFeb + sumMar + sumApr + sumMay + sumJun + sumJuly + sumAug + sumSep + sumOct + sumNov + sumDec,
                            TotalQuantity = sumQuantityJan + sumQuantityFeb + sumQuantityMar + sumQuantityApr + sumQuantityMay + sumQuantityJun + sumQuantityJuly + sumQuantityAug + sumQuantitySep + sumQuantityOct + sumQuantityNov + sumQuantityDec,
                            CreatedByUserId = _currentUser.GetUserId(),
                            LastModifiedByUserId = _currentUser.GetUserId(),
                            DocumentId = docId.HasValue ? docId : null,
                            State = state,
                            StateName = stateName
                        };
                        unitOfWork.Repository<SysTarget>().Insert(objSave);

                        //tiến hành thêm bản ghi vào bảng targetmappings

                        foreach (var item in targetMappingStores)
                        {
                            int amountByProduct = item.QuantityJan + item.QuantityFeb + item.QuantityMar + item.QuantityApr + item.QuantityMay + item.QuantityJun + item.QuantityJuly + item.QuantityAug + item.QuantitySep + item.QuantityOct + item.QuantityNov + item.QuantityDec;
                            decimal turnOverByProduct = item.Jan + item.Feb + item.Mar + item.Apr + item.May + item.Jun + item.July + item.Aug + item.Sep + item.Oct + item.Nov + item.Dec;
                            unitOfWork.Repository<SysTargetMapping>().Insert(new SysTargetMapping()
                            {
                                Id = Guid.NewGuid(),
                                ProductTypeId = item.ProductTypeId,
                                //CustomerCategoryId = item.CustomerCategoryId,
                                TargetId = objSave.Id,
                                Jan = item.Jan,
                                Feb = item.Feb,
                                Mar = item.Mar,
                                Apr = item.Apr,
                                May = item.May,
                                Jun = item.Jun,
                                July = item.July,
                                Aug = item.Aug,
                                Sep = item.Sep,
                                Oct = item.Oct,
                                Nov = item.Nov,
                                Dec = item.Dec,
                                QuantityJan = item.QuantityJan,
                                QuantityFeb = item.QuantityFeb,
                                QuantityMar = item.QuantityMar,
                                QuantityApr = item.QuantityApr,
                                QuantityMay = item.QuantityMay,
                                QuantityJun = item.QuantityJun,
                                QuantityJuly = item.QuantityJuly,
                                QuantityAug = item.QuantityAug,
                                QuantitySep = item.QuantitySep,
                                QuantityOct = item.QuantityOct,
                                QuantityNov = item.QuantityNov,
                                QuantityDec = item.QuantityDec,
                                Total = turnOverByProduct,
                                TotalQuantity = amountByProduct,
                                CreatedByUserId = _currentUser.GetUserId(),
                                LastModifiedByUserId = _currentUser.GetUserId(),
                            });
                        }
                    }
                    else // nếu có bản ghi trong bảng target tiến hành cập nhật
                    {
                        target.Jan = sumJan;
                        target.Feb = sumFeb;
                        target.Mar = sumMar;
                        target.Apr = sumApr;
                        target.May = sumMay;
                        target.Jun = sumJun;
                        target.July = sumJuly;
                        target.Aug = sumAug;
                        target.Sep = sumSep;
                        target.Oct = sumOct;
                        target.Nov = sumNov;
                        target.Dec = sumDec;
                        target.QuantityJan = sumQuantityJan;
                        target.QuantityFeb = sumQuantityFeb;
                        target.QuantityMar = sumQuantityMar;
                        target.QuantityApr = sumQuantityApr;
                        target.QuantityMay = sumQuantityMay;
                        target.QuantityJun = sumQuantityJun;
                        target.QuantityJuly = sumQuantityJuly;
                        target.QuantityAug = sumQuantityAug;
                        target.QuantitySep = sumQuantitySep;
                        target.QuantityOct = sumQuantityOct;
                        target.QuantityNov = sumQuantityNov;
                        target.QuantityDec = sumQuantityDec;
                        target.Total = sumJan + sumFeb + sumMar + sumApr + sumMay + sumJun + sumJuly + sumAug + sumSep + sumOct + sumNov + sumDec;
                        target.TotalQuantity = sumQuantityJan + sumQuantityFeb + sumQuantityMar + sumQuantityApr + sumQuantityMay + sumQuantityJun + sumQuantityJuly + sumQuantityAug + sumQuantitySep + sumQuantityOct + sumQuantityNov + sumQuantityDec;
                        unitOfWork.Repository<SysTarget>().Update(target);


                        //tiến hành ghi bản ghi vào bảng targetmappings
                        foreach (var item in targetMappingStores)
                        {
                            //var existData = targetMappings != null && targetMappings.Count() > 0 ? targetMappings.Where(x => x.ProductTypeId == item.ProductTypeId && x.CustomerCategoryId == item.CustomerCategoryId)?.FirstOrDefault() : null;
                            var existData = targetMappings != null && targetMappings.Count() > 0 ? targetMappings.Where(x => x.ProductTypeId == item.ProductTypeId)?.FirstOrDefault() : null;

                            if (existData != null)
                            {
                                existData.Jan = item.Jan;
                                existData.Feb = item.Feb;
                                existData.Mar = item.Mar;
                                existData.Apr = item.Apr;
                                existData.May = item.May;
                                existData.Jun = item.July;
                                existData.July = item.July;
                                existData.Aug = item.Aug;
                                existData.Sep = item.Sep;
                                existData.Oct = item.Oct;
                                existData.Nov = item.Nov;
                                existData.Dec = item.Dec;
                                existData.QuantityJan = item.QuantityJan;
                                existData.QuantityFeb = item.QuantityFeb;
                                existData.QuantityMar = item.QuantityMar;
                                existData.QuantityApr = item.QuantityApr;
                                existData.QuantityMay = item.QuantityMay;
                                existData.QuantityJun = item.QuantityJun;
                                existData.QuantityJuly = item.QuantityJuly;
                                existData.QuantityAug = item.QuantityAug;
                                existData.QuantitySep = item.QuantitySep;
                                existData.QuantityOct = item.QuantityOct;
                                existData.QuantityNov = item.QuantityNov;
                                existData.QuantityDec = item.QuantityDec;
                                int amountByProduct = item.QuantityJan + item.QuantityFeb + item.QuantityMar + item.QuantityApr + item.QuantityMay + item.QuantityJun + item.QuantityJuly + item.QuantityAug + item.QuantitySep + item.QuantityOct + item.QuantityNov + item.QuantityDec;
                                decimal turnOverByProduct = item.Jan + item.Feb + item.Mar + item.Apr + item.May + item.Jun + item.July + item.Aug + item.Sep + item.Oct + item.Nov + item.Dec;
                                existData.Total = turnOverByProduct;
                                existData.TotalQuantity = amountByProduct;
                                unitOfWork.Repository<SysTargetMapping>().Update(existData);
                            }
                            else
                            {
                                int amountByProduct = item.QuantityJan + item.QuantityFeb + item.QuantityMar + item.QuantityApr + item.QuantityMay + item.QuantityJun + item.QuantityJuly + item.QuantityAug + item.QuantitySep + item.QuantityOct + item.QuantityNov + item.QuantityDec;
                                decimal turnOverByProduct = item.Jan + item.Feb + item.Mar + item.Apr + item.May + item.Jun + item.July + item.Aug + item.Sep + item.Oct + item.Nov + item.Dec;

                                unitOfWork.Repository<SysTargetMapping>().Insert(new SysTargetMapping()
                                {
                                    Id = Guid.NewGuid(),
                                    TargetId = target.Id,
                                    ProductTypeId = item.ProductTypeId,
                                    //CustomerCategoryId = item.CustomerCategoryId,
                                    Jan = item.Jan,
                                    Feb = item.Feb,
                                    Mar = item.Mar,
                                    Apr = item.Apr,
                                    May = item.May,
                                    Jun = item.Jun,
                                    July = item.July,
                                    Aug = item.Aug,
                                    Sep = item.Sep,
                                    Oct = item.Oct,
                                    Nov = item.Nov,
                                    Dec = item.Dec,
                                    Total = turnOverByProduct,
                                    QuantityJan = item.QuantityJan,
                                    QuantityFeb = item.QuantityFeb,
                                    QuantityMar = item.QuantityMar,
                                    QuantityApr = item.QuantityApr,
                                    QuantityMay = item.QuantityMay,
                                    QuantityJun = item.QuantityJun,
                                    QuantityJuly = item.QuantityJuly,
                                    QuantityAug = item.QuantityAug,
                                    QuantitySep = item.QuantitySep,
                                    QuantityOct = item.QuantityOct,
                                    QuantityNov = item.QuantityNov,
                                    QuantityDec = item.QuantityDec,
                                    TotalQuantity = amountByProduct,
                                    CreatedByUserId = _currentUser.GetUserId(),
                                    LastModifiedByUserId = _currentUser.GetUserId(),
                                });
                            }
                        }
                    }

                    //lưu lịch sử thay đổi vào bảng HistoryTargets
                    SysHistoryTarget insertHistoryTarget = new SysHistoryTarget()
                    {
                        Id = Guid.NewGuid(),
                        Type = importModel.Type,
                        Year = importModel.Year,
                        DepartmentId = importModel.DepartmentId.Value,
                        ActionDate = DateTime.Now,
                        Description = importModel.Description
                    };
                    unitOfWork.Repository<SysHistoryTarget>().Insert(insertHistoryTarget);
                    unitOfWork.Save();

                    var userRecieveEmail = importModel.UserNotification;
                    if (userRecieveEmail != null && userRecieveEmail.Count() > 0)
                    {
                        ////gửi thông báo
                        //Dictionary<string, string> dic = new Dictionary<string, string>();
                        //string messageNotification = $"{file.Description}";
                        //SendMessages(userRecieveEmail, messageNotification, dic);

                        //// todo: build template email

                        ////var toEmail = responseDataUser.Data.Where(g => userRecieveEmail.Contains(g.Id)).Select(x => x.Email).ToList();
                        //var toEmail = unitOfWork.Repository<SysUser>().Get(g => userRecieveEmail.Contains(g.Id)).Select(x => x.Email).ToList();
                        //HttpResponseMessage response = new HttpResponseMessage();
                        //response = client.PostAsJsonAsync(emailServiceUrl + "email/async", new EmailServiceModel()
                        //{
                        //    Body = $"{file.Description}",
                        //    Subject = "Thông báo thay đổi về target",
                        //    ToEmail = toEmail
                        //}).Result;
                    }
                    return new ResponseData(Code.Success, "Success");
                }
            }
            catch (Exception e)
            {
                Log.Error(e, e.Message);
                return new ResponseDataError(Code.ServerError, e.Message);
            }
        }
        private async Task SendMessages(List<Guid> userIdRecieveMessages, string messages, Dictionary<string, string> data)
        {
            ResponseData responseDataNotification = null;
            var message = new MessageModel()
            {
                Users = userIdRecieveMessages,
                Type = 0,
                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Title = "Thông báo",
                    Body = messages
                },
                Data = data
            };
            HttpResponseMessage responseNotification = await client.PostAsJsonAsync(notificationServiceUrl + $"Message", message);
            if (responseNotification.IsSuccessStatusCode)
            {
                responseDataNotification = await responseNotification.Content.ReadFromJsonAsync<ResponseData>();
            }
        }
        public ResponseData PracticeTarget(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                //var data = unitOfWork.Repository<SysTarget>().Get(g => g.Type == type && g.Year == year && g.DepartmentId == departmentId);
                //var data = unitOfWork.Repository<SysTarget>().Get(g => g.Id == id);

                //var exitsData = data != null && data.Count() > 0 ? data.FirstOrDefault() : null;
                var exitsData = unitOfWork.Repository<SysTarget>().GetById(id);
                if (exitsData == null)
                {
                    return new ResponseDataError(Code.NotFound, "Id not found");
                }
                var username = _currentUser.Name;

                var targetMappings = exitsData != null ? unitOfWork.Repository<SysTargetMapping>().Get(g => g.TargetId == exitsData.Id) : null;
                var targets = targetMappings != null ? _mapper.Map<List<TargetMappingModel>>(targetMappings) : default;
                var result = new TargetModel()
                {
                    Apr = exitsData != null ? exitsData.Apr : 0,
                    Aug = exitsData != null ? exitsData.Aug : 0,
                    //CustomerId = exitsData.CustomerId,
                    //CustomerName = exitsData.CustomerId != Guid.Empty ? unitOfWork.Repository<SysCustomer>().GetById(exitsData.CustomerId.Value)?.Name : string.Empty,
                    Dec = exitsData != null ? exitsData.Dec : 0,
                    DepartmentId = exitsData.DepartmentId,
                    DepartmentName = exitsData != null && exitsData.DepartmentId.HasValue ? unitOfWork.Repository<SysDepartment>().GetById(exitsData.DepartmentId)?.Name : string.Empty,
                    Feb = exitsData != null ? exitsData.Feb : 0,
                    Id = exitsData != null ? exitsData.Id : default(Guid),
                    Jan = exitsData != null ? exitsData.Jan : 0,
                    July = exitsData != null ? exitsData.July : 0,
                    Jun = exitsData != null ? exitsData.Jun : 0,
                    Mar = exitsData != null ? exitsData.Mar : 0,
                    May = exitsData != null ? exitsData.May : 0,
                    Nov = exitsData != null ? exitsData.Nov : 0,
                    Oct = exitsData != null ? exitsData.Oct : 0,
                    //ProductId = exitsData.ProductId,
                    //ProductName = exitsData.ProductId != Guid.Empty ? unitOfWork.Repository<SysProduct>().GetById(exitsData.ProductId.Value)?.Name : string.Empty,
                    Sep = exitsData != null ? exitsData.Sep : 0,
                    Type = exitsData.Type,
                    TypeName = exitsData.Type == 0 ? "Phòng ban" : exitsData.Type == 1 ? "Cá nhân" : null,
                    Username = exitsData != null ? exitsData.Username : string.Empty,
                    Year = exitsData.Year,
                    Total = exitsData != null ? exitsData.Total : 0,

                    CreatedByUserId = exitsData != null ? exitsData.CreatedByUserId : default(Guid),
                    CreatedOnDate = exitsData != null ? exitsData.CreatedOnDate : default,
                    LastModifiedByUserId = exitsData != null ? exitsData.LastModifiedByUserId : default,
                    LastModifiedOnDate = exitsData != null ? exitsData.LastModifiedOnDate : default,
                    QuantityJan = exitsData != null ? exitsData.QuantityJan : 0,
                    QuantityFeb = exitsData != null ? exitsData.QuantityFeb : 0,
                    QuantityMar = exitsData != null ? exitsData.QuantityMar : 0,
                    QuantityApr = exitsData != null ? exitsData.QuantityApr : 0,
                    QuantityMay = exitsData != null ? exitsData.QuantityMay : 0,
                    QuantityJun = exitsData != null ? exitsData.QuantityJun : 0,
                    QuantityJuly = exitsData != null ? exitsData.QuantityJuly : 0,
                    QuantityAug = exitsData != null ? exitsData.QuantityAug : 0,
                    QuantitySep = exitsData != null ? exitsData.QuantitySep : 0,
                    QuantityOct = exitsData != null ? exitsData.QuantityOct : 0,
                    QuantityNov = exitsData != null ? exitsData.QuantityNov : 0,
                    QuantityDec = exitsData != null ? exitsData.QuantityDec : 0,
                    Targets = targets
                };
                return new ResponseDataObject<TargetModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData UpSert(Guid? departmentId, TargetModel model)
        {
            throw new NotImplementedException();
        }

        public ResponseData UpSertList(Guid? departmentId, List<TargetModel> targets)
        {
            throw new NotImplementedException();
        }

        public ResponseData UpSertTargetMapping(Guid targetId, TargetModel target)
        {
            try
            {
                //xóa cache data
                _cached.FlushNameSpace($"{this.GetType().Name}");
                var model = target.Targets ?? new List<TargetMappingModel>() { new TargetMappingModel() };
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var username = _currentUser.Name;

                //#region tiến hành validate mục tiêu doanh số của bản ghi upsert không được vượt "chỉ tiêu được giao" của phòng ban cha


                var targetEntity = unitOfWork.Repository<SysTarget>().GetById(targetId);
                var targetMappingBelongTargetId = unitOfWork.Repository<SysTargetMapping>().Get(g => g.TargetId == targetId);

                //tìm ra những bản ghi sẽ bị xóa đi trong quá trình thêm mới hoặc update
                var targetWillRemove = model != null && model.Count() > 0 ? targetMappingBelongTargetId.Where(g => !model.Select(g => g.Id).Contains(g.Id)) : targetMappingBelongTargetId;

                int iDefault = default(int);
                decimal dDefault = default(decimal);

                var (totalJan, totalFeb, totalMar, totalApr, totalMay, totalJun, totalJuly, totalAug, totalSep, totalOct, totalNov, totalDec) = (dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault, dDefault);
                var (totalQuantityJan, totalQuantityFeb, totalQuantityMar, totalQuantityApr, totalQuantityMay, totalQuantityJun, totalQuantityJuly, totalQuantityAug, totalQuantitySep, totalQuantityOct, totalQuantityNov, totalQuantityDec) = (iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault, iDefault);
                foreach (var item in model)
                {
                    //cập nhật lại số liệu cho bảng target
                    totalJan += item.Jan;
                    totalFeb += item.Feb;
                    totalMar += item.Mar;
                    totalApr += item.Apr;
                    totalMay += item.May;
                    totalJun += item.Jun;
                    totalJuly += item.July;
                    totalAug += item.Aug;
                    totalSep += item.Sep;
                    totalOct += item.Oct;
                    totalNov += item.Nov;
                    totalDec += item.Dec;

                    totalQuantityJan += item.QuantityJan;
                    totalQuantityFeb += item.QuantityFeb;
                    totalQuantityMar += item.QuantityMar;
                    totalQuantityApr += item.QuantityApr;
                    totalQuantityMay += item.QuantityMay;
                    totalQuantityJun += item.QuantityJun;
                    totalQuantityJuly += item.QuantityJuly;
                    totalQuantityAug += item.QuantityAug;
                    totalQuantitySep += item.QuantitySep;
                    totalQuantityOct += item.QuantityOct;
                    totalQuantityNov += item.QuantityNov;
                    totalQuantityDec += item.QuantityDec;

                    targetEntity.Apr = totalApr;
                    targetEntity.Aug = totalAug;
                    targetEntity.Dec = totalDec;
                    targetEntity.Feb = totalFeb;
                    targetEntity.Jan = totalJan;
                    targetEntity.July = totalJuly;
                    targetEntity.Jun = totalJun;
                    targetEntity.Mar = totalMar;
                    targetEntity.May = totalMay;
                    targetEntity.Nov = totalNov;
                    targetEntity.Oct = totalOct;
                    targetEntity.Sep = totalSep;
                    targetEntity.Total = totalJan + totalFeb + totalMar + totalApr + totalMay + totalJun + totalJuly + totalAug + totalSep + totalOct + totalNov + totalDec;
                    targetEntity.LastModifiedByUserId = _currentUser.GetUserId();
                    targetEntity.LastModifiedOnDate = DateTime.Now;
                    targetEntity.QuantityJan = totalQuantityJan;
                    targetEntity.QuantityFeb = totalQuantityFeb;
                    targetEntity.QuantityMar = totalQuantityMar;
                    targetEntity.QuantityApr = totalQuantityApr;
                    targetEntity.QuantityMay = totalQuantityMay;
                    targetEntity.QuantityJun = totalQuantityJun;
                    targetEntity.QuantityJuly = totalQuantityJuly;
                    targetEntity.QuantityAug = totalQuantityAug;
                    targetEntity.QuantitySep = totalQuantitySep;
                    targetEntity.QuantityOct = totalQuantityOct;
                    targetEntity.QuantityNov = totalQuantityNov;
                    targetEntity.QuantityDec = totalQuantityDec;
                    targetEntity.TotalQuantity = totalQuantityJan + totalQuantityFeb + totalQuantityMar + totalQuantityApr + totalQuantityMay + totalQuantityJun + totalQuantityJuly + totalQuantityAug + totalQuantitySep + totalQuantityOct + totalQuantityNov + totalQuantityDec;
                    unitOfWork.Repository<SysTarget>().Update(targetEntity);

                    //update dữ liệu bảng TargetMapping
                    var existData = targetMappingBelongTargetId != null && targetMappingBelongTargetId.Count() > 0 ? targetMappingBelongTargetId.FirstOrDefault(g => g.Id == item.Id) : null;
                    //nếu tồn tại rồi thì update
                    if (existData != null)
                    {
                        existData.Apr = item.Apr;
                        existData.Aug = item.Aug;
                        existData.CustomerCategoryId = item.CustomerCategoryId;
                        existData.Dec = item.Dec;
                        existData.Feb = item.Feb;
                        existData.Jan = item.Jan;
                        existData.July = item.July;
                        existData.Jun = item.Jun;
                        existData.Mar = item.Mar;
                        existData.May = item.May;
                        existData.Nov = item.Nov;
                        existData.Oct = item.Oct;
                        existData.ProductTypeId = item.ProductTypeId;
                        existData.Sep = item.Sep;
                        existData.Total = item.Jan + item.Feb + item.Mar + item.Apr + item.May + item.Jun + item.July + item.Aug + item.Sep + item.Oct + item.Nov + item.Dec;
                        existData.LastModifiedByUserId = _currentUser.GetUserId();
                        existData.LastModifiedOnDate = DateTime.Now;
                        existData.QuantityJan = item.QuantityJan;
                        existData.QuantityFeb = item.QuantityFeb;
                        existData.QuantityMar = item.QuantityMar;
                        existData.QuantityApr = item.QuantityApr;
                        existData.QuantityMay = item.QuantityMay;
                        existData.QuantityJun = item.QuantityJun;
                        existData.QuantityJuly = item.QuantityJuly;
                        existData.QuantityAug = item.QuantityAug;
                        existData.QuantitySep = item.QuantitySep;
                        existData.QuantityOct = item.QuantityOct;
                        existData.QuantityNov = item.QuantityNov;
                        existData.QuantityDec = item.QuantityDec;
                        existData.TotalQuantity = item.QuantityJan + item.QuantityFeb + item.QuantityMar + item.QuantityApr + item.QuantityMay + item.QuantityJun + item.QuantityJuly + item.QuantityAug + item.QuantitySep + item.QuantityOct + item.QuantityNov + item.QuantityDec;
                        unitOfWork.Repository<SysTargetMapping>().Update(existData);
                    }
                    else // trường hợp chưa có trong DB thì tiến hành create
                    {

                        item.Id = Guid.NewGuid();

                        unitOfWork.Repository<SysTargetMapping>().Insert(new SysTargetMapping()
                        {
                            TargetId = item.TargetId,
                            Apr = item.Apr,
                            Aug = item.Aug,
                            CustomerCategoryId = item.CustomerCategoryId,
                            Dec = item.Dec,
                            Feb = item.Feb,
                            Id = item.Id,
                            Jan = item.Jan,
                            July = item.July,
                            Jun = item.Jun,
                            Mar = item.Mar,
                            May = item.May,
                            Nov = item.Nov,
                            Oct = item.Oct,
                            ProductTypeId = item.ProductTypeId,
                            Sep = item.Sep,
                            Total = item.Jan + item.Feb + item.Mar + item.Apr + item.May + item.Jun + item.July + item.Aug + item.Sep + item.Oct + item.Nov + item.Dec,
                            QuantityJan = item.QuantityJan,
                            QuantityFeb = item.QuantityFeb,
                            QuantityMar = item.QuantityMar,
                            QuantityApr = item.QuantityApr,
                            QuantityMay = item.QuantityMay,
                            QuantityJun = item.QuantityJun,
                            QuantityJuly = item.QuantityJuly,
                            QuantityAug = item.QuantityAug,
                            QuantitySep = item.QuantitySep,
                            QuantityOct = item.QuantityOct,
                            QuantityNov = item.QuantityNov,
                            QuantityDec = item.QuantityDec,
                            TotalQuantity = item.QuantityJan + item.QuantityFeb + item.QuantityMar + item.QuantityApr + item.QuantityMay + item.QuantityJun + item.QuantityJuly + item.QuantityAug + item.QuantitySep + item.QuantityOct + item.QuantityNov + item.QuantityDec,
                            CreatedByUserId = _currentUser.GetUserId(),
                            LastModifiedByUserId = _currentUser.GetUserId()
                        });
                    }

                }

                //tiến hành xóa những bản ghi bị thừa
                foreach (var item in targetWillRemove)
                {
                    unitOfWork.Repository<SysTargetMapping>().Delete(item.Id);
                }

                unitOfWork.Save();
                //var userRecieveEmail = target;
                //var currentUser = responseDataUser.Data.FirstOrDefault(p => p.Id == new Guid(_httpContextAccessor.HttpContext.Request.Headers["IIG-User"]));
                //if (userRecieveEmail.UserNotification != null && userRecieveEmail.UserNotification.Count() > 0)
                //{
                //    //gửi thông báo
                //    Dictionary<string, string> dic = new Dictionary<string, string>();
                //    string messageNotification = $"{currentUser.Fullname} Đã thay đổi mục tiêu phòng ban với ghi chú {userRecieveEmail.HistoryTarget.Description}";
                //    SendMessages(userRecieveEmail.UserNotification, messageNotification, dic);

                //    // todo: build template email

                //    var toEmail = responseDataUser.Data.Where(g => userRecieveEmail.UserNotification.Contains(g.Id)).Select(x => x.Email).ToList();
                //    HttpResponseMessage response = new HttpResponseMessage();
                //    response = client.PostAsJsonAsync(emailServiceUrl + "email/async", new EmailServiceModel()
                //    {
                //        Body = $"{userRecieveEmail.HistoryTarget.Description}",
                //        Subject = "Thông báo thay đổi về target",
                //        ToEmail = toEmail
                //    }).Result;
                //}
                return new ResponseData(Code.Success, "Lưu thành công");
            }
            catch (Exception e)
            {
                Log.Error(e, e.Message);
                return new ResponseDataError(Code.ServerError, e.Message);
            }
        }
    }
}
