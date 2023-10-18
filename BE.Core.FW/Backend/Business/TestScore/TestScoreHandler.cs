using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Newtonsoft.Json;
using Serilog;
using System.Data;
using static Backend.Infrastructure.Utils.Constant;

namespace Backend.Business.TestScore
{
    public class TestScoreHandler : ITestScoreHandler
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TestScoreHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData CheckByFile(IFormFile file)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var dt = ExcelHelper.ReadExcelasDataTable(file.OpenReadStream());

                if (dt.Columns[0].ColumnName != TestScoreFormCheck.col0
                    || dt.Columns[1].ColumnName != TestScoreFormCheck.col1
                    || dt.Columns[2].ColumnName != TestScoreFormCheck.col2)
                {
                    return new ResponseDataError(Code.BadRequest, "File không đúng định dạng");
                }

                var testScores = unitOfWork.Repository<SysTestScore>().Get();
                HashSet<string> formCodes = new HashSet<string>();

                foreach (DataRow item in dt.Rows)
                {
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col0].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Họ đệm bị trống");
                    }
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col1].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Tên bị trống");
                    }
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col2].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Ngày sinh bị trống");
                    }
                    var formCode = testScores.Where(x => 
                        x.FirstName == item[TestScoreFormColumns.col0].ToString()
                        && x.LastName == item[TestScoreFormColumns.col1].ToString() 
                        && x.DOB == DateTime.FromOADate(Int32.Parse(item[TestScoreFormColumns.col2].ToString()))
                    ).FirstOrDefault();
                    if(formCode != null)
                    {
                        formCodes.Add(formCode.FormCode.ToString());
                    }
                }

                var results = new List<FormCodeDTO>();
                foreach(var item in formCodes)
                {
                    results.Add(new FormCodeDTO(){ formCode = item });
                }

                return new ResponseDataObject<List<FormCodeDTO>>( results , Code.Success, "Success");
            }
            catch (Exception e)
            {
                Log.Error(e, e.Message);
                return new ResponseDataError(Code.ServerError, e.Message);
            }
        }

        public ResponseData Create(TestScoreModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                model.Id = Guid.NewGuid();
                model.FullName = model.FirstName + " " + model.LastName;
                unitOfWork.Repository<SysTestScore>().Insert(_mapper.Map<SysTestScore>(model));

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
                using UnitOfWork unitOfWork = new(_httpContextAccessor);

                var TestScore = unitOfWork.Repository<SysTestScore>().GetById(id);
                if (TestScore != null)
                {
                    unitOfWork.Repository<SysTestScore>().Delete(TestScore);
                    unitOfWork.Save();
                    return new ResponseData(Code.Success, "");
                }
                return new ResponseData(Code.NotFound, "Không tồn tại bản ghi phiếu điểm");
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
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var existNavs = unitOfWork.Repository<SysTestScore>().Get(x => ids.Contains(x.Id.ToString()));
                if (existNavs.Count() > 0)
                {
                    foreach (var item in existNavs)
                    {
                        unitOfWork.Repository<SysTestScore>().Delete(item);
                    }
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

        public ResponseData Get(string filter)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var data = unitOfWork.Repository<SysTestScore>().Get();

                if (!string.IsNullOrEmpty(filter))
                {
                    var model = JsonConvert.DeserializeObject<SearchTestScoreDTO>(filter);
                    if (!string.IsNullOrEmpty(model.FirstName))
                    {
                        data = data.Where(x => x.FirstName.Contains(model.FirstName, StringComparison.OrdinalIgnoreCase));
                    }
                    if (!string.IsNullOrEmpty(model.LastName))
                    {
                        data = data.Where(x => x.LastName.Contains(model.LastName, StringComparison.OrdinalIgnoreCase));
                    }
                    if (!string.IsNullOrEmpty(model.IdOrPassport))
                    {
                        data = data.Where(x => x.IdOrPassport.Contains(model.IdOrPassport, StringComparison.OrdinalIgnoreCase));
                    }
                    if (model.DOB.HasValue)
                    {
                        data = data.Where(x => x.DOB.Date == model.DOB.Value.Date);
                    }
                    var totalCount = data.Count();
                    var totalPage = (int)(totalCount / model.PageSize) + 1;
                    Pagination pagination = new Pagination(model.PageNumber, model.PageSize, totalCount, totalPage);
                    data = data.Skip((model.PageNumber - 1) * model.PageSize).Take(model.PageSize);
                    var result = new List<TestScoreModel>();
                    foreach (var item in data)
                    {
                        result.Add(_mapper.Map<TestScoreModel>(item));
                    }
                    return new PageableData<List<TestScoreModel>>(result, pagination, Code.Success, "");
                }
                else
                {
                    var result = new List<TestScoreModel>();
                    foreach (var item in data)
                    {
                        result.Add(_mapper.Map<TestScoreModel>(item));
                    }
                    return new ResponseDataObject<List<TestScoreModel>>(result, Code.Success, "");
                }
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
                var data = unitOfWork.Repository<SysTestScore>().GetById(id);
                if (data == null)
                {
                    return new ResponseData(Code.NotFound, "Không tồn tại bản ghi phiếu điểm");
                }
                return new ResponseDataObject<TestScoreModel>(_mapper.Map<TestScoreModel>(data), Code.Success, "");
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

                if (dt.Columns[0].ColumnName != TestScoreFormColumns.col0
                    || dt.Columns[1].ColumnName != TestScoreFormColumns.col1
                    || dt.Columns[2].ColumnName != TestScoreFormColumns.col2
                    || dt.Columns[3].ColumnName != TestScoreFormColumns.col3
                    || dt.Columns[4].ColumnName != TestScoreFormColumns.col4
                    || dt.Columns[5].ColumnName != TestScoreFormColumns.col5
                    || dt.Columns[6].ColumnName != TestScoreFormColumns.col6
                    || dt.Columns[7].ColumnName != TestScoreFormColumns.col7
                    || dt.Columns[8].ColumnName != TestScoreFormColumns.col8)
                {
                    return new ResponseDataError(Code.BadRequest, "File không đúng định dạng");
                }

                foreach (DataRow item in dt.Rows)
                {
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col0].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Họ đệm bị trống");
                    }
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col1].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Tên bị trống");
                    }
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col2].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Ngày sinh bị trống");
                    }
                    if (string.IsNullOrEmpty(item[TestScoreFormColumns.col3].ToString()))
                    {
                        return new ResponseDataError(Code.BadRequest, "Số giấy tờ bị trống");
                    }

                    Guid TestScoreId = Guid.NewGuid();
                    var DOB = DateTime.FromOADate(Int32.Parse(item[TestScoreFormColumns.col2].ToString()));
                    var TestDate = DateTime.FromOADate(Int32.Parse(item[TestScoreFormColumns.col7].ToString()));
                    var FirstName = item[TestScoreFormColumns.col0].ToString().Trim(' ');
                    var LastName = item[TestScoreFormColumns.col1].ToString().Trim(' ');
                    var FullName = FirstName + " " + LastName;
                    var TestScore = new SysTestScore()
                    {
                        Id = TestScoreId,
                        FirstName = FirstName,
                        LastName = LastName,
                        FullName = FullName,
                        DOB = DOB,
                        IdOrPassport = item[TestScoreFormColumns.col3].ToString(),
                        Listening = Int32.Parse(item[TestScoreFormColumns.col4].ToString()),
                        Reading = Int32.Parse(item[TestScoreFormColumns.col5].ToString()),
                        Total = Int32.Parse(item[TestScoreFormColumns.col6].ToString()),
                        TestDate = TestDate,
                        FormCode = item[TestScoreFormColumns.col8].ToString(),
                    };
                    unitOfWork.Repository<SysTestScore>().Insert(TestScore);
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

        public ResponseData Update(TestScoreModel model)
        {
            try
            {
                using var unitOfWork = new UnitOfWork(_httpContextAccessor);
                var exist = unitOfWork.Repository<SysTestScore>().GetById(model.Id);
                if (exist == null)
                    return new ResponseDataError(Code.NotFound, "Id not found");

                exist.DOB = model.DOB;
                exist.Listening = model.Listening;
                exist.Reading = model.Reading;
                exist.Total = model.Total;
                exist.TestDate = model.TestDate;
                exist.FirstName = model.FirstName;
                exist.LastName = model.LastName;
                exist.FullName = model.FirstName.Trim(' ') + " " + model.LastName.Trim(' ');
                exist.IdOrPassport = model.IdOrPassport;
                exist.FormCode = model.FormCode;

                unitOfWork.Repository<SysTestScore>().Update(exist);
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
