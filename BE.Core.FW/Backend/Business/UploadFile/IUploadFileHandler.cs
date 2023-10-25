using Backend.Infrastructure.Utils;
using Backend.Model;
using System.ComponentModel.DataAnnotations;

namespace Backend.Business.UploadFile
{
    public interface IUploadFileHandler
    {
        Task<List<FileResultModel>> UploadFiles([Required] List<IFormFile> formFiles);
        Task<ResponseData> DeleteFile(string url);
        Task<ResponseData> GetImageFile(string fileName);
    }
}
