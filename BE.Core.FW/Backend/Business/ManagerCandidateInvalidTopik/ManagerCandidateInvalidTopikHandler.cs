using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Serilog;
using System.Data;
using System.Linq;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.ManagerCandidateInvalidTopik
{
    public class ManagerCandidateInvalidTopikHandler : IManagerCandidateInvalidTopikHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ManagerCandidateInvalidTopikHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(ManagerCandidateInvalidTopikModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                model.Id = Guid.NewGuid();
                unitOfWork.Repository<SysCandidateInvalidTopik>().Insert(_mapper.Map<SysCandidateInvalidTopik>(model));

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysCandidateInvalidTopik>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                unitOfWork.Repository<SysCandidateInvalidTopik>().Delete(exits);

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get()
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysCandidateInvalidTopik>().Get();
                var result = new List<ManagerCandidateInvalidTopikModel>();
                foreach (var item in data)
                {
                    result.Add(new ManagerCandidateInvalidTopikModel
                    {
                        Id = item.Id,
                        SBD = item.SBD
                    });
                }
                return new ResponseDataObject<List<ManagerCandidateInvalidTopikModel>>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Import(IFormFile file)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var dt = ExcelHelper.ReadExcelasDataTable(file.OpenReadStream());

                if (dt.Columns[0].ColumnName != CandidateInValid.SBD)
                {
                    return new ResponseDataError(Code.BadRequest, "File không đúng định dạng");
                }

                foreach (DataRow item in dt.Rows)
                {
                    if (item[CandidateInValid.SBD] != null)
                    {
                        var sbd = item[CandidateInValid.SBD];
                        string? sbdSave = !string.IsNullOrEmpty(sbd.ToString()) ? sbd.ToString() : string.Empty;

                        unitOfWork.Repository<SysCandidateInvalidTopik>().Insert(new SysCandidateInvalidTopik
                        {
                            Id = Guid.NewGuid(),
                            SBD = !string.IsNullOrEmpty(sbdSave) ? sbdSave : string.Empty,
                        });
                    }

                }
                unitOfWork.Save();
                return new ResponseDataError(Code.Success, "Success");
            }
            catch (Exception e)
            {
                Log.Error(e, e.Message);
                return new ResponseDataError(Code.ServerError, e.Message);
            }
        }
    }
}
