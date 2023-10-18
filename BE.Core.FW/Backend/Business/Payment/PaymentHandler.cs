using AutoMapper;
using Backend.Business.Mailing;
using Backend.Business.ManageRegisteredCandidateTopik;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Serilog;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Business.Payment
{
    public class PaymentHandler : IPayment
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IManageRegisteredCandidateTopikHandler _manageRegisteredCandidateTopikHandler;
        private readonly IEmailTemplateHandler _emailTemplateHandler;

        public PaymentHandler(IHttpContextAccessor httpContextAccessor, IManageRegisteredCandidateTopikHandler manageRegisteredCandidateTopikHandler,
            IEmailTemplateHandler emailTemplateHandler, IMapper mapper)
        {
            _httpContextAccessor = httpContextAccessor;
            _manageRegisteredCandidateTopikHandler = manageRegisteredCandidateTopikHandler;
            _emailTemplateHandler = emailTemplateHandler;
            _mapper = mapper;
        }

        public ResponseData CreatePaymentUrl(PaymentModel paymentModel)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var registeredCandidateTopik = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().Get(item => item.Id == new Guid(paymentModel.CandidateTopikId) && item.IsPaid == (int)Constant.StatusPaid.UnPaid).FirstOrDefault();
                if (registeredCandidateTopik == null)
                    return new ResponseDataError(Code.NotFound, "Candicate Id not found");

                var paymentRequestModel = new SysPaymentRequestLog();
                _mapper.Map(paymentModel, paymentRequestModel);

                paymentRequestModel.Amount = Convert.ToUInt64(registeredCandidateTopik.Price) * 100;
                paymentRequestModel.TxnRef = Guid.Parse(paymentModel.CandidateTopikId);
                paymentRequestModel.CreateDate = DateTime.Now.ToString("yyyyMMddHHmmss");
                paymentRequestModel.ExpireDate = DateTime.Now.AddMinutes(Convert.ToInt32(Utils.GetConfig("VnPayConfig:ExpireMinute"))).ToString("yyyyMMddHHmmss");
                paymentRequestModel.CurrencyCode = "VND";
                paymentRequestModel.IpAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
                paymentRequestModel.OrderInfo = $"thanh toan thi TOPIK";
                paymentRequestModel.TmnCode = Utils.GetConfig("VnPayConfig:TmnCode");
                paymentRequestModel.Version = Utils.GetConfig("VnPayConfig:Version");
                paymentRequestModel.DateCreateRecord = DateTime.Now;
                paymentRequestModel.Id = Guid.NewGuid();
                var listParameter = new SortedList<string, string>
                {
                    { "vnp_Version", paymentRequestModel.Version },
                    { "vnp_Command", "pay" },
                    { "vnp_TmnCode", paymentRequestModel.TmnCode },
                    { "vnp_Amount", paymentRequestModel.Amount.ToString() },
                    { "vnp_CreateDate", paymentRequestModel.CreateDate },
                    { "vnp_ExpireDate", paymentRequestModel.ExpireDate },
                    { "vnp_CurrCode", paymentRequestModel.CurrencyCode },
                    { "vnp_IpAddr", paymentRequestModel.IpAddress },
                    { "vnp_Locale", paymentModel.UseEnglishLanguage ? "en" : "vn" },
                    { "vnp_OrderInfo", WebUtility.UrlEncode(paymentRequestModel.OrderInfo) },
                    { "vnp_OrderType", "other" },
                    { "vnp_ReturnUrl", paymentRequestModel.ReturnUrl },
                    { "vnp_TxnRef", paymentRequestModel.Id.ToString("N") }
                };

                var queryStringPaymentUrl = string.Join("&", listParameter.Select(item => $"{item.Key}={WebUtility.UrlEncode(item.Value)}"));
                var hashedParameter = HmacSHA512(queryStringPaymentUrl);
                paymentRequestModel.FullRequestUrl = $"{Utils.GetConfig("VnPayConfig:Url")}?{queryStringPaymentUrl}&vnp_SecureHash={hashedParameter}";
                unitOfWork.Repository<SysPaymentRequestLog>().Insert(paymentRequestModel);
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
                Log.Error("paymentModel: {0}", paymentModel);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseToVnpay IpnUrlPayment()
        {
            try
            {
                var listParameter = new SortedList<string, string>();
                ResponseToVnpay responseToVnpay;
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var queryString = _httpContextAccessor.HttpContext!.Request.Query;
                var remoteIp = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress;
                if (remoteIp != null && remoteIp.IsIPv4MappedToIPv6)
                    remoteIp = remoteIp.MapToIPv4();

                var sysPaymentReponseLog = new SysPaymentResponseLog
                {
                    Id = Guid.NewGuid(),
                    PaymentRequestId = Guid.Parse(queryString["vnp_TxnRef"].FirstOrDefault(default(Guid).ToString())),
                    Amount = Convert.ToUInt64(queryString["vnp_Amount"].FirstOrDefault(default(ulong).ToString())),
                    BankCode = queryString["vnp_BankCode"].FirstOrDefault(),
                    BankTranNo = queryString["vnp_BankTranNo"].FirstOrDefault(),
                    CardType = queryString["vnp_CardType"].FirstOrDefault(),
                    OrderInfo = queryString["vnp_OrderInfo"].FirstOrDefault(),
                    PayDate = queryString["vnp_PayDate"].FirstOrDefault(),
                    ResponseCode = queryString["vnp_ResponseCode"].FirstOrDefault(),
                    ResponseCodeDescription = Constant.responseCodeDescription.GetValueOrDefault(queryString["vnp_ResponseCode"].FirstOrDefault(string.Empty)),
                    TransactionNo = queryString["vnp_TransactionNo"].FirstOrDefault(),
                    TransactionStatus = queryString["vnp_TransactionStatus"].FirstOrDefault(),
                    TransactionStatusDescription = Constant.transactionStatusDescription.GetValueOrDefault(queryString["vnp_TransactionStatus"].FirstOrDefault(string.Empty)),
                    DateCreateRecord = DateTime.Now,
                    IpAddress = remoteIp?.ToString(),
                    RawQueryString = _httpContextAccessor.HttpContext.Request.QueryString.ToString()
                };

                foreach (var key in queryString.Keys)
                {
                    if (!key.Equals("vnp_SecureHashType", StringComparison.OrdinalIgnoreCase) && !key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase) && queryString[key].Any())
                        listParameter.Add(key, queryString[key].First());
                }

                var secureHash = queryString["vnp_SecureHash"].FirstOrDefault();
                var hashedParamenter = HmacSHA512(string.Join("&", listParameter.Select(item => $"{item.Key}={WebUtility.UrlEncode(item.Value)}")));
                if (secureHash == hashedParamenter)
                {
                    var sysPaymentRequestLog = unitOfWork.Repository<SysPaymentRequestLog>().GetById(sysPaymentReponseLog.PaymentRequestId);
                    if (sysPaymentRequestLog != null)
                    {
                        var registeredCandidateTopik = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetById(sysPaymentRequestLog.TxnRef);
                        if (registeredCandidateTopik != null)
                        {
                            if (sysPaymentReponseLog.Amount == Convert.ToUInt64(registeredCandidateTopik.Price) * 100)
                            {
                                if (registeredCandidateTopik.IsPaid == (int)Constant.StatusPaid.UnPaid)
                                {
                                    if (sysPaymentReponseLog.ResponseCode == "00" && sysPaymentReponseLog.TransactionStatus == "00")
                                    {
                                        registeredCandidateTopik.IsPaid = (int)Constant.StatusPaid.Paid;
                                        if (!string.IsNullOrEmpty(sysPaymentRequestLog.UserEmail))
                                        {
                                            var userLanguage = unitOfWork.Repository<SysUserProfileRegistered>().Get(item => item.CandidateRegisterId == sysPaymentRequestLog.TxnRef).FirstOrDefault()?.LanguageName ?? "ko";
                                            Task.Run(async () => await SendEmailPaymentConfirmation(sysPaymentRequestLog, sysPaymentReponseLog));
                                        }
                                    }
                                    else
                                        registeredCandidateTopik.IsPaid = (int)Constant.StatusPaid.NonPayment;

                                    _manageRegisteredCandidateTopikHandler.DeleteSlot(new Model.SlotRegister
                                    {
                                        ExamTopikId = registeredCandidateTopik.TestScheduleId,
                                        PlaceId = registeredCandidateTopik.PlaceTest,
                                        UserName = sysPaymentRequestLog.UserName ?? string.Empty
                                    });

                                    responseToVnpay = new ResponseToVnpay { RspCode = "00", Message = "Confirm success" };
                                }
                                else
                                    responseToVnpay = new ResponseToVnpay { RspCode = "02", Message = "Order already confirmed" };
                            }
                            else
                                responseToVnpay = new ResponseToVnpay { RspCode = "04", Message = "Invalid amount" };
                        }
                        else
                            responseToVnpay = new ResponseToVnpay { RspCode = "01", Message = "Order Not Found" };
                    }
                    else
                        responseToVnpay = new ResponseToVnpay { RspCode = "01", Message = "Order Not Found" };
                }
                else
                    responseToVnpay = new ResponseToVnpay { RspCode = "97", Message = "Invalid Checksum" };

                sysPaymentReponseLog.ResponseToVnp = responseToVnpay.RspCode;
                sysPaymentReponseLog.ResponseToVnpDescription = responseToVnpay.Message;
                unitOfWork.Repository<SysPaymentResponseLog>().Insert(sysPaymentReponseLog);
                unitOfWork.Save();
                return responseToVnpay;
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseToVnpay { RspCode = "99", Message = "Error when execute" };
            }
        }

        public ResponseData GetListPaymentHistory(PaymentHistorySearchModel searchModel)
        {
            try
            {
                var listReturn = SearchPaymentHistory(searchModel, out int totalCount);
                //var totalCount = listReturn.Count();
                var totalPage = totalCount % searchModel.PageSize == 0 ? totalCount / searchModel.PageSize : (totalCount / searchModel.PageSize) + 1;
                // listReturn = listReturn.Skip((searchModel.PageNumber - 1) * searchModel.PageSize).Take(searchModel.PageSize);
                return new PageableData<IEnumerable<PaymentSearchResponse>>
                {
                    Code = Code.Success,
                    Data = listReturn,
                    TotalCount = totalCount,
                    TotalPage = totalPage,
                    PageNumber = searchModel.PageNumber,
                    PageSize = searchModel.PageSize
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseData(Code.ServerError, ex.Message);
            }
        }

        private IEnumerable<PaymentSearchResponse> SearchPaymentHistory(PaymentHistorySearchModel searchModel, out int totalRecord, bool isExportExcel = false)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var listPaymentRequest = unitOfWork.Repository<SysPaymentRequestLog>().GetQueryable(item => true);
                var listManageRegisteredCandidateTopik = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetQueryable(item => true);
                var query = listPaymentRequest.Join(listManageRegisteredCandidateTopik, request => request.TxnRef, candidateTopik => candidateTopik.Id,
                       (request, candidateTopik) => new { request, candidateTopik });

                if (searchModel.FromDate.HasValue)
                    query = query.Where(item => item.request.DateCreateRecord.Date >= searchModel.FromDate.Value.Date);

                if (searchModel.ToDate.HasValue)
                    query = query.Where(item => item.request.DateCreateRecord.Date <= searchModel.ToDate.Value.Date);

                if (!string.IsNullOrEmpty(searchModel.CandicateName))
                    query = query.Where(item => (!string.IsNullOrEmpty(item.request.VietnameseName) && EF.Functions.Like(item.request.VietnameseName, $"%{searchModel.CandicateName.Trim()}%"))
                                                                       || (!string.IsNullOrEmpty(item.request.KoreanName) && EF.Functions.Like(item.request.KoreanName, $"%{searchModel.CandicateName.Trim()}%")));

                if (!string.IsNullOrEmpty(searchModel.PhoneNumber))
                    query = query.Where(item => item.request.PhoneNumber == searchModel.PhoneNumber);

                if (!string.IsNullOrEmpty(searchModel.UserEmail))
                    query = query.Where(item => !string.IsNullOrEmpty(item.request.UserEmail) && EF.Functions.Like(item.request.UserEmail, $"%{searchModel.UserEmail}%"));

                if (searchModel.Status.HasValue)
                    query = query.Where(item => item.candidateTopik.IsPaid == searchModel.Status);

                if (searchModel.ExamPeriodId.HasValue)
                {
                    var listExamScheduleTopik = unitOfWork.Repository<SysExamScheduleTopik>().GetQueryable(item => true);
                    query = query.Join(listExamScheduleTopik, candidateTopik => candidateTopik.candidateTopik.TestScheduleId, schedule => schedule.Id,
                       (candidateTopik, examSchedule) => new { candidateTopik, examSchedule }).Where(item => item.examSchedule.ExamPeriodId == searchModel.ExamPeriodId)
                        .Select(item => item.candidateTopik);
                }

                totalRecord = query.Count();

                query = query.OrderByDescending(item => item.request.DateCreateRecord);

                if (isExportExcel)
                {
                    var listPaymentResponse = unitOfWork.Repository<SysPaymentResponseLog>().GetQueryable(item => true);
                    return query.ToList().GroupJoin(listPaymentResponse.ToList(), request => request.request.Id, response => response.PaymentRequestId,
                        (request, response) => new PaymentSearchResponse
                        {
                            PaymentRequest = request.request,
                            PaymentResponse = response,
                            PaymentStatus = request.candidateTopik.IsPaid
                        });
                }
                else
                {
                    query = query.Skip((searchModel.PageNumber - 1) * searchModel.PageSize).Take(searchModel.PageSize);
                    return query.Select(request => new PaymentSearchResponse
                    {
                        PaymentRequest = request.request,
                        PaymentStatus = request.candidateTopik.IsPaid
                    }).ToList();
                }
            }
            catch { throw; }
        }

        public ResponseData GetCandicateIdFromTxnRef(Guid requestPaymentId)
        {
            using var unitOfWork = new UnitOfWork(_httpContextAccessor);
            var sysPaymentRequestLog = unitOfWork.Repository<SysPaymentRequestLog>().GetById(requestPaymentId);
            if (sysPaymentRequestLog == null)
                return new ResponseDataError(Code.BadRequest, "Not found");

            return new ResponseDataObject<string>
            {
                Code = Code.Success,
                Data = sysPaymentRequestLog.TxnRef.ToString()
            };
        }

        private async Task SendEmailPaymentConfirmation(SysPaymentRequestLog paymentRequest, SysPaymentResponseLog paymentResponse)
        {
            if (!string.IsNullOrEmpty(paymentRequest.UserEmail))
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var isSendMailSuccess = false;
                try
                {
                    var userLanguage = "ko";
                    var userProfileRegistered = unitOfWork.Repository<SysUserProfileRegistered>().FirstQueryable(item => item.CandidateRegisterId == paymentRequest.TxnRef);
                    if (userProfileRegistered != null)
                        userLanguage = userProfileRegistered.LanguageName ?? userLanguage;

                    var localazationText = GetLocalizationText(userLanguage);
                    var responseSendMail = await _emailTemplateHandler.SendOneZetaEmail(new EmailRequest
                    {
                        HTMLBody = _emailTemplateHandler.GenerateEmailTemplate("email-payment-confirmation", new PaymentConfirmationEmailModel
                        {
                            PaymentRequest = paymentRequest,
                            PaymentResponse = paymentResponse,
                            LocalazationText = localazationText
                        }),
                        Subject = localazationText.GetValueOrDefault("mail_subject")?.Replace("{exam_name}", paymentRequest.ExamName?.ToUpper()) ?? string.Empty,
                        ToAddress = paymentRequest.UserEmail
                    });

                    isSendMailSuccess = responseSendMail.Code == Code.Success;
                }
                catch (Exception ex) { Log.Error(ex, "Send mail:" + ex.Message); }
                finally
                {
                    var entity = unitOfWork.Repository<SysPaymentRequestLog>().GetById(paymentRequest.Id);
                    if (entity != null)
                    {
                        entity.IsSendMailPaymentConfirm = isSendMailSuccess;
                        unitOfWork.Repository<SysPaymentRequestLog>().Update(entity);
                        unitOfWork.Save();
                    }
                }
            }
        }

        public Stream ExportExcelPaymentHistory(PaymentHistorySearchModel searchModel)
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
                sheet.SetValue("M1", "Khu vực thi");
                sheet.SetValue("N1", "Địa điểm thi");
                var row = 2;
                var orderNumber = 1;
                foreach (var item in data)
                {
                    sheet.SetValue($"A{row}", orderNumber);
                    sheet.SetValue($"B{row}", item.PaymentRequest.VietnameseName);
                    sheet.SetValue($"C{row}", item.PaymentRequest.Amount / 100);
                    sheet.Cells[$"C{row}"].Style.Numberformat.Format = "#,###";
                    sheet.SetValue($"D{row}", item.PaymentRequest.ExamName);
                    sheet.SetValue($"E{row}", item.PaymentRequest.PhoneNumber);
                    sheet.SetValue($"F{row}", item.PaymentRequest.UserEmail);
                    sheet.SetValue($"M{row}", item.PaymentRequest.ExamAreaName);
                    sheet.SetValue($"N{row}", item.PaymentRequest.ExamLocation);
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
                            sheet.Cells[$"M{row}:M{row + item.PaymentResponse.Count() - 1}"].Merge = true;
                            sheet.Cells[$"N{row}:N{row + item.PaymentResponse.Count() - 1}"].Merge = true;

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

                var headerCellRange = sheet.Cells["A1:N1"];
                headerCellRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                headerCellRange.Style.Font.Bold = true;
                headerCellRange.Style.Fill.SetBackground(ExcelIndexedColor.Indexed13);
                headerCellRange.Style.Font.Size = 12f;

                sheet.Cells[$"A1:N{row}"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                sheet.Cells[$"A1:N{row}"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                sheet.Cells[$"A1:N{row}"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                sheet.Cells[$"A1:N{row}"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                sheet.Cells[$"A1:N{row}"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

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

        private static string HmacSHA512(string inputData)
        {
            var keyEncrpt = Utils.GetConfig("VnPayConfig:Key");
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(keyEncrpt);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                    hash.Append(theByte.ToString("x2"));
            }

            return hash.ToString();
        }

        public static Dictionary<string, string> GetLocalizationText(string locale)
        {
            var fileLocalizationLocation = Path.Combine(Environment.CurrentDirectory, "Localization", "PaymentConfirmation", "TOPIK");
            if (locale.Equals("en", StringComparison.OrdinalIgnoreCase))
                fileLocalizationLocation = Path.Combine(fileLocalizationLocation, "en.json");
            else if (locale.Equals("vi", StringComparison.OrdinalIgnoreCase) || locale.Equals("vn", StringComparison.OrdinalIgnoreCase))
                fileLocalizationLocation = Path.Combine(fileLocalizationLocation, "vi.json");
            else
                fileLocalizationLocation = Path.Combine(fileLocalizationLocation, "ko.json");

            return Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(fileLocalizationLocation)) ?? new Dictionary<string, string>();
        }

        public ResponseData SendMailIndividual(IEnumerable<Guid> listPaymentRequestId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                listPaymentRequestId = listPaymentRequestId.Distinct();
                var sysPaymentRequest = unitOfWork.Repository<SysPaymentRequestLog>().GetQueryable(item => true);
                var sysPaymentResponse = unitOfWork.Repository<SysPaymentResponseLog>().GetQueryable(item => true);
                var listManageRegisteredCandidateTopik = unitOfWork.Repository<SysManageRegisteredCandidateTopik>().GetQueryable(item => true);
                var query = sysPaymentRequest
                    .Join(sysPaymentResponse, request => request.Id, response => response.PaymentRequestId,
                      (request, response) => new { request, response })
                    .Join(listManageRegisteredCandidateTopik, requestResponse => requestResponse.request.TxnRef, candidateTopik => candidateTopik.Id,
                       (requestResponse, candidateTopik) => new { requestResponse, candidateTopik })
                    .Where(item => listPaymentRequestId.Contains(item.requestResponse.request.Id) && item.candidateTopik.IsPaid == (int)Constant.StatusPaid.Paid)
                    .Select(item => item.requestResponse);

                foreach (var requestId in listPaymentRequestId)
                {
                    var entity = query.FirstOrDefault(item => item.request.Id == requestId && item.response.ResponseCode == "00" && item.response.ResponseToVnp == "00");
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

        public ResponseData GetPaymentRequestDetail(Guid paymentRequestId)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                return new ResponseDataObject<IEnumerable<SysPaymentResponseLog>>()
                {
                    Data = unitOfWork.Repository<SysPaymentResponseLog>().Get(item => item.PaymentRequestId == paymentRequestId)
                };
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }
    }
}
