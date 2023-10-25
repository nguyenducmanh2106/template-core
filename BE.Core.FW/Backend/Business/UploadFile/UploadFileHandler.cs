using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using ExcelDataReader;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic.FileIO;
using Serilog;
using System;
using System.ComponentModel.DataAnnotations;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing;
using System.Linq;

namespace Backend.Business.UploadFile
{
    public class UploadFileHandler : IUploadFileHandler
    {
        #region Property  
        private readonly ILogger<UploadFileHandler> _logger;
        public string pathUpload = $"Upload/{DateTime.Now.ToString("yyyyMMdd")}";
        #endregion

        #region Constructor  
        public UploadFileHandler(ILogger<UploadFileHandler> logger)
        {
            _logger = logger;
        }
        #endregion
        public async Task<List<FileResultModel>> UploadFiles([Required] List<IFormFile> formFiles)
        {
            var existPathUpload = Path.Combine(Directory.GetCurrentDirectory(), pathUpload);
            Directory.CreateDirectory(existPathUpload);
            if (!Directory.Exists(existPathUpload))
            {
                Directory.CreateDirectory(existPathUpload);
            }
            // Checking no of files injected in Request object  
            var lstFile = new List<string>();
            //if (formFiles?.Count <= 0) return new ResponseDataError(Code.ServerError, "Bạn chưa chọn file.");
            if (formFiles?.Count <= 0) return default;
            try
            {
                //  Get all files from Request object  
                var files = formFiles;
                var name = ""; long size = 0;
                //object[] response = new object[files.Count];
                List<FileResultModel> response = new List<FileResultModel>();
                for (var i = 0; i < files.Count; i++)
                {
                    var file = files[i];
                    var fname = "";
                    // Checking for Internet Explorer  
                    //if (Request.Browser.Browser.ToUpper() == "IE" || Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                    if (false)
                    {
                        if (file != null)
                        {
                            var testfiles = file.FileName.Split(new[] { '\\' });
                            fname = testfiles[testfiles.Length - 1];
                        }
                    }
                    else
                    {
                        if (file != null) fname = file.FileName;
                    }
                    name = fname;
                    fname = HelperString.UnsignCharacter(string.Format("{0}{1}", DateTime.Now.ToString("yyyyMMddhhmmss-"), fname));
                    fname = fname.Replace(",", "-").Replace(" ", "-");
                    var linkfile = string.Format("{0}/{1}", pathUpload, fname);
                    lstFile.Add(linkfile);
                    // Get the complete folder path and store the file inside it.  
                    fname = Path.Combine(existPathUpload, fname);
                    if (file == null) continue;
                    //file.SaveAs(fname);
                    using (var stream = new FileStream(fname, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    //get size
                    long sizefile = new FileInfo(fname).Length;
                    size = sizefile;
                    //get ten 
                    //var replaceName = Request.Form.GetValues("replaceName");
                    var replaceName = "anchnhf";
                    var linkabcd = "";
                    //for (int j = 0; j < abcd.Count(); j++)
                    //{
                    //    valuleAbcd = abcd[0];
                    //    //var fabcd = HelperString.UnsignCharacter(string.Format("{0}{1}", DateTime.Now.ToString("yyyyMMddhhmmss-"), valuleAbcd));
                    //    //linkabcd = string.Format("{0}", fabcd);
                    //}
                    var fileb = new FileResultModel
                    {
                        thumbnailUrl = fname,
                        url = linkfile,
                        urlabcd = linkabcd,
                        name = name?.Replace(",", "-"),
                        replaceName = replaceName,
                        deleteUrl = "JqueryUpload/DeleteFile?url=" + linkfile,
                        //deleteUrl = "/admin/JqueryUpload/DeleteFile?url=" + fname,
                        size = size,
                        deleteType = "DELETE"
                    };
                    //response[i] = fileb;
                    response.Add(fileb);
                }
                // Returns message that successfully uploaded  
                return response;
            }
            catch (Exception ex)
            {
                return default;
            }
        }

        public async Task<ResponseData> DeleteFile(string url)
        {
            //xóa tạm thời vì hay mất file
            //var arr = url.Split(',');
            //for (int i = 0; i < arr.Length; i++)
            //{
            //    var link = Commonyy.GetPath(pathUpload, arr[i].Split('/').Last());
            //    System.IO.File.Delete(link);

            //}
            return new ResponseData(Code.Success, "");
        }

        public async Task<ResponseData> GetImageFile(string fileName)
        {
            //string result = string.Empty;

            //#region khai báo app dùng cho đọc file excel
            //Microsoft.Office.Interop.Word.Application word = null; //khai báo app dùng cho đọc file excel
            //Microsoft.Office.Interop.Word.Document doc = null;
            //object missing = System.Type.Missing;
            //#endregion
            //try
            //{
            //    List<string> files = new List<string>();
            //    var extension = fileName.Split(".").Last();
            //    string outputDir = System.Environment.CurrentDirectory;
            //    string filePath = System.Environment.CurrentDirectory + "/" + fileName;

            //    if (extension.ToLower() == Constant.Extension.XLS || extension.ToLower() == Constant.Extension.XLSX)
            //    {
            //        Workbook book = new Workbook(filePath);
            //        Worksheet sheet = book.Worksheets[0];

            //        Aspose.Cells.Rendering.ImageOrPrintOptions options = new Aspose.Cells.Rendering.ImageOrPrintOptions();
            //        options.HorizontalResolution = 130;
            //        options.VerticalResolution = 150;
            //        options.ImageType = Aspose.Cells.Drawing.ImageType.Png;

            //        SheetRender sr = new SheetRender(sheet, options);
            //        for (int j = 0; j < sr.PageCount; j++)
            //        {
            //            string fileSave = outputDir + $"/Upload/Excel_Page_{Commonyy.Md5Hash(fileName)}_" + (j + 1) + "temp.Png";
            //            //if (File.Exists(fileSave.Replace("temp", "")))
            //            //{
            //            //    File.Delete(fileSave.Replace("temp", ""));
            //            //}
            //            sr.ToImage(j, fileSave);
            //            files.Add(Crop(fileSave));
            //            if (File.Exists(fileSave))
            //            {
            //                File.Delete(fileSave);
            //            }
            //        }
            //    }
            //    else if (extension.ToLower() == Constant.Extension.Pdf)
            //    {
            //        //PdfDocument pdf = new PdfDocument();
            //        //pdf.LoadFromFile(filePath);
            //        //for (int i = 0; i < pdf.Pages.Count; i++)
            //        //{
            //        //    System.Drawing.Image bmp = pdf.SaveAsImage(i);
            //        //    //string fileName = string.Format("Page-{0}.png", i + 1);
            //        //    string fileSave = outputDir + "/Upload/Pdf_Page_" + (i + 1) + "temp.jpg";
            //        //    //if (File.Exists(fileSave.Replace("temp", "")))
            //        //    //{
            //        //    //    File.Delete(fileSave.Replace("temp", ""));
            //        //    //}
            //        //    if (File.Exists(fileSave))
            //        //    {
            //        //        File.Delete(fileSave);
            //        //    }
            //        //    bmp.Save(fileSave, System.Drawing.Imaging.ImageFormat.Png);
            //        //    files.Add("Pdf_Page_" + (i + 1) + "temp.jpg");

            //        //}

            //        ////Thực hiện lưu gộp nhiều ảnh vào 1 ảnh
            //        //Bitmap b = CombineBitmap(files.ToArray());
            //        //b.Save(outputDir + "/Upload/Pdf_Page_temp.jpg");
            //        //foreach (var item in files)
            //        //{
            //        //    File.Delete(item);
            //        //}

            //        //// Convert PDF to JPG with high Quality
            //        //SautinSoft.PdfFocus f = new SautinSoft.PdfFocus();

            //        //// This property is necessary only for registered version
            //        //// f.Serial = "XXXXXXXXXXX";
            //        //string pdfFile = filePath;

            //        //f.OpenPdf(pdfFile);

            //        //if (f.PageCount > 0)
            //        //{
            //        //    // Set image properties: Jpeg, 200 dpi
            //        //    f.ImageOptions.ImageFormat = System.Drawing.Imaging.ImageFormat.Jpeg;
            //        //    f.ImageOptions.Dpi = 200;

            //        //    // Set 95 as JPEG quality
            //        //    f.ImageOptions.JpegQuality = 95;

            //        //    //Save all PDF pages to image folder, each file will have name Page 1.jpg, Page 2.jpg, Page N.jpg
            //        //    for (int page = 1; page <= f.PageCount; page++)
            //        //    {
            //        //        //string jpegFile = Path.Combine(outputDir, String.Format("/Upload/Pdf_Page_{0}.jpg", page));
            //        //        string jpegFile = outputDir + String.Format("/Upload/Pdf_Page_{0}.jpg", page);
            //        //        if (File.Exists(jpegFile))
            //        //        {
            //        //            File.Delete(jpegFile);
            //        //        }

            //        //        // 0 - converted successfully                
            //        //        // 2 - can't create output file, check the output path
            //        //        // 3 - conversion failed
            //        //        int resultConvert = f.ToImage(jpegFile, page);

            //        //        // Show only 1st page
            //        //        if (resultConvert == 0)
            //        //        {
            //        //            //System.Diagnostics.Process.Start(jpegFile);
            //        //            //System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(jpegFile) { UseShellExecute = true });
            //        //            files.Add(String.Format("Pdf_Page_{0}.jpg", page));
            //        //        }
            //        //    }
            //        //}
            //        //f.ClosePdf();

            //        using (var document = PdfiumViewer.PdfDocument.Load(filePath))
            //        {
            //            int pageCount = document.PageCount;
            //            for (var idx = 0; idx < pageCount; idx++)
            //            {
            //                string jpegFile = outputDir + $"/Upload/Pdf_Page_{Commonyy.Md5Hash(fileName)}_{idx}.png";
            //                var image = document.Render(idx, 800, 800, 500, 500, true);
            //                image.Save(jpegFile, ImageFormat.Png);
            //                files.Add($"Pdf_Page_{Commonyy.Md5Hash(fileName)}_{idx}.png");
            //            }

            //        }
            //    }
            //    else if (extension.ToLower() == Constant.Extension.Doc || extension.ToLower() == Constant.Extension.DocX)
            //    {
            //        word = new Microsoft.Office.Interop.Word.Application();
            //        word.Visible = false;//có cho show quá trình mở word lên không
            //        object oFilePath = (object)filePath;
            //        object readOnly = true;
            //        doc = word.Documents.Open(ref oFilePath, ref missing, ref missing, ref missing, ref missing,
            //            ref missing, ref missing, ref missing, ref missing, ref missing, ref missing, ref missing, ref missing, ref missing, ref missing, ref missing);

            //        //doc = word.Documents.Open(filePath);

            //        //doc.Activate();
            //        doc.ShowGrammaticalErrors = false;
            //        doc.ShowRevisions = false;
            //        doc.ShowSpellingErrors = false;
            //        //Opens the word document and fetch each page and converts to image
            //        foreach (Microsoft.Office.Interop.Word.Window window in doc.Windows)
            //        {
            //            foreach (Microsoft.Office.Interop.Word.Pane pane in window.Panes)
            //            {
            //                for (var i = 1; i <= pane.Pages.Count; i++)
            //                {
            //                    var page = pane.Pages[i];
            //                    var bits = page.EnhMetaFileBits;
            //                    var target = outputDir + $"/Upload/Doc_page_{Commonyy.Md5Hash(fileName)}_" + i + ".doc";

            //                    try
            //                    {
            //                        using (var ms = new MemoryStream((byte[])(bits)))
            //                        {
            //                            var image = System.Drawing.Image.FromStream(ms);
            //                            var pngTarget = Path.ChangeExtension(target, "png");
            //                            //if (File.Exists(pngTarget))
            //                            //{
            //                            //    File.Delete(pngTarget);
            //                            //}

            //                            int targetW = 1000;
            //                            int targetH = 1000;
            //                            Bitmap targetImage = new Bitmap(targetW, targetH);

            //                            Graphics graphics = Graphics.FromImage(targetImage);

            //                            graphics.SmoothingMode = SmoothingMode.HighQuality;

            //                            graphics.CompositingQuality = CompositingQuality.HighQuality;

            //                            graphics.InterpolationMode = InterpolationMode.High;

            //                            Rectangle rectDestination = new Rectangle(0, 0, targetW, targetH);

            //                            graphics.DrawImage(image, rectDestination, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel);
            //                            targetImage.Save(pngTarget, ImageFormat.Png);
            //                            //image.Save(pngTarget, ImageFormat.Png);

            //                            files.Add($"Doc_page_{Commonyy.Md5Hash(fileName)}_" + i + ".png");
            //                        }
            //                    }
            //                    catch (System.Exception ex)
            //                    { }
            //                }
            //            }
            //        }
            //        doc.Close(Type.Missing, Type.Missing, Type.Missing);
            //        word.Quit(Type.Missing, Type.Missing, Type.Missing);

            //    }
            //    else if (Commonyy.IsImage(fileName))
            //    {
            //        files.Add(fileName.Replace("Upload/", ""));
            //    }
            //    result = Newtonsoft.Json.JsonConvert.SerializeObject(files);
            //}
            //catch (Exception ex)
            //{
            //    _logger.LogError(ex.ToString());
            //    return new ResponseData(Code.ServerError, ex.Message);
            //}
            //finally
            //{
            //    //if (doc != null)
            //    //{
            //    //    doc.Close(ref missing, ref missing, ref missing);
            //    //    ((Microsoft.Office.Interop.Word._Application)word).Quit();
            //    //}
            //    if (word != null)
            //    {
            //        word.Quit(Type.Missing, Type.Missing, Type.Missing);
            //    }
            //}
            return new ResponseData(Code.Success, "");
        }

        public static string Crop(string fileName)
        {
            try
            {
                using (Image image = Image.FromFile(fileName))
                {
                    int height = image.Height >= 800 ? image.Height : 800;
                    int width = image.Width <= 1366 ? image.Width : 1366;
                    Bitmap cropped = new Bitmap(width, height);
                    using (Graphics g = Graphics.FromImage(cropped))
                    {
                        g.DrawImage(image, new Rectangle(0, 0, width, height), new Rectangle(0, 35, image.Width, image.Height), GraphicsUnit.Pixel);

                        fileName = fileName.Replace("temp", "");
                        cropped.Save(fileName);
                        return fileName.Split("/").Last();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public static System.Drawing.Bitmap CombineBitmap(string[] files)
        {
            //read all images into memory
            List<System.Drawing.Bitmap> images = new List<System.Drawing.Bitmap>();
            System.Drawing.Bitmap finalImage = null;

            try
            {
                int width = 0;
                int height = 0;

                foreach (string image in files)
                {
                    //create a Bitmap from the file and add it to the list
                    System.Drawing.Bitmap bitmap = new System.Drawing.Bitmap(image);

                    //update the size of the final bitmap
                    width += bitmap.Width;
                    height = bitmap.Height > height ? bitmap.Height : height;

                    images.Add(bitmap);
                }

                //create a bitmap to hold the combined image
                finalImage = new System.Drawing.Bitmap(width, height);

                //get a graphics object from the image so we can draw on it
                using (System.Drawing.Graphics g = System.Drawing.Graphics.FromImage(finalImage))
                {
                    //set background color
                    g.Clear(System.Drawing.Color.Black);

                    //go through each image and draw it on the final image
                    int offset = 0;
                    foreach (System.Drawing.Bitmap image in images)
                    {
                        g.DrawImage(image,
                          new System.Drawing.Rectangle(offset, 0, image.Width, image.Height));
                        offset += image.Width;
                    }
                }

                return finalImage;
            }
            catch (Exception)
            {
                if (finalImage != null)
                    finalImage.Dispose();
                //throw ex;
                throw;
            }
            finally
            {
                //clean up memory
                foreach (System.Drawing.Bitmap image in images)
                {
                    image.Dispose();
                }
            }
        }

    }
}
