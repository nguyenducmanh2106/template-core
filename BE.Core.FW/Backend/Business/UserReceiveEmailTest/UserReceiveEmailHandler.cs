using AutoMapper;
using Backend.Business.Policy;
using Backend.Business.Role;
using Backend.Business.User;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using DocumentFormat.OpenXml.VariantTypes;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Serilog;
using System;
using System.Dynamic;
using System.Security.AccessControl;
using System.Text;

namespace Backend.Business.UserReceiveEmail
{
    public class UserReceiveEmailHandler : IUserReceiveEmailHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public UserReceiveEmailHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(UserReceiveEmailTestModel model)
        {
            try
            {
                model.FullName = model.FullName.Trim();
                model.Email = model.Email.Trim();
                model.Id = Guid.NewGuid();
                model.CreatedOnDate = DateTime.Now;
                model.LastModifiedOnDate = DateTime.Now;

                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                if (unitOfWork.Repository<SysUserReceiveEmailTest>().FirstOrDefault(x => x.Email.ToLower() == model.Email.ToLower()) != null)
                    return new ResponseDataError(Code.BadRequest, "Email already exists");

                var entity = _mapper.Map<SysUserReceiveEmailTest>(model);
                unitOfWork.Repository<SysUserReceiveEmailTest>().Insert(entity);
                unitOfWork.Save();
                return new ResponseDataError(Code.Success, "Thêm mới thành công");
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
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var user = unitOfWork.Repository<SysUserReceiveEmailTest>().FirstOrDefault(x => x.Id == id);
                if (user == null)
                    return new ResponseDataError(Code.BadRequest, "User not found");

                unitOfWork.Repository<SysUserReceiveEmailTest>().Delete(user);
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData DeleteMany(List<string> ids)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var users = unitOfWork.Repository<SysUserReceiveEmailTest>().Get(x => ids.Contains(x.Id.ToString()));
                foreach (var item in users)
                {
                    unitOfWork.Repository<SysUserReceiveEmailTest>().Delete(item);
                }
                unitOfWork.Save();
                return new ResponseData(Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(string? name, int status, int pageIndex = 1, int pageSize = 10)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var result = (from user in unitOfWork.Repository<SysUserReceiveEmailTest>().dbSet
                              where (string.IsNullOrEmpty(name) || (!string.IsNullOrEmpty(name) && (user.FullName.ToLower().Contains(name.Trim().ToLower()))))
                              && (status == 0 || user.Status == status)
                              select new UserReceiveEmailTestModel()
                              {
                                  FullName = user.FullName,
                                  Status = user.Status,
                                  Id = user.Id,
                                  Email = user.Email,
                                  LanguageSendMail = user.LanguageSendMail,
                                  LastModifiedOnDate = user.LastModifiedOnDate,
                                  CreatedOnDate = user.CreatedOnDate,
                              })?.OrderByDescending(g => g.CreatedOnDate).Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList() ?? new List<UserReceiveEmailTestModel>();

                int countTotal = unitOfWork.Repository<SysUserReceiveEmailTest>().GetQueryable(
                    g => string.IsNullOrEmpty(name) || (!string.IsNullOrEmpty(name) && (g.FullName.ToLower().Contains(name.Trim().ToLower())))
                    )?.Count() ?? 0;
                int totalPage = (int)Math.Ceiling((decimal)countTotal / pageSize);
                var pagination = new Pagination(pageIndex, pageSize, countTotal, totalPage);
                return new PageableData<List<UserReceiveEmailTestModel>>(result, pagination, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetAll(string? name, int status)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var result = (from user in unitOfWork.Repository<SysUserReceiveEmailTest>().dbSet
                              where (string.IsNullOrEmpty(name) || (!string.IsNullOrEmpty(name) && (user.FullName.ToLower().Contains(name.Trim().ToLower()))))
                              && (status == 0 || user.Status == status)
                              select new UserReceiveEmailTestModel()
                              {
                                  FullName = user.FullName,
                                  Status = user.Status,
                                  Id = user.Id,
                                  Email = user.Email,
                                  LanguageSendMail = user.LanguageSendMail,
                                  LastModifiedOnDate = user.LastModifiedOnDate,
                                  CreatedOnDate = user.CreatedOnDate,
                              })?.OrderByDescending(g => g.CreatedOnDate).ToList() ?? new List<UserReceiveEmailTestModel>();


                return new ResponseDataObject<List<UserReceiveEmailTestModel>>(result, Code.Success, "");
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
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var existData = unitOfWork.Repository<SysUserReceiveEmailTest>().GetById(id);
                if (existData == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");
                var result = _mapper.Map<UserReceiveEmailTestModel>(existData);

                return new ResponseDataObject<UserReceiveEmailTestModel>(result, Code.Success, "");
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(Guid id, UserReceiveEmailTestModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                if (unitOfWork.Repository<SysUserReceiveEmailTest>().FirstOrDefault(x => x.Id != id && x.Email.ToLower() == model.Email.ToLower()) != null)
                    return new ResponseDataError(Code.BadRequest, "Email đã tồn tại");

                var existUser = unitOfWork.Repository<SysUserReceiveEmailTest>().GetById(id);
                if (existUser == null)
                    return new ResponseDataError(Code.BadRequest, "Id not found");

                existUser.Status = model.Status;
                existUser.Email = model.Email.Trim();
                existUser.FullName = model.FullName.Trim();
                existUser.LanguageSendMail = model.LanguageSendMail;
                existUser.LastModifiedOnDate = DateTime.Now;
                unitOfWork.Repository<SysUserReceiveEmailTest>().Update(existUser);
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
