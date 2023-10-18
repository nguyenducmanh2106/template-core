using Backend.Business.DividingRoom;
using Backend.Infrastructure.Middleware;
using Backend.Infrastructure.Utils;
using Backend.Model;
using IIG.Core.Framework.ICom.Infrastructure.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using OfficeOpenXml;
using Serilog;
using System;
using System.Data;
using System.IO.Compression;
using System.IO.Packaging;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    //[Authorize]
    //[EnableCors]
    public class DividingRoomController : ControllerBase
    {
        private readonly IDividingRoomHandler _handler;
        private static readonly string apiBasicUriCatalog = Backend.Infrastructure.Utils.Utils.GetConfig("Catalog");

        public DividingRoomController(IDividingRoomHandler handler)
        {
            _handler = handler;
        }

        /// <summary>
        /// Chia phòng thi và sinh số báo danh cho danh sách thi sinh
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("DivideExamRoom")]
        //[MustHavePermission(nameof(ActionPermission.Create), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> DivideExamRoom([FromBody] SelectionCriterialModel model)
        {
            return await _handler.DivideExamRoom(model, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Quản lý địa điểm đã được chia phòng
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("ManagementPlaceDividedExamRoom")]
        //[MustHavePermission(nameof(ActionPermission.View), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> ManagementPlaceDividedExamRoom([FromBody] SelectionCriterialModel model, int pageIndex = 1, int pageSize = 10)
        {
            return await _handler.ManagementPlaceDividedExamRoom(model, HttpHelper.GetAccessFromHeader(Request), pageIndex, pageSize);
        }

        /// <summary>
        /// Thực hiện xóa danh sách phòng thi và địa điểm thi
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        [Route("DeleteManagementPlaceDividedExamRoom/{id}")]
        //[MustHavePermission(nameof(ActionPermission.Delete), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> DeleteManagementPlaceDividedExamRoom([FromRoute] Guid id)
        {
            return await _handler.DeleteManagementPlaceDividedExamRoom(id, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Thực hiện check kỳ thi khi chọn địa điểm thi
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("CheckExamScheduleTopik")]
        public async Task<ResponseData> CheckExamScheduleTopik([FromQuery] SelectionCriterialModel model)
        {
            return await _handler.CheckExamScheduleTopik(model);
        }

        /// <summary>
        /// Quản lý phòng thi theo địa điểm thi
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("ManagementDividedExamRoom")]
        //[MustHavePermission(nameof(ActionPermission.View), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> ManagementDividedExamRoom(Guid dividingExamPlaceId, Guid examPlaceId, int pageIndex = 1, int pageSize = 10)
        {
            return await _handler.ManagementDividedExamRoom(dividingExamPlaceId, examPlaceId, pageIndex, pageSize, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Quản lý thí sinh theo kỳ thi và phòng thi
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("ManagementDividedCandidate")]
        //[MustHavePermission(nameof(ActionPermission.View), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> ManagementDividedCandidate(Guid dividingExamPlaceId, Guid examRoomId, string? candidateName = "", string? candidatePhone = "", string? candidateEmail = "", int pageNumber = 1, int pageSize = 10)
        {
            return await _handler.ManagementDividedCandidate(dividingExamPlaceId, examRoomId, candidateName, candidatePhone, candidateEmail, pageNumber, pageSize, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Quản lý thí sinh theo kỳ thi và phòng thi
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("ExportExcelManagementDividedCandidate")]
        //[MustHavePermission(nameof(ActionPermission.View), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> ExportExcelManagementDividedCandidate(Guid dividingExamPlaceId, Guid examRoomId, string? candidateName = "", string? candidatePhone = "", string? candidateEmail = "")
        {
            try
            {
                // Tạo bảng dữ liệu chung ( Master ) 
                DataTable Master = new DataTable();
                Master.TableName = "Master";
                Master.Columns.Add("titleSheet1");
                DataRow dr = null;
                dr = Master.NewRow();
                // Tạo bảng dữ liệu Chi tiết ( Details )
                DataTable detail = new DataTable();
                detail.Columns.Add("TT");
                detail.Columns.Add("CandidateNumber");
                detail.Columns.Add("CandidateKoreaName");
                detail.Columns.Add("CandidateName");
                detail.Columns.Add("CandidateGender");
                detail.Columns.Add("CandidateBirthdayFormat");
                detail.Columns.Add("CandidateImage", typeof(MemoryStream));
                var sheetNew = "";

                var examQuery = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam", HttpHelper.GetAccessFromHeader(Request) != null ? HttpHelper.GetAccessFromHeader(Request) : string.Empty);

                ResponseDataObject<List<ExamRoomDividedModel>> data = await _handler.ExportExcelManagementDividedCandidate(dividingExamPlaceId, examRoomId, candidateName, candidatePhone, candidateEmail, HttpHelper.GetAccessFromHeader(Request));

                // Lấy tên file đầu vào và đầu ra 
                var fileTmp = "DS_Thi_Sinh.xlsx";
                var fileTmpGenerate = "DS_Thi_Sinh_ExamPlace.xlsx";
                var pathFile = Path.Combine(Environment.CurrentDirectory, @"TemplateExcel\" + fileTmpGenerate);
                if (System.IO.File.Exists(pathFile))
                    System.IO.File.Delete(pathFile);

                using (var file = new FileStream(Path.Combine(Environment.CurrentDirectory, @"TemplateExcel\" + fileTmpGenerate), FileMode.CreateNew))
                {
                    using (var temp = new FileStream(Path.Combine(Environment.CurrentDirectory, @"TemplateExcel\" + fileTmp), FileMode.Open))
                    {
                        using (var xls = new ExcelPackage(file, temp))
                        {
                            sheetNew = Commonyy.RemoveMark(data.Data[0].ExamRoomName, '_');
                            // Copy data to a new sheet from an existing sheet within the Workbook
                            xls.Workbook.Worksheets.Copy("Sheet1", sheetNew);

                            //ẩn sheet mẫu đi
                            xls.Workbook.Worksheets["Sheet1"].Hidden = eWorkSheetHidden.Hidden;

                            Master.Columns.Add("title" + sheetNew);
                            xls.Workbook.Worksheets[sheetNew].Cells["A1"].Value = "{Master.title" + sheetNew + "}";

                            string name = $"Detail{sheetNew}";
                            //string formula = "Sheet2!$A$7:$F$7";
                            //ExcelNamedRange namedRange = xls.Workbook.Names.Add(name, formula);

                            ExcelNamedRange namedRange = xls.Workbook.Names.Add(name, xls.Workbook.Worksheets[$"{sheetNew}"].Cells["A3:G3"]);
                            //namedRange.Scope = worksheet;

                            xls.Save();
                        }
                    }
                }

                detail.TableName = $"Detail{sheetNew}";


                if (data != null && data.Code == Code.Success && data.Data?.Count() > 0)
                {
                    dr[$"title{sheetNew}"] = $"Địa điểm: {data.Data[0].ExamPlaceName}\r\nPhòng thi: {data.Data[0].ExamRoomName}\r\nBài thi: {examQuery?.Data?.FirstOrDefault(g => g.Id == data.Data[0].ExamId)?.Name ?? ""}";

                    int index = 1;
                    foreach (var item in data.Data)
                    {
                        string base64String = !string.IsNullOrEmpty(item.CandidateImageStr) ? await MinioHelpers.GetBase64Minio(item.CandidateImageStr) : "";
                        //string base64String = "";
                        var bytes = Convert.FromBase64String(base64String);
                        var contents = new MemoryStream(bytes);
                        string formatBirthday = item.CandidateBirthday.HasValue ? item.CandidateBirthday.Value.ToString("yyyyMMdd") : string.Empty;
                        detail.Rows.Add(new object[] { index, item.CandidateNumber, item.CandidateKoreaName, item.CandidateName, item.CandidateGender, formatBirthday, contents });
                        index++;
                    }
                }


                Master.Rows.Add(dr);

                // Tạo Dataset ghi dữ liệu Master + Details 
                var ds = new DataSet();
                ds.Tables.Add(detail);
                ds.Tables.Add(Master);

                // Lấy tên file đầu vào và đầu ra 
                var fileOutput = "DS_Thi_Sinh.xlsx";
                var pathExport = Path.Combine(Environment.CurrentDirectory, @"OutputExcel\" + fileOutput);
                var fileName = System.IO.Path.GetFileName(pathExport);
                ExcelFillData.FillReportGrid(fileOutput, fileTmpGenerate, ds, new string[] { "{", "}" }, 1);

                //return new ResponseData(Code.Success, "fileOutput");
                var content = await System.IO.File.ReadAllBytesAsync(pathExport);
                new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider()
                    .TryGetContentType(fileOutput, out string contentType);
                contentType = "application/vnd.ms-excel";
                //return File(content, contentType, fileName);
                return new ResponseDataObject<string>(@"OutputExcel\" + fileOutput, Code.Success, "Success");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }

        }

        /// <summary>
        /// Quản lý thí sinh theo kỳ thi và khu vực
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("ExportExcelManagementDividedCandidateByExamPlace")]
        //[MustHavePermission(nameof(ActionPermission.View), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> ExportExcelManagementDividedCandidateByExamPlace(Guid dividingExamPlaceId, Guid examPlaceId)
        {
            try
            {
                //lấy danh sách phòng theo trụ sở thi
                var examRoomQuerys = await HttpHelper.Get<ResponseDataObject<List<ExamRoomModel>>>(apiBasicUriCatalog, $"ExamRoom?HeadQuarterId={examPlaceId}", HttpHelper.GetAccessFromHeader(Request) != null ? HttpHelper.GetAccessFromHeader(Request) : string.Empty);
                var examQuery = await HttpHelper.Get<ResponseDataObject<List<ExamModel>>>(apiBasicUriCatalog, $"Exam", HttpHelper.GetAccessFromHeader(Request) != null ? HttpHelper.GetAccessFromHeader(Request) : string.Empty);


                // Tạo bảng dữ liệu chung ( Master ) 
                DataTable Master = new DataTable();
                Master.TableName = "Master";
                Master.Columns.Add("titleSheet1");

                DataRow dr = Master.NewRow();

                // Tạo Dataset ghi dữ liệu Master + Details 
                var ds = new DataSet();
                var fileOutput = "DS_Thi_Sinh_ExamPlace.xlsx";



                // Lấy tên file đầu vào và đầu ra 
                var fileTmp = "DS_Thi_Sinh.xlsx";
                var fileTmpGenerate = "DS_Thi_Sinh_ExamPlace.xlsx";
                var pathFile = Path.Combine(Environment.CurrentDirectory, @"TemplateExcel\" + fileTmpGenerate);
                var examRooms = examRoomQuerys.Data?.OrderBy(g => g.Order).ToList() ?? new List<ExamRoomModel>();
                if (System.IO.File.Exists(pathFile))
                    System.IO.File.Delete(pathFile);
                using (var file = new FileStream(Path.Combine(Environment.CurrentDirectory, @"TemplateExcel\" + fileTmpGenerate), FileMode.CreateNew))
                {
                    using (var temp = new FileStream(Path.Combine(Environment.CurrentDirectory, @"TemplateExcel\" + fileTmp), FileMode.Open))
                    {
                        using (var xls = new ExcelPackage(file, temp))
                        {
                            for (var itemSheetCreate = 0; itemSheetCreate < examRooms.Count(); itemSheetCreate++)
                            {
                                //var sheetNew = $"Sheet{itemSheetCreate + 1}";
                                string sheetNew = Commonyy.RemoveMark(examRooms[itemSheetCreate].Name, '_');
                                // Copy data to a new sheet from an existing sheet within the Workbook
                                xls.Workbook.Worksheets.Copy("Sheet1", sheetNew);
                                //ẩn sheet mẫu đi
                                xls.Workbook.Worksheets["Sheet1"].Hidden = eWorkSheetHidden.Hidden;

                                Master.Columns.Add("title" + sheetNew);
                                xls.Workbook.Worksheets[sheetNew].Cells["A1"].Value = "{Master.title" + sheetNew + "}";

                                string name = $"Detail{sheetNew}";
                                //string formula = "Sheet2!$A$7:$F$7";
                                //ExcelNamedRange namedRange = xls.Workbook.Names.Add(name, formula);

                                ExcelNamedRange namedRange = xls.Workbook.Names.Add(name, xls.Workbook.Worksheets[sheetNew].Cells["A3:G3"]);
                                //namedRange.Scope = worksheet;
                            }

                            xls.Save();
                        }
                    }
                }




                if (examRoomQuerys.Code == Code.Success && examRooms != null && examRooms.Count() > 0)
                {
                    for (var itemRoom = 0; itemRoom < examRooms.Count(); itemRoom++)
                    {
                        DataTable detailSheet = new DataTable();
                        Guid examRoomId = examRooms[itemRoom].Id;
                        ResponseDataObject<List<ExamRoomDividedModel>> data = await _handler.ExportExcelManagementDividedCandidate(dividingExamPlaceId, examRoomId, "", "", "", HttpHelper.GetAccessFromHeader(Request));
                        if (data != null && data.Code == Code.Success && data.Data?.Count() > 0)
                        {
                            int index = 1;
                            foreach (var item in data.Data)
                            {
                                string base64String = !string.IsNullOrEmpty(item.CandidateImageStr) ? await MinioHelpers.GetBase64Minio(item.CandidateImageStr) : "";
                                //string base64String = "";
                                var bytes = Convert.FromBase64String(base64String);
                                var contents = new MemoryStream(bytes);
                                string formatBirthday = item.CandidateBirthday.HasValue ? item.CandidateBirthday.Value.ToString("yyyyMMdd") : string.Empty;
                                item.CandidateBirthdayFormat = formatBirthday;
                                item.CandidateImage = contents;
                                item.TT = index;
                                index++;
                            }
                            string sheetNew = Commonyy.RemoveMark(examRooms[itemRoom].Name, '_');
                            detailSheet = Commonyy.ToDataTable<ExamRoomDividedModel>(data.Data);
                            detailSheet.TableName = $"Detail{sheetNew}";
                            ds.Tables.Add(detailSheet);

                            fileOutput = Commonyy.RemoveMark($"DS thí sinh_{data.Data[0].ExamAreaName}_{data.Data[0].ExamPlaceName}_{data.Data[0].ExamScheduleTopikName}.xlsx");

                            dr[$"title{sheetNew}"] = $"Địa điểm: {data.Data[0].ExamPlaceName}\r\nPhòng thi: {data.Data[0].ExamRoomName}\r\nBài thi: {examQuery?.Data?.FirstOrDefault(g => g.Id == data.Data[0].ExamId)?.Name ?? ""}";
                            //dr["titleSheet1"] = $"Địa điểm: {data.Data[0].ExamPlaceName}\r\nPhòng thi: {data.Data[0].ExamRoomName}\r\nBài thi: {examQuery?.Data?.FirstOrDefault(g => g.Id == data.Data[0].ExamId)?.Name ?? ""}";

                        }
                    }

                }

                Master.Rows.Add(dr);

                ds.Tables.Add(Master);


                var pathExport = Path.Combine(Environment.CurrentDirectory, @"OutputExcel\" + fileOutput);
                var fileName = System.IO.Path.GetFileName(pathExport);
                ExcelFillData.FillReportGrid(fileOutput, fileTmpGenerate, ds, new string[] { "{", "}" }, 1);



                //return new ResponseData(Code.Success, "fileOutput");
                var content = await System.IO.File.ReadAllBytesAsync(pathExport);
                new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider()
                    .TryGetContentType(fileOutput, out string contentType);
                contentType = "application/vnd.ms-excel";
                //return File(content, contentType, fileName);
                return new ResponseDataObject<string>(@"OutputExcel\" + fileOutput, Code.Success, "Success");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }

        }

        /// <summary>
        /// Gửi email thông báo SBD và phòng thi cho cả địa điểm thi
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("SendMailCandidates/{dividingExamPlaceId}")]
        //[MustHavePermission(nameof(ActionPermission.Edit), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> SendMailCandidates([FromRoute] Guid dividingExamPlaceId)
        {
            return await _handler.SendMailCandidates(dividingExamPlaceId, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Gửi email thông báo SBD và phòng thi cho 1 thí sinh
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("SendMailCandidate/{examRoomDividedId}")]
        //[MustHavePermission(nameof(ActionPermission.Edit), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> SendMailCandidate([FromRoute] Guid examRoomDividedId)
        {
            return await _handler.SendMailCandidate(examRoomDividedId, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Tiến hành cập nhật số báo danh và chuyển phòng thi
        /// </summary>
        /// <param name="examRoomDividedId"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("UpdateCandidateNumberAndMoveCandidateRoom/{examRoomDividedId}")]
        //[MustHavePermission(nameof(ActionPermission.Edit), LayoutCode.dividingExamRoomId)]
        public async Task<ResponseData> UpdateCandidateNumberAndMoveCandidateRoom([FromRoute] Guid examRoomDividedId, ExamRoomDividedModel model)
        {
            return await _handler.UpdateCandidateNumberAndMoveCandidateRoom(examRoomDividedId, model, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Tiến hành lấy phòng thi trong địa điểm thi mà còn trống thí sinh
        /// </summary>
        /// <param name="ExamPlaceId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("CheckSlotRoom/{dividingExamPlaceId}")]
        public async Task<ResponseData> CheckSlotRoom([FromRoute] Guid dividingExamPlaceId)
        {
            return await _handler.CheckSlotRoom(dividingExamPlaceId, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Tìm kiếm thí sinh
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("SearchCandidate")]
        public async Task<ResponseData> SearchCandidate(Guid? ExamPeriodId, Guid? ExamScheduleTopikId, string? candidateName = "", string? candidatePhone = "", string? candidateEmail = "", int pageNumber = 1, int pageSize = 10)
        {
            return await _handler.SearchCandidate(ExamPeriodId, ExamScheduleTopikId, candidateName, candidatePhone, candidateEmail, pageNumber, pageSize, HttpHelper.GetAccessFromHeader(Request));
        }

        /// <summary>
        /// Gửi email test thông báo SBD cho danh sách liên hệ tự tạo
        /// </summary>
        /// <param name="ids"></param>
        /// <returns></returns>
        [HttpPost]
        //[MustHavePermission(nameof(ActionPermission.Edit), LayoutCode.dividingExamRoomId)]
        [Route("SendMailTestCandidates/{examRoomDividedId}")]
        public async Task<ResponseData> SendMailTestCandidates([FromRoute] Guid examRoomDividedId, IEnumerable<Guid> emails)
        {
            return await _handler.SendMailTestCandidates(examRoomDividedId, emails, HttpHelper.GetAccessFromHeader(Request));
        }
    }
}
