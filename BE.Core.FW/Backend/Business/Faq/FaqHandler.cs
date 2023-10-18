using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class FaqHandler : IFaqHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FaqHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData Create(FaqModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var sysFaq = _mapper.Map<SysFaq>(model);
                sysFaq.Id = Guid.NewGuid();
                sysFaq.CreatedOnDate = DateTime.Now;
                unitOfWork.Repository<SysFaq>().Insert(sysFaq);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Delete(IEnumerable<string> ids)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntitiesInDb = unitOfWork.Repository<SysFaq>().Get(x => ids.Any(item => item.Equals(x.Id.ToString())));
                if (dataEntitiesInDb.Count() != ids.Count())
                    return new ResponseDataError(Code.BadRequest, "Tồn tại đối tượng không xóa được");

                foreach (var item in dataEntitiesInDb)
                    unitOfWork.Repository<SysFaq>().Delete(item);

                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Get(FaqSearchModel model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var query = unitOfWork.Repository<SysFaq>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Keyword))
                    query = query.Where(item =>
                    EF.Functions.Like(item.Question, $"%{model.Keyword}%") || EF.Functions.Like(item.ShortAnswer, $"%{model.Keyword}%")
                    || (!string.IsNullOrEmpty(item.FullAnswer) && EF.Functions.Like(item.FullAnswer, $"%{model.Keyword}%")));

                if (model.ExamTypeId.HasValue)
                    query = query.Where(item => item.ExamTypeId == model.ExamTypeId);

                if (model.IsShow.HasValue)
                    query = query.Where(item => item.IsShow == model.IsShow);

                var totalRecord = query.Count();
                query = query.OrderBy(item => item.Order).Skip((model.PageNumber - 1) * model.PageSize).Take(model.PageSize);

                return new PageableData<IEnumerable<SysFaq>>
                {
                    TotalCount = totalRecord,
                    PageNumber = model.PageNumber,
                    PageSize = model.PageSize,
                    Data = query.Select(item => new SysFaq
                    {
                        Id = item.Id,
                        Dislike = item.Dislike,
                        Like = item.Like,
                        CreatedByUserId = item.CreatedByUserId,
                        CreatedOnDate = item.CreatedOnDate,
                        ExamTypeId = item.ExamTypeId,
                        IsShow = item.IsShow,
                        View = item.View,
                        Question = item.Question,
                        ShortAnswer = model.IncludeShortAnswer ? item.ShortAnswer : string.Empty,
                        HasDetail = item.HasDetail,
                        Order = item.Order
                    })
                };
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
                var dataEntityInDb = unitOfWork.Repository<SysFaq>().GetById(id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                return new ResponseDataObject<SysFaq>(dataEntityInDb);
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Update(Guid id, FaqModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysFaq>().GetById(id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                _mapper.Map(model, dataEntityInDb);
                dataEntityInDb.LastModifiedOnDate = DateTime.Now;

                unitOfWork.Repository<SysFaq>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData Rate(Guid id, bool isLike)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var dataEntityInDb = unitOfWork.Repository<SysFaq>().GetById(id);
                if (dataEntityInDb == null)
                    return new ResponseDataError(Code.NotFound, "Không tìm thấy đối tượng");

                if (isLike)
                    dataEntityInDb.Like = ++dataEntityInDb.Like;
                else
                    dataEntityInDb.Dislike = ++dataEntityInDb.Dislike;

                unitOfWork.Repository<SysFaq>().Update(dataEntityInDb);
                unitOfWork.Save();
                return new ResponseData();
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetDetailAndRelateFaq(Guid id, bool countView, string language)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var numberOfRelateFaq = 3;
                var faq = unitOfWork.Repository<SysFaq>().GetById(id);
                if (faq == null)
                    return new ResponseDataError(Code.BadRequest, "Không tìm thấy đối tượng");

                var relateFaq = unitOfWork.Repository<SysFaq>().GetQueryable(item => item.ExamTypeId == faq.ExamTypeId && item.Id != id).OrderBy(item => Guid.NewGuid()).Take(numberOfRelateFaq).ToList();
                if (countView)
                {
                    faq.View = ++faq.View;
                    unitOfWork.Save();
                }
                return new ResponseDataObject<object>
                {
                    Data = new
                    {
                        faq.Id,
                        Question = language switch
                        {
                            "en" => faq.QuestionEnglish,
                            "ko" => faq.QuestionKorean,
                            _ => faq.Question
                        },
                        FullAnswer = language switch
                        {
                            "en" => faq.FullAnswerEnglish,
                            "ko" => faq.FullAnswerKorean,
                            _ => faq.FullAnswer
                        },
                        RelateFaq = relateFaq.Select(faq => new
                        {
                            faq.Id,
                            Question = language switch
                            {
                                "en" => faq.QuestionEnglish,
                                "ko" => faq.QuestionKorean,
                                _ => faq.Question
                            },
                            ShortAnswer = language switch
                            {
                                "en" => faq.ShortAnswerEnglish,
                                "ko" => faq.ShortAnswerKorean,
                                _ => faq.ShortAnswer
                            }
                        })
                    }
                };
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }

        public ResponseData GetFromPortal(FaqSearchModel model)
        {
            try
            {
                var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var query = unitOfWork.Repository<SysFaq>().GetQueryable(item => true);

                if (!string.IsNullOrEmpty(model.Keyword))
                    query = query.Where(item =>
                    EF.Functions.Like(item.Question, $"%{model.Keyword}%") || EF.Functions.Like(item.ShortAnswer, $"%{model.Keyword}%")
                    || (!string.IsNullOrEmpty(item.FullAnswer) && EF.Functions.Like(item.FullAnswer, $"%{model.Keyword}%")));

                if (model.ExamTypeId.HasValue)
                    query = query.Where(item => item.ExamTypeId == model.ExamTypeId);

                if (model.IsShow.HasValue)
                    query = query.Where(item => item.IsShow == model.IsShow);

                var totalRecord = query.Count();
                query = query.OrderBy(item => item.Order).Skip((model.PageNumber - 1) * model.PageSize).Take(model.PageSize);

                return new PageableData<IEnumerable<object>>
                {
                    TotalCount = totalRecord,
                    PageNumber = model.PageNumber,
                    PageSize = model.PageSize,
                    Data = query.Select(item => new
                    {
                        item.Id,
                        item.CreatedOnDate,
                        item.ExamTypeId,
                        item.IsShow,
                        Question = model.Language == "en" ? item.QuestionEnglish : model.Language == "ko" ? item.QuestionKorean : item.Question,
                        ShortAnswer = model.Language == "en" ? item.ShortAnswerEnglish : model.Language == "ko" ? item.ShortAnswerKorean : item.ShortAnswer,
                        item.HasDetail
                    })
                };
            }
            catch (Exception exception)
            {
                Log.Error(exception, exception.Message);
                return new ResponseDataError(Code.ServerError, exception.Message);
            }
        }
    }
}
