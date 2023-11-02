using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.Contract
{
    public interface IContractHandler
    {
        Task<ResponseData> Get(string filter = "{}");
        ResponseData List(Guid contractId);
        ResponseData GetById(Guid id);
        ResponseData Create(ContractModel model);
        ResponseData Update(Guid id, ContractModel model);
        ResponseData FillContractNumber(Guid id, ContractModel model);
        ResponseData Delete(Guid id);
        ResponseData DeleteContractFile(Guid contractId, Guid id);
        ResponseData Approve(Guid id, Guid documentId, string commandName, string comment, Guid userId);
        ResponseData GetByDepartmentId(List<Guid> departmentId, string statusWorkflow = "");
        ResponseData GetContractUnPaidByDepartmentId(List<Guid> departmentId);
        ResponseData GetContractProductByContractId(Guid contractId);
        Task CreateFileExcelPABH(Guid contractId);

        ///// <summary>
        ///// Cập nhật trạng thái hợp đồng là đã hoàn thành/chưa hoàn thành
        ///// </summary>
        ///// <param name="contractId"></param>
        ///// <param name="contract"></param>
        ///// <returns></returns>
        ResponseData MarkContract(Guid contractId, ContractModel contract);
        ResponseData ChangeOwnerContract(Guid contractId, ContractModel contract);


        /// <summary>
        /// update trạng thái thông qua DocumentId
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        ResponseData UpdateStateRecord(Guid documentId, ContractModel model);
    }
}
