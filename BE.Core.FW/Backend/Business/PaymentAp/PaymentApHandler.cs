using AutoMapper;
using Backend.Business.Mailing;
using Backend.Business.Payment;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using DocumentFormat.OpenXml.Vml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Serilog;
using System.Net;
using System.Text;

namespace Backend.Business
{
    public class PaymentApHandler : IPaymentAp
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailTemplateHandler _emailTemplateHandler;
        private static readonly string paymentHost = Utils.GetConfig("PaymentConfig:Url");
        private readonly string KeyPayment = Utils.GetConfig("PaymentConfig:AP:Key");
        private readonly string CodePayment = Utils.GetConfig("PaymentConfig:AP:Code");

        public PaymentApHandler(IHttpContextAccessor httpContextAccessor, IEmailTemplateHandler emailTemplateHandler, IMapper mapper)
        {
            _httpContextAccessor = httpContextAccessor;
            _emailTemplateHandler = emailTemplateHandler;
            _mapper = mapper;
        }

        public async Task<ResponseData> CreatePaymentApUrl(PaymentApModel paymentApModel)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var registeredCandidate = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstOrDefault(item => item.Id == new Guid(paymentApModel.CandidateId) && item.IsPaid == (int)Constant.StatusPaid.UnPaid);
                if (registeredCandidate == null)
                    return new ResponseDataError(Code.NotFound, "Candicate Id not found");

                var paymentRequestModel = new SysPaymentApRequestLog();
                var amount = (uint)registeredCandidate.Price.Split(",", StringSplitOptions.RemoveEmptyEntries).Sum(item => Convert.ToInt32(item.Trim()));
                _mapper.Map(paymentApModel, paymentRequestModel);
                paymentRequestModel.Id = Guid.NewGuid();
                paymentRequestModel.Amount = amount * 100;
                paymentRequestModel.TxnRef = Guid.Parse(paymentApModel.CandidateId);
                paymentRequestModel.CreateDate = DateTime.Now.ToString("yyyyMMddHHmmss");
                paymentRequestModel.ExpireDate = string.Empty;
                paymentRequestModel.CurrencyCode = "VND";
                paymentRequestModel.IpAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? IPAddress.Any.ToString();
                paymentRequestModel.OrderInfo = $"thanh toan thi AP";
                paymentRequestModel.TmnCode = string.Empty;
                paymentRequestModel.Version = string.Empty;
                paymentRequestModel.DateCreateRecord = DateTime.Now;

                var fullRequestUrl = await HttpHelper.Post<ResponseDataObject<string>>($"{paymentHost}/Payment/CreatePaymentUrl", new
                {
                    RefId = paymentRequestModel.Id,
                    Key = KeyPayment,
                    Code = CodePayment,
                    amount,
                    paymentRequestModel.Type,
                    paymentRequestModel.OrderInfo,
                    paymentRequestModel.ReturnUrl,
                    paymentApModel.UseEnglishLanguage
                });

                if (string.IsNullOrEmpty(fullRequestUrl?.Data))
                    return new ResponseDataError(Code.ServerError, "Không tạo được đường dẫn thanh toán");

                paymentRequestModel.FullRequestUrl = fullRequestUrl.Data;
                unitOfWork.Repository<SysPaymentApRequestLog>().Insert(paymentRequestModel);
                unitOfWork.Save();
                return new ResponseDataObject<string>
                {
                    Code = Code.Success,
                    Data = paymentRequestModel.FullRequestUrl
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                Log.Error("PaymentApModel: {0}", paymentApModel);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseData GetListPaymentApHistory(PaymentApHistorySearchModel searchModel)
        {
            try
            {
                var listReturn = SearchPaymentHistory(searchModel, out int totalCount);
                return new PageableData<IEnumerable<PaymentApSearchResponse>>
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

        private IEnumerable<PaymentApSearchResponse> SearchPaymentHistory(PaymentApHistorySearchModel searchModel, out int totalRecord, bool isExportExcel = false)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listPaymentRequest = unitOfWork.Repository<SysPaymentApRequestLog>().GetQueryable(item => true);
                var listManageRegisteredCandidateTopik = unitOfWork.Repository<SysManageRegistedCandidateAP>().GetQueryable(item => true);
                var query = listPaymentRequest.Join(listManageRegisteredCandidateTopik, request => request.TxnRef, candidateAp => candidateAp.Id,
                       (request, candidateAp) => new { request, candidateAp });

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
                    query = query.Where(item => item.candidateAp.IsPaid == searchModel.Status);

                if (searchModel.ExamPeriodId.HasValue)
                {
                    var listExamScheduleAp = unitOfWork.Repository<SysExamScheduleAP>().GetQueryable(item => item.ExamPeriodId == searchModel.ExamPeriodId);
                    var listExamScheduleApDetail = unitOfWork.Repository<SysExamScheduleDetailAP>().GetQueryable(item => true);
                    var listScheduleDetailId = listExamScheduleAp.Join(listExamScheduleApDetail, schedule => schedule.Id, detail => detail.ExamScheduleId,
                          (schedule, detail) => new { schedule, detail }).Select(item => item.detail.Id);

                    query = query.Where(item => listScheduleDetailId.Any(id => item.candidateAp.ScheduleDetailIds.Contains(id.ToString())));
                }

                totalRecord = query.Count();

                query = query.OrderByDescending(item => item.request.DateCreateRecord);

                if (isExportExcel)
                {
                    var listPaymentResponse = unitOfWork.Repository<SysPaymentApResponseLog>().GetQueryable(item => true);
                    return query.ToList().GroupJoin(listPaymentResponse.ToList(), request => request.request.Id, response => response.PaymentRequestId,
                        (request, response) => new PaymentApSearchResponse
                        {
                            PaymentRequest = request.request,
                            PaymentResponse = response,
                            PaymentStatus = request.candidateAp.IsPaid
                        });
                }
                else
                {
                    query = query.Skip((searchModel.PageNumber - 1) * searchModel.PageSize).Take(searchModel.PageSize);
                    return query.Select(request => new PaymentApSearchResponse
                    {
                        PaymentRequest = request.request,
                        PaymentStatus = request.candidateAp.IsPaid
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

            var sysPaymentRequestApLog = unitOfWork.Repository<SysPaymentApRequestLog>().GetById(refId);
            if (sysPaymentRequestApLog == null)
                return new ResponseDataError(Code.BadRequest, "Not found");

            return new ResponseDataObject<string>
            {
                Code = Code.Success,
                Data = sysPaymentRequestApLog.TxnRef.ToString()
            };
        }

        private async Task SendEmailPaymentConfirmation(SysPaymentApRequestLog paymentRequest, SysPaymentApResponseLog paymentResponse)
        {
            if (!string.IsNullOrEmpty(paymentRequest.UserEmail))
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var isSendMailSuccess = false;
                try
                {
                    var userLanguage = unitOfWork.Repository<SysManageRegistedCandidateAP>().FirstQueryable(item => item.Id == paymentRequest.TxnRef)?.Language ?? "vi";
                    var localazationText = GetLocalizationText(userLanguage);
                    var responseSendMail = await _emailTemplateHandler.SendOneZetaEmail(new EmailRequest
                    {
                        HTMLBody = _emailTemplateHandler.GenerateEmailTemplate("email-payment-confirmation-ap", new PaymentApConfirmationEmailModel
                        {
                            PaymentRequest = paymentRequest,
                            PaymentResponse = paymentResponse,
                            LocalazationText = localazationText,
                            ExamDetailHtml = ExamListDetailHtml(paymentRequest.ExamSubject, localazationText)
                        }),
                        Subject = localazationText.GetValueOrDefault("mail_subject")?.Replace("{exam_name}", paymentRequest.ExamSubject?.ToUpper()) ?? string.Empty,
                        ToAddress = paymentRequest.UserEmail
                    });

                    isSendMailSuccess = responseSendMail.Code == Code.Success;
                }
                catch (Exception ex) { Log.Error(ex, "Send mail:" + ex.Message); }
                finally
                {
                    var entity = unitOfWork.Repository<SysPaymentApRequestLog>().GetById(paymentRequest.Id);
                    if (entity != null)
                    {
                        entity.IsSendMailPaymentConfirm = isSendMailSuccess;
                        unitOfWork.Repository<SysPaymentApRequestLog>().Update(entity);
                        unitOfWork.Save();
                    }
                }
            }
        }

        public Stream ExportExcelPaymentApHistory(PaymentApHistorySearchModel searchModel)
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
                    sheet.SetValue($"C{row}", item.PaymentRequest.Amount / 100);
                    sheet.Cells[$"C{row}"].Style.Numberformat.Format = "#,###";
                    var examName = string.Empty;
                    try
                    {
                        var examNameList = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<ExamApDetailModel>>(item.PaymentRequest.ExamSubject);
                        if (examNameList != null)
                            examName = string.Join(", ", examNameList.Select(item => item.Name).Distinct());
                    }
                    catch { }
                    sheet.SetValue($"D{row}", examName);
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
                            var payDate = string.Empty;
                            if (!string.IsNullOrEmpty(responseLog.PayDate))
                                payDate = DateTime.ParseExact(responseLog.PayDate, "yyyyMMddHHmmss", System.Globalization.CultureInfo.InvariantCulture).ToString("dd/MM/yyyy HH:mm:ss");

                            sheet.SetValue($"G{row}", responseLog.ResponseCodeDescription);
                            sheet.SetValue($"H{row}", responseLog.BankCode);
                            sheet.SetValue($"I{row}", responseLog.CardType);
                            sheet.SetValue($"J{row}", payDate);
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
            var directoryLocalizationLocation = Path.Combine(Environment.CurrentDirectory, "Localization", "PaymentConfirmation", "AP");
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
                var sysPaymentRequest = unitOfWork.Repository<SysPaymentApRequestLog>().GetQueryable(item => true);
                var sysPaymentResponse = unitOfWork.Repository<SysPaymentApResponseLog>().GetQueryable(item => true);
                var listManageRegisteredCandidate = unitOfWork.Repository<SysManageRegistedCandidateAP>().GetQueryable(item => true);
                var query = sysPaymentRequest
                    .Join(sysPaymentResponse, request => request.Id, response => response.PaymentRequestId,
                      (request, response) => new { request, response })
                    .Join(listManageRegisteredCandidate, requestResponse => requestResponse.request.TxnRef, candidateTopik => candidateTopik.Id,
                       (requestResponse, candidateTopik) => new { requestResponse, candidateTopik })
                    .Where(item => listPaymentRequestId.Contains(item.requestResponse.request.Id) && item.candidateTopik.IsPaid == (int)Constant.StatusPaid.Paid)
                    .Select(item => item.requestResponse);

                foreach (var requestId in listPaymentRequestId)
                {
                    var entity = query.FirstOrDefault(item => item.request.Id == requestId && item.response.ResponseCode == "00" && item.response.TransactionStatus == "00");
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

        public ResponseData GetPaymentApRequestDetail(Guid paymentRequestId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                return new ResponseDataObject<IEnumerable<SysPaymentApResponseLog>>()
                {
                    Data = unitOfWork.Repository<SysPaymentApResponseLog>().Get(item => item.PaymentRequestId == paymentRequestId)
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        private static string ExamListDetailHtml(string examSubjectString, Dictionary<string, string> localazationText)
        {
            try
            {
                var examListDetail = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<ExamApDetailModel>>(examSubjectString);
                if (examListDetail != null)
                {
                    var htmlString = new StringBuilder("<table border=\"1\" cellpadding=\"5\" cellspacing=\"0\" width=\"100%\">" +
                        "<tr>" +
                        $"<th>{localazationText["table_exam_detail_col_1"]}</th>" +
                        $"<th>{localazationText["table_exam_detail_col_2"]}</th>" +
                        $"<th>{localazationText["table_exam_detail_col_3"]}</th>" +
                        "</tr>");
                    foreach (var item in examListDetail)
                        htmlString.Append($"<tr><td>{item.Name}</td><td>{item.Code}</td><td>{item.Date} {item.Time}</td></tr>");

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
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var remoteIp = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress;
                if (remoteIp != null && remoteIp.IsIPv4MappedToIPv6)
                    remoteIp = remoteIp.MapToIPv4();

                if (KeyPayment != model.Key || CodePayment != model.Code)
                    return new ResponseDataError(Code.BadRequest, "Sai khóa");

                var sysPaymentRequestApLog = unitOfWork.Repository<SysPaymentApRequestLog>().FirstOrDefault(item => item.Id == Guid.Parse(model.UpdateId) && item.Type == model.Type);
                if (sysPaymentRequestApLog == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy yêu cầu thanh toán");

                if (sysPaymentRequestApLog.Amount != model.Amount * 100)
                    return new ResponseDataError(Code.BadRequest, "Sai số tiền");

                var registeredCandidate = unitOfWork.Repository<SysManageRegistedCandidateAP>().GetById(sysPaymentRequestApLog.TxnRef);
                if (registeredCandidate == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy yêu cầu cập nhật");

                var sysPaymentReponseLog = new SysPaymentApResponseLog
                {
                    Id = Guid.NewGuid(),
                    PaymentRequestId = Guid.Parse(model.UpdateId),
                    Amount = model.Amount * 100,
                    BankCode = model.BankCode,
                    BankTranNo = model.BankTransactionNo,
                    CardType = model.PaymentMethod,
                    OrderInfo = string.Empty,
                    PayDate = model.PayDate?.ToString("yyyyMMddHHmmss"),
                    TransactionNo = model.PaymentTransactionNo,
                    DateCreateRecord = DateTime.Now,
                    IpAddress = remoteIp?.ToString() ?? IPAddress.Any.ToString(),
                    ResponseCodeDescription = model.Result ? "Giao dịch thành công" : "Giao dịch không thành công",
                    ResponseCode = model.Result ? "00" : string.Empty,
                    TransactionStatus = model.Result ? "00" : string.Empty,
                    RawQueryString = model.RawResponse
                };

                if (registeredCandidate.IsPaid == (int)Constant.StatusPaid.UnPaid)
                {
                    registeredCandidate.IsPaid = model.Result ? (int)Constant.StatusPaid.Paid : (int)Constant.StatusPaid.NonPayment;
                    if (!string.IsNullOrEmpty(sysPaymentRequestApLog.UserEmail) && model.Result)
                        Task.Run(async () => await SendEmailPaymentConfirmation(sysPaymentRequestApLog, sysPaymentReponseLog));
                }

                unitOfWork.Repository<SysPaymentApResponseLog>().Insert(sysPaymentReponseLog);
                unitOfWork.Save();
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
