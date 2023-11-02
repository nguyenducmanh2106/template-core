using AutoMapper;
using Backend.Infrastructure.Common.Interfaces;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Backend.Model;
using DocumentFormat.OpenXml.Spreadsheet;
using Newtonsoft.Json;
using Serilog;
using Shared.Caching.Impl;
using Shared.Caching.Interface;
using System;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.Contract
{
    public class ContractHandler : IContractHandler
    {
        private readonly ICurrentUser _currentUser;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;
        private readonly ICached _cached;
        public ContractHandler(IHttpContextAccessor httpContextAccessor, IMapper mapper, ICached cached, ICurrentUser currentUser)
        {
            _cached = cached;
            _mapper = mapper;
            _currentUser = currentUser;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Approve(Guid id, Guid documentId, string commandName, string comment, Guid userId)
        {
            throw new NotImplementedException();
        }

        public ResponseData ChangeOwnerContract(Guid contractId, ContractModel contract)
        {
            throw new NotImplementedException();
        }

        public ResponseData Create(ContractModel model)
        {
            throw new NotImplementedException();
        }

        public Task CreateFileExcelPABH(Guid contractId)
        {
            throw new NotImplementedException();
        }

        public ResponseData Delete(Guid id)
        {
            throw new NotImplementedException();
        }

        public ResponseData DeleteContractFile(Guid contractId, Guid id)
        {
            throw new NotImplementedException();
        }

        public ResponseData FillContractNumber(Guid id, ContractModel model)
        {
            throw new NotImplementedException();
        }

        public async Task<ResponseData> Get(string filter = "{}")
        {
            try
            {
                Guid userId = _currentUser.GetUserId();
                int pageNumber = 0;
                int pageSize = 20;
                int totalCount = 0;
                var filterModel = JsonConvert.DeserializeObject<ContractFilterModel>(filter);
                if (filterModel == null)
                    return new ResponseDataError(Code.BadRequest, "Filter invalid");
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysContract>().GetAll();
                var contractFileEntity = unitOfWork.Repository<SysContractFile>().GetAll();
                var customerEntityWFA = unitOfWork.Repository<SysCustomer>().GetAll();
                //var districtEntityWFA = unitOfWork.Repository<SysDistrict>().Get();
                var provinceEntityWFA = unitOfWork.Repository<SysProvince>().GetAll();
                var departmentEntityWFA = unitOfWork.Repository<SysDepartment>().GetAll();
                var contractTypeEntityWFA = unitOfWork.Repository<SysContractType>().GetAll();

                if (!string.IsNullOrEmpty(filterModel.TextSearch))
                {
                    data = data.Where(x => (!string.IsNullOrEmpty(x.ContractNumber) && x.ContractNumber.ToLower().Contains(filterModel.TextSearch.ToLower()))
                    || (!string.IsNullOrEmpty(x.Description) && x.Description.ToLower().Contains(filterModel.TextSearch.ToLower()))
                    );
                }
                if (filterModel.CustomerId.HasValue)
                {
                    data = data.Where(x => x.CustomerId == filterModel.CustomerId.Value);
                }
                if (filterModel.DepartmentId.HasValue)
                {
                    data = data.Where(x => x.DepartmentId == filterModel.DepartmentId.Value);
                }
                if (!string.IsNullOrEmpty(filterModel.Tab))
                {
                    switch (filterModel.Tab)
                    {
                        case TabContract.All:
                            data = data.Where(g =>
                         (
                        ((string.IsNullOrEmpty(g.State) || string.IsNullOrEmpty(g.WorkFlowPerson)) && g.OwnerId == userId)//người tạo chưa trình hoặc đã trình nhưng chưa ai duyệt
                        || (!string.IsNullOrEmpty(g.State) && g.State != nameof(WorkflowState.Finish) && !string.IsNullOrEmpty(g.WorkFlowPerson) && g.OwnerId == userId)// người tạo đã trình và có người phê duyệt và trạng thái duyệt khác trạng thái kết thúc
                         || (!string.IsNullOrEmpty(g.State) && (!string.IsNullOrEmpty(g.PersionApprove) && g.PersionApprove.ToLower().Contains(userId.ToString().ToLower())) && g.State != nameof(WorkflowState.Finish) && (string.IsNullOrEmpty(g.WorkFlowPerson) || (!string.IsNullOrEmpty(g.WorkFlowPerson) && !g.WorkFlowPerson.Contains(userId.ToString()))))//người duyệt kế tiếp = người duyệt và danh sách những người đã duyệt không chứa người duyệt
                         || (!string.IsNullOrEmpty(g.WorkflowUrl) && g.WorkflowUrl.Contains("5007") && (!string.IsNullOrEmpty(g.PersionApprove) && ((!string.IsNullOrEmpty(g.WorkFlowPerson) && !g.WorkFlowPerson.ToLower().Contains("139e5940-1a2c-4c84-8879-c3a81437a43d") && userId == new Guid("139e5940-1a2c-4c84-8879-c3a81437a43d") && g.PersionApprove.ToLower().Contains("139e5940-1a2c-4c84-8879-c3a81437a43d")) || (!string.IsNullOrEmpty(g.WorkFlowPerson) && userId == new Guid("825c8798-f4fa-45ff-b222-147966655f31") && !g.WorkFlowPerson.ToLower().Contains("825c8798-f4fa-45ff-b222-147966655f31") && g.PersionApprove.ToLower().Contains("825c8798-f4fa-45ff-b222-147966655f31")))))
                         )
                         ||
                         ((!string.IsNullOrEmpty(g.State) && g.State == nameof(WorkflowState.Finish) && g.OwnerId == userId)//trạng thái kết thúc và người đăng nhập = người tạo
                            || (!string.IsNullOrEmpty(g.WorkFlowPerson) && g.WorkFlowPerson.ToLower().Contains(userId.ToString().ToLower()) && g.OwnerId != userId)// nằm trong ds những người đã duyệt và người đăng nhập khác người tạo
                            )
                          );
                            break;
                        case TabContract.Waiting:
                            data = data.Where(g =>
                           (
                          ((string.IsNullOrEmpty(g.State) || string.IsNullOrEmpty(g.WorkFlowPerson)) && g.OwnerId == userId)//người tạo chưa trình hoặc đã trình nhưng chưa ai duyệt
                          || (!string.IsNullOrEmpty(g.State) && g.State != nameof(WorkflowState.Finish) && !string.IsNullOrEmpty(g.WorkFlowPerson) && g.OwnerId == userId)// người tạo đã trình và có người phê duyệt và trạng thái duyệt khác trạng thái kết thúc
                           || (!string.IsNullOrEmpty(g.State) && (!string.IsNullOrEmpty(g.PersionApprove) && g.PersionApprove.ToLower().Contains(userId.ToString().ToLower())) && g.State != nameof(WorkflowState.Finish) && (string.IsNullOrEmpty(g.WorkFlowPerson) || (!string.IsNullOrEmpty(g.WorkFlowPerson) && !g.WorkFlowPerson.Contains(userId.ToString()))))//người duyệt kế tiếp = người duyệt và danh sách những người đã duyệt không chứa người duyệt
                           || (!string.IsNullOrEmpty(g.WorkflowUrl) && g.WorkflowUrl.Contains("5007") && (!string.IsNullOrEmpty(g.PersionApprove) && ((!string.IsNullOrEmpty(g.WorkFlowPerson) && !g.WorkFlowPerson.ToLower().Contains("139e5940-1a2c-4c84-8879-c3a81437a43d") && userId == new Guid("139e5940-1a2c-4c84-8879-c3a81437a43d") && g.PersionApprove.ToLower().Contains("139e5940-1a2c-4c84-8879-c3a81437a43d")) || (!string.IsNullOrEmpty(g.WorkFlowPerson) && userId == new Guid("825c8798-f4fa-45ff-b222-147966655f31") && !g.WorkFlowPerson.ToLower().Contains("825c8798-f4fa-45ff-b222-147966655f31") && g.PersionApprove.ToLower().Contains("825c8798-f4fa-45ff-b222-147966655f31")))))
                           )
                            );
                            break;
                        case TabContract.Approved:
                            data = data.Where(g =>
                          ((!string.IsNullOrEmpty(g.State) && g.State == nameof(WorkflowState.Finish) && g.OwnerId == userId)//trạng thái kết thúc và người đăng nhập = người tạo
                            || (!string.IsNullOrEmpty(g.WorkFlowPerson) && g.WorkFlowPerson.ToLower().Contains(userId.ToString().ToLower()) && g.OwnerId != userId)// nằm trong ds những người đã duyệt và người đăng nhập khác người tạo
                            )
                           );
                            break;
                        case TabContract.No_Approved:
                            data = data.Where(g => !string.IsNullOrEmpty(g.State) && g.State == nameof(WorkflowState.Reject));
                            break;
                        default:
                            break;
                    }
                }
                totalCount = data.Count();
                if (filterModel.Page.HasValue && filterModel.Size.HasValue)
                {
                    data = data.OrderBy(g => g.CreatedOnDate).Skip((filterModel.Page.Value - 1) * filterModel.Size.Value).Take(filterModel.Size.Value);
                    pageNumber = filterModel.Page.Value;
                    pageSize = filterModel.Size.Value;
                }

                var tempData = data?.ToList() ?? new List<SysContract>();
                var result = new List<ContractModel>();

                foreach (var item in tempData)
                {
                    var contractFiles = contractFileEntity.Where(g => g.ContractId == item.Id)?.ToList();
                    var modelMapping = _mapper.Map<ContractModel>(item);
                    modelMapping.DepartmentName = modelMapping.DepartmentId.HasValue ? departmentEntityWFA.FirstOrDefault(g => g.Id == modelMapping.DepartmentId.Value)?.Name : string.Empty;
                    modelMapping.CustomerName = modelMapping.CustomerId.HasValue ? customerEntityWFA.FirstOrDefault(g => g.Id == modelMapping.CustomerId.Value)?.Name : string.Empty;
                    modelMapping.ProvinceName = modelMapping.ProvinceId.HasValue ? provinceEntityWFA.FirstOrDefault(g => g.Id == modelMapping.ProvinceId.Value)?.Name : string.Empty;
                    modelMapping.ContractFiles = contractFiles?.Count() > 0 ? _mapper.Map<List<ContractFileModel>>(contractFiles) : new List<ContractFileModel>();
                    result.Add(modelMapping);
                }

                var pagination = new Pagination()
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPage = (int)Math.Ceiling((decimal)totalCount / pageSize)
                };
                return new PageableData<List<ContractModel>>(result, pagination, Code.Success, "");
            }
            catch (Exception ex)
            {
                Log.Error(ex, ex.Message);
                return new ResponseDataError(Code.ServerError, ex.Message);
            }
        }

        public ResponseData GetByDepartmentId(List<Guid> departmentId, string statusWorkflow = "")
        {
            throw new NotImplementedException();
        }

        public ResponseData GetById(Guid id)
        {
            throw new NotImplementedException();
        }

        public ResponseData GetContractProductByContractId(Guid contractId)
        {
            throw new NotImplementedException();
        }

        public ResponseData GetContractUnPaidByDepartmentId(List<Guid> departmentId)
        {
            throw new NotImplementedException();
        }

        public ResponseData List(Guid contractId)
        {
            throw new NotImplementedException();
        }

        public ResponseData MarkContract(Guid contractId, ContractModel contract)
        {
            throw new NotImplementedException();
        }

        public ResponseData Update(Guid id, ContractModel model)
        {
            throw new NotImplementedException();
        }

        public ResponseData UpdateStateRecord(Guid documentId, ContractModel model)
        {
            throw new NotImplementedException();
        }
    }
}
