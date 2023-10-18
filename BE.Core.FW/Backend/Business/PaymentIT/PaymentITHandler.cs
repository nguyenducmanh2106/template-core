using AutoMapper;
using Backend.Business.Mailing;
using Backend.Business.ManageRegisteredCandidateIT;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Serilog;
using System.Linq;
using System.Net;
using System.Text;

namespace Backend.Business
{
    public class PaymentITHandler : IPaymentIT
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private static readonly string paymentHost = Utils.GetConfig("PaymentConfig:Url");
        private readonly string KeyPayment = Utils.GetConfig("PaymentConfig:IT:Key");
        private static readonly string apiBasicUriCatalog = Utils.GetConfig("Catalog");
        private readonly string CodePayment = Utils.GetConfig("PaymentConfig:IT:Code");

        public PaymentITHandler(IHttpContextAccessor httpContextAccessor, IEmailTemplateHandler emailTemplateHandler, IMapper mapper)
        {
            _httpContextAccessor = httpContextAccessor;
            _emailTemplateHandler = emailTemplateHandler;
            _mapper = mapper;
        }

        public async Task<ResponseData> CreatePaymentITUrl(PaymentITModel paymentITModel)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var registeredCandidate = unitOfWork.Repository<SysManageRegisteredCandidateIT>().Get(item => item.Id == new Guid(paymentITModel.CandidateId) && item.StatusPaid == (int)Constant.StatusPaid.UnPaid).FirstOrDefault();
                if (registeredCandidate == null)
                    return new ResponseDataError(Code.NotFound, "Candicate Id not found");

                var paymentRequestModel = new SysPaymentITRequestLog();
                _mapper.Map(paymentITModel, paymentRequestModel);
                paymentRequestModel.Id = Guid.NewGuid();
                paymentRequestModel.Amount = (uint)registeredCandidate.Price;
                paymentRequestModel.CandidateId = Guid.Parse(paymentITModel.CandidateId);
                paymentRequestModel.CurrencyCode = "VND";
                paymentRequestModel.OrderInfo = $"thanh toan thi IT";
                paymentRequestModel.DateCreateRecord = DateTime.Now;

                var response = await HttpHelper.Post<ResponseDataObject<string>>($"{paymentHost}/Payment/CreatePaymentUrl", new
                {
                    RefId = paymentRequestModel.Id,
                    Key = KeyPayment,
                    Code = CodePayment,
                    paymentRequestModel.Amount,
                    paymentRequestModel.Type,
                    paymentRequestModel.OrderInfo,
                    paymentRequestModel.ReturnUrl,
                    paymentITModel.UseEnglishLanguage
                });

                if (string.IsNullOrEmpty(response?.Data))
                    return new ResponseDataError(Code.ServerError, "Không tạo được đường dẫn thanh toán");

                paymentRequestModel.FullRequestUrl = response.Data;
                unitOfWork.Repository<SysPaymentITRequestLog>().Insert(paymentRequestModel);
                unitOfWork.Save();
                return new ResponseDataObject<string>(paymentRequestModel.FullRequestUrl);
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                Log.Error("PaymentITModel: {0}", paymentITModel);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseData GetListPaymentITHistory(PaymentITHistorySearchModel searchModel)
        {
            try
            {
                var listReturn = SearchPaymentHistory(searchModel, out int totalCount);
                return new PageableData<IEnumerable<PaymentITSearchResponse>>
                {
                    Code = Code.Success,
                    Data = listReturn,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseData(Code.ServerError, ex.Message);
            }
        }

        private IEnumerable<PaymentITSearchResponse> SearchPaymentHistory(PaymentITHistorySearchModel searchModel, out int totalRecord, bool isExportExcel = false)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listPaymentRequest = unitOfWork.Repository<SysPaymentITRequestLog>().GetQueryable(item => true);
                var listManageRegisteredCandidate = unitOfWork.Repository<SysManageRegisteredCandidateIT>().GetQueryable(item => true);
                var query = listPaymentRequest.Join(listManageRegisteredCandidate, request => request.CandidateId, candidateIT => candidateIT.Id,
                       (request, candidateIT) => new { request, candidateIT });

                if (searchModel.FromDate.HasValue)
                    query = query.Where(item => item.request.DateCreateRecord.Date >= searchModel.FromDate.Value.Date);

                if (searchModel.ToDate.HasValue)
                    query = query.Where(item => item.request.DateCreateRecord.Date <= searchModel.ToDate.Value.Date);

                if (!string.IsNullOrEmpty(searchModel.CandicateName))
                    query = query.Where(item => !string.IsNullOrEmpty(item.request.VietnameseName) && EF.Functions.Like(item.request.VietnameseName, $"%{searchModel.CandicateName.Trim()}%"));

                if (!string.IsNullOrEmpty(searchModel.PhoneNumber))
                    query = query.Where(item => item.request.PhoneNumber == searchModel.PhoneNumber);

                if (!string.IsNullOrEmpty(searchModel.UserEmail))
                    query = query.Where(item => !string.IsNullOrEmpty(item.request.UserEmail) && EF.Functions.Like(item.request.UserEmail, $"%{searchModel.UserEmail}%"));

                if (searchModel.Status.HasValue)
                    query = query.Where(item => item.candidateIT.StatusPaid == searchModel.Status);

                if (searchModel.ExamPeriodId.HasValue)
                {
                    var listExamScheduleAp = unitOfWork.Repository<SysExamScheduleAP>().GetQueryable(item => item.ExamPeriodId == searchModel.ExamPeriodId);
                    var listExamScheduleApDetail = unitOfWork.Repository<SysExamScheduleDetailAP>().GetQueryable(item => true);
                    var listScheduleDetailId = listExamScheduleAp.Join(listExamScheduleApDetail, schedule => schedule.Id, detail => detail.ExamScheduleId,
                          (schedule, detail) => new { schedule, detail }).Select(item => item.detail.Id);

                    query = query.Where(item => listScheduleDetailId.Any(id => item.candidateIT.ExamScheduleString.Contains(id.ToString())));
                }

                totalRecord = query.Count();

                query = query.OrderByDescending(item => item.request.DateCreateRecord);

                if (isExportExcel)
                {
                    var listPaymentResponse = unitOfWork.Repository<SysPaymentITResponseLog>().GetQueryable(item => true);
                    return query.ToList().GroupJoin(listPaymentResponse.ToList(), request => request.request.Id, response => response.PaymentRequestId,
                        (request, response) => new PaymentITSearchResponse
                        {
                            PaymentRequest = request.request,
                            PaymentResponse = response,
                            PaymentStatus = request.candidateIT.StatusPaid
                        });
                }
                else
                {
                    query = query.Skip((searchModel.PageNumber - 1) * searchModel.PageSize).Take(searchModel.PageSize);
                    return query.Select(request => new PaymentITSearchResponse
                    {
                        PaymentRequest = request.request,
                        PaymentStatus = request.candidateIT.StatusPaid
                    }).ToList();
                }
            }
            catch { throw; }
        }

        public async Task<ResponseData> GetCandicateIdFromTxnRef(Guid requestPaymentId)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var refId = (await HttpHelper.Get<ResponseDataObject<Guid>>(paymentHost, $"Payment/GetRefIdFromRequestId?requestId={requestPaymentId}"))?.Data;
            if (!refId.HasValue)
                return new ResponseDataError(Code.BadRequest, "Not found");

            var sysPaymentRequestLog = unitOfWork.Repository<SysPaymentITRequestLog>().GetById(refId);
            if (sysPaymentRequestLog == null)
                return new ResponseDataError(Code.BadRequest, "Not found");

            return new ResponseDataObject<string>
            {
                Code = Code.Success,
                Data = sysPaymentRequestLog.CandidateId.ToString()
            };
        }

        private async Task SendEmailPaymentConfirmation(SysPaymentITRequestLog paymentRequest, SysPaymentITResponseLog paymentResponse)
        {
            if (!string.IsNullOrEmpty(paymentRequest.UserEmail))
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var isSendMailSuccess = false;
                try
                {
                    var userLanguage = "vi";
                    var candidateRegisted = unitOfWork.Repository<SysManageRegisteredCandidateIT>().FirstOrDefault(p => p.Id == paymentRequest.CandidateId);
                    var userProfileRegistered = unitOfWork.Repository<SysUserProfileRegisteredIT>().FirstQueryable(item => item.CandidateRegisterId == paymentRequest.CandidateId);
                    if (userProfileRegistered != null && candidateRegisted != null)
                    {
                        var dataRegisteds = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ExamSubjectDataModel>>(candidateRegisted.ExamRegistedData);
                        string examVersions = string.Empty;
                        if (dataRegisteds != null && dataRegisteds.Any())
                        {
                            examVersions = string.Join(",", dataRegisteds.Select(p => p.ExamVersionId).ToList());
                        }
                        userLanguage = userProfileRegistered.Language;
                        var data = new EmailConfirmITModel();
                        data.FullName = userProfileRegistered.FullName;
                        data.Birthday = userProfileRegistered.Birthday.ToString("dd/MM/yyyy");
                        data.DateTimePaid = paymentResponse.PayDate != null ? paymentResponse.PayDate.Value.ToString("dd/MM/yyyy HH:mm:ss") : string.Empty;
                        data.Trans = !string.IsNullOrEmpty(paymentResponse.TransactionNo) ? paymentResponse.TransactionNo : string.Empty;
                        string row = string.Empty;
                        if (dataRegisteds != null)
                        {
                            var examScheduleIds = dataRegisteds.Select(p => p.ExamScheduleId.ToLower()).ToList();
                            var examSchedules = unitOfWork.Repository<SysExamCalendar>().Get(p => examScheduleIds.Contains(p.Id.ToString().ToLower()));
                            string headQuarterString = string.Join(",", examSchedules.Select(p => p.HeaderQuarterId));
                            var dataInfo = await HttpHelper.Get<ResponseDataObject<Dictionary<string, string>>>(apiBasicUriCatalog, "Exam/GetInfoPayment?examId=" + candidateRegisted.ExamId + "&examVersions=" + examVersions + "&headQuarters=" + headQuarterString);
                            if (dataInfo != null && dataInfo.Data != null)
                            {
                                var examNameGet = dataInfo.Data.FirstOrDefault(p => p.Key == candidateRegisted.ExamId.ToString().ToLower());
                                data.ExamName = examNameGet.Value;
                                foreach (var item in dataRegisteds)
                                {
                                    var examVersionName = dataInfo.Data.FirstOrDefault(p => p.Key == item.ExamVersionId.ToLower());
                                    var examSchedule = examSchedules.FirstOrDefault(p => p.Id.ToString().ToLower() == item.ExamScheduleId.ToLower());
                                    var subjectName = dataInfo.Data.FirstOrDefault(p => p.Key == item.ExamVersionId.ToLower() + "subjectName");
                                    var headQuarterAddress = dataInfo.Data.FirstOrDefault(p => p.Key == examSchedule?.HeaderQuarterId.ToString().ToLower());
                                    row += $"<tr><td style=\"border: 1px solid #dddddd; border-top: none; text-align: left; padding: 8px;\">" + subjectName.Value + "</td>" +
                                         "<td style=\"border: 1px solid #dddddd; border-left: none; border-top: none; text-align: left; padding: 8px;\">" + examVersionName.Value + "</td>" +
                                         "<td style=\"border: 1px solid #dddddd; border-left: none; border-top: none; text-align: left; padding: 8px;\">" + (item.Language == "eng" ? "English" : "Vietnam") + "</td>" +
                                         "<td style=\"border: 1px solid #dddddd; border-left: none; border-top: none; text-align: left; padding: 8px;\">" + (examSchedule.TimeTest + "  " + examSchedule.DateTest.ToString("dd/MM/yyyy")) + "</td>" +
                                         "<td style=\"border: 1px solid #dddddd; border-left: none; border-top: none; text-align: left; padding: 8px;\">" + headQuarterAddress.Value + "</td></tr>";

                                }
                            }

                        }
                        data.TestInfo = row;

                        var body = _emailTemplateHandler.GenerateEmailTemplate("email-confirmation-IT", data);
                        var email = new EmailRequest()
                        {
                            ToAddress = userProfileRegistered.Email,
                            Body = body,
                            HTMLBody = body,
                            Subject = "[IIG Việt Nam] Thông báo: Thanh toán và đăng ký thành công bài thi " + data.ExamName,
                            ToEmail = new List<string> { userProfileRegistered.Email }
                        };
                        var resEmail = await _emailTemplateHandler.SendOneZetaEmail(email);
                        isSendMailSuccess = resEmail.Code == Code.Success;
                    }
                }
                catch (Exception ex) { Log.Error(ex, "Send mail:" + ex.Message); }
                finally
                {
                    var entity = unitOfWork.Repository<SysPaymentITRequestLog>().GetById(paymentRequest.Id);
                    if (entity != null)
                    {
                        entity.IsSendMailPaymentConfirm = isSendMailSuccess;
                        unitOfWork.Repository<SysPaymentITRequestLog>().Update(entity);
                        unitOfWork.Save();
                    }
                }
            }
        }

        public Stream ExportExcelPaymentITHistory(PaymentITHistorySearchModel searchModel)
        {
            try
            {
                var data = SearchPaymentHistory(searchModel, out int totalRecord, true);

                using var excelPackage = new ExcelPackage();
                var sheet = excelPackage.Workbook.Worksheets.Add("Sheet1");
                //header 
                sheet.SetValue("A1", "STT");
                sheet.SetValue("B1", "Tên thí sinh");
                sheet.SetValue("C1", "Số tiền");
                sheet.SetValue("D1", "Tên kì thi");
                sheet.SetValue("E1", "Số điện thoại");
                sheet.SetValue("F1", "Email");
                sheet.SetValue("G1", "Trạng thái thanh toán");
                sheet.SetValue("H1", "Ngân hàng");
                sheet.SetValue("I1", "Loại thẻ");
                sheet.SetValue("J1", "Thời gian thanh toán");
                sheet.SetValue("K1", "Mã giao dịch ngân hàng");
                sheet.SetValue("L1", "Mã giao dịch Vnpay");
                var row = 2;
                var orderNumber = 1;
                foreach (var item in data)
                {
                    sheet.SetValue($"A{row}", orderNumber);
                    sheet.SetValue($"B{row}", item.PaymentRequest.VietnameseName);
                    sheet.SetValue($"C{row}", item.PaymentRequest.Amount);
                    sheet.Cells[$"C{row}"].Style.Numberformat.Format = "#,###";
                    sheet.SetValue($"D{row}", item.PaymentRequest.ExamSubject);
                    sheet.SetValue($"E{row}", item.PaymentRequest.PhoneNumber);
                    sheet.SetValue($"F{row}", item.PaymentRequest.UserEmail);
                    orderNumber++;
                    if (item.PaymentResponse == null || !item.PaymentResponse.Any())
                    {
                        sheet.SetValue($"G{row}", "Chưa thanh toán");
                        row++;
                    }
                    else
                    {
                        if (item.PaymentResponse.Count() > 1)
                        {
                            sheet.Cells[$"A{row}:A{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                            sheet.Cells[$"B{row}:B{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                            sheet.Cells[$"C{row}:C{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                            sheet.Cells[$"D{row}:D{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                            sheet.Cells[$"E{row}:E{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                            sheet.Cells[$"F{row}:F{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                        }
                        foreach (var responseLog in item.PaymentResponse)
                        {
                            sheet.SetValue($"G{row}", responseLog.Result ? "Giao dịch thành công" : "Giao dịch không thành công");
                            sheet.SetValue($"H{row}", responseLog.BankCode);
                            sheet.SetValue($"I{row}", responseLog.CardType);
                            sheet.SetValue($"J{row}", responseLog.PayDate?.ToString("dd/MM/yyyy HH:mm:ss"));
                            sheet.SetValue($"K{row}", responseLog.BankTranNo);
                            sheet.SetValue($"L{row}", responseLog.TransactionNo);
                            row++;
                        }
                    }
                }

                row--; // remove last row blank
                if (row > 1)
                    sheet.IgnoredErrors.Add(sheet.Cells[$"A2:L{row}"]).NumberStoredAsText = true;

                var headerCellRange = sheet.Cells["A1:L1"];
                headerCellRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                headerCellRange.Style.Font.Bold = true;
                headerCellRange.Style.Fill.SetBackground(ExcelIndexedColor.Indexed13);
                headerCellRange.Style.Font.Size = 12f;

                sheet.Cells[$"A1:L{row}"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                sheet.Cells[$"A1:L{row}"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                sheet.Cells[$"A1:L{row}"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                sheet.Cells[$"A1:L{row}"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                sheet.Cells[$"A1:L{row}"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                sheet.Cells.AutoFitColumns();
                sheet.View.FreezePanes(2, 1);

                var memoryStream = new MemoryStream();
                excelPackage.SaveAs(memoryStream);
                memoryStream.Seek(0, SeekOrigin.Begin);
                return memoryStream;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new MemoryStream();
            }
        }

        public static Dictionary<string, string> GetLocalizationText(string locale)
        {
            var directoryLocalizationLocation = Path.Combine(Environment.CurrentDirectory, "Localization", "PaymentConfirmation", "IT");
            var defaultLocale = "vi";
            var fileLocalizationLocation = Path.Combine(directoryLocalizationLocation, $"{locale}.json");
            if (!File.Exists(fileLocalizationLocation))
                fileLocalizationLocation = Path.Combine(directoryLocalizationLocation, $"{defaultLocale}.json");

            return Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(fileLocalizationLocation)) ?? new Dictionary<string, string>();
        }

        public ResponseData SendMailIndividual(IEnumerable<Guid> listPaymentRequestId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                listPaymentRequestId = listPaymentRequestId.Distinct();
                var sysPaymentRequest = unitOfWork.Repository<SysPaymentITRequestLog>().GetQueryable(item => true);
                var sysPaymentResponse = unitOfWork.Repository<SysPaymentITResponseLog>().GetQueryable(item => true);
                var listManageRegisteredCandidate = unitOfWork.Repository<SysManageRegisteredCandidateIT>().GetQueryable(item => true);
                var query = sysPaymentRequest
                    .Join(sysPaymentResponse, request => request.Id, response => response.PaymentRequestId,
                      (request, response) => new { request, response })
                    .Join(listManageRegisteredCandidate, requestResponse => requestResponse.request.CandidateId, candidateTopik => candidateTopik.Id,
                       (requestResponse, candidateTopik) => new { requestResponse, candidateTopik })
                    .Where(item => listPaymentRequestId.Contains(item.requestResponse.request.Id) && item.candidateTopik.StatusPaid == (int)Constant.StatusPaid.Paid)
                    .Select(item => item.requestResponse);

                foreach (var requestId in listPaymentRequestId)
                {
                    var entity = query.FirstOrDefault(item => item.request.Id == requestId && item.response.Result);
                    if (entity != null)
                        Task.Run(async () => await SendEmailPaymentConfirmation(entity.request, entity.response));
                }

                return new ResponseData();
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseData GetPaymentITRequestDetail(Guid paymentRequestId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                return new ResponseDataObject<IEnumerable<SysPaymentITResponseLog>>()
                {
                    Data = unitOfWork.Repository<SysPaymentITResponseLog>().Get(item => item.PaymentRequestId == paymentRequestId)
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        private static string ExamListDetailHtml(string examITDetail)
        {
            try
            {
                var examListDetail = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<ExamITDetailModel>>(examITDetail);
                if (examListDetail != null)
                {
                    var htmlString = new StringBuilder("<table border=\"0\" cellpadding=\"5\" cellspacing=\"0\" width=\"100%\">" +
                        "<tr>" +
                        "<td><strong>Phiên bản</strong></td>" +
                        "<td><strong>Ngôn ngữ</strong></td>" +
                        "<td><strong>Ngày thi</strong></td>" +
                        "<td><strong>Giờ thi</strong></td>" +
                        "<td><strong>Địa điểm thi</strong></td>" +
                        "</tr>");
                    foreach (var item in examListDetail)
                    {
                        var examDateString = string.Empty;
                        if (DateTime.TryParse(item.DateTest, out DateTime examDate))
                            examDateString = examDate.ToString("dd/MM/yyyy");

                        htmlString.Append($"<tr><td>{item.VersionName}</td><td>{item.Language}</td><td>{examDateString}</td><td>{item.TimeTest}</td><td>{item.LocationTest}</td></tr>");
                    }

                    htmlString.Append("</table>");
                    return htmlString.ToString();
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
            }

            return string.Empty;
        }

        public ResponseData UpdatePayment(ReceivePaymentModel model)
        {
            try
            {
                if (KeyPayment != model.Key || CodePayment != model.Code)
                    return new ResponseDataError(Code.BadRequest, "Sai khóa");

                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var sysPaymentRequestLog = unitOfWork.Repository<SysPaymentITRequestLog>().FirstOrDefault(item => item.Id == Guid.Parse(model.UpdateId) && item.Type == model.Type);
                if (sysPaymentRequestLog == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy yêu cầu thanh toán");

                if (sysPaymentRequestLog.Amount != model.Amount)
                    return new ResponseDataError(Code.BadRequest, "Sai số tiền");

                var registeredCandidate = unitOfWork.Repository<SysManageRegisteredCandidateIT>().GetById(sysPaymentRequestLog.CandidateId);
                if (registeredCandidate == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy yêu cầu cập nhật");

                if (registeredCandidate.StatusPaid == (int)Constant.StatusPaid.UnPaid)
                {
                    var remoteIp = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress;
                    if (remoteIp != null && remoteIp.IsIPv4MappedToIPv6)
                        remoteIp = remoteIp.MapToIPv4();

                    var sysPaymentReponseLog = new SysPaymentITResponseLog
                    {
                        Id = Guid.NewGuid(),
                        PaymentRequestId = Guid.Parse(model.UpdateId),
                        Amount = model.Amount,
                        BankCode = model.BankCode,
                        BankTranNo = model.BankTransactionNo,
                        CardType = model.PaymentMethod,
                        PayDate = model.PayDate,
                        TransactionNo = model.PaymentTransactionNo,
                        DateCreateRecord = DateTime.Now,
                        IpAddress = remoteIp?.ToString() ?? IPAddress.Any.ToString(),
                        Result = model.Result,
                        RawResponse = model.RawResponse
                    };

                    registeredCandidate.StatusPaid = model.Result ? (int)Constant.StatusPaid.Paid : (int)Constant.StatusPaid.NonPayment;
                    if (!string.IsNullOrEmpty(sysPaymentRequestLog.UserEmail) && model.Result)
                        Task.Run(async () => await SendEmailPaymentConfirmation(sysPaymentRequestLog, sysPaymentReponseLog));

                    unitOfWork.Repository<SysPaymentITResponseLog>().Insert(sysPaymentReponseLog);
                    unitOfWork.Save();
                }

                return new ResponseData();

            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }
    }
}
