using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using ExcelDataReader;
using Microsoft.Extensions.Hosting.Internal;
using Serilog;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection.PortableExecutable;

namespace Backend.Business.ResonBlacklist
{
    public class ResonBlacklistHandler : IResonBlacklistHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private IWebHostEnvironment _hostingEnvironment;

        public ResonBlacklistHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hostingEnvironment = hostingEnvironment;
        }

        public ResponseData Create(ResonBlacklistModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                model.Id = Guid.NewGuid();

                unitOfWork.Repository<SysResonBlacklist>().Insert(_mapper.Map<SysResonBlacklist>(model));

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
                var exits = unitOfWork.Repository<SysResonBlacklist>().FirstOrDefault(x => x.Id == id);

                if (exits == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
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
                var data = unitOfWork.Repository<SysResonBlacklist>().Get().Select(p => new ResonBlacklistModel
                {
                    Id = p.Id,
                    Name = p.Name,
                    Note = p.Note,
                    Status = p.Status,
                    CreatedOnDate = p.CreatedOnDate.ToString("dd/MM/yyyy"),
                }).ToList();

                return new ResponseDataObject<List<ResonBlacklistModel>>(data, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(ResonBlacklistModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysResonBlacklist>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");
                exist.Name = model.Name;
                exist.Note = model.Note;
                exist.Status = model.Status;
                unitOfWork.Repository<SysResonBlacklist>().Update(exist);
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
