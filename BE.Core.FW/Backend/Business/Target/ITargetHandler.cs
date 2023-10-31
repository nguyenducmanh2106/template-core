using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.Target
{
    public interface ITargetHandler
    {
        ResponseData Get(string filter);
        ResponseData GetById(Guid id);
        ResponseData Delete(Guid id);
        ResponseData Import(TargetImportModel importModel);
        ResponseData Approve(Guid id, Guid documentId, string commandName, string comment, Guid userId);

        /// <summary>
        /// Cập nhật hoặc thêm mới mục tiêu doanh số
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        ResponseData UpSert(Guid? departmentId, TargetModel model);

        ResponseData PracticeTarget(Guid id);
        ResponseData UpSertTargetMapping(Guid targetId, TargetModel target);

        /// <summary>
        /// Cập nhật hoặc thêm mới mục tiêu doanh số
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        ResponseData UpSertList(Guid? departmentId, List<TargetModel> targets);

        /// <summary>
        /// Tải file import
        /// </summary>
        /// <returns></returns>
        Task<ResponseData> DownloadFileImport();
    }
}
