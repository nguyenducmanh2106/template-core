using AutoMapper;
using Backend.Business.ManageRegisteredCandidates;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Serilog;

namespace Backend.Business.ExamFeeInformation
{
    public class ExamFeeInformationHandler : IExamFeeInformationHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;

        public ExamFeeInformationHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
        }

        public ResponseData Create(ExamFeeInformationModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                model.Id = Guid.NewGuid();
                unitOfWork.Repository<SysExamFeeInformation>().Insert(_mapper.Map<SysExamFeeInformation>(model));

                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }


        public ResponseData RestoreDelete(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exits = unitOfWork.Repository<SysExamFeeInformation>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysExamFeeInformation>().Update(exits);

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
                var exits = unitOfWork.Repository<SysExamFeeInformation>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                unitOfWork.Repository<SysExamFeeInformation>().Delete(exits);

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
                var data = unitOfWork.Repository<SysExamFeeInformation>().Get();

                var result = new List<ExamFeeInformationModel>();
                foreach (var item in data)
                {
                    result.Add(new ExamFeeInformationModel
                    {
                        Id = item.Id,
                        ManageRegisteredCandidatesId = item.ManageRegisteredCandidatesId,
                        SeviceId = item.SeviceId,
                        NameService = item.NameService,
                        Price = item.Price,
                        Type = item.Type,
                    });
                }
                return new ResponseDataObject<List<ExamFeeInformationModel>>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetById(Guid id)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysExamFeeInformation>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                var result = new ExamFeeInformationModel
                {
                    Id = existData.Id,
                    ManageRegisteredCandidatesId = existData.ManageRegisteredCandidatesId,
                    SeviceId = existData.SeviceId,
                    NameService = existData.NameService,
                    Price = existData.Price,
                    Type = existData.Type,
                };
                return new ResponseDataObject<ExamFeeInformationModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ExamFeeInformationModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysExamFeeInformation>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Id = model.Id;
                exist.ManageRegisteredCandidatesId = model.ManageRegisteredCandidatesId;
                exist.SeviceId = model.SeviceId;
                exist.NameService = model.NameService;
                exist.Price = model.Price;
                exist.Type = model.Type;

                unitOfWork.Repository<SysExamFeeInformation>().Update(exist);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
    }
}
