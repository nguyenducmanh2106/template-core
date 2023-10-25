using Backend.Infrastructure.Utils;
using Backend.Model;

namespace Backend.Business.Department;

public interface IDepartmentHandler
{
    ResponseData Get(string filter);
    ResponseData GetTree(bool? isCom, bool? isAll);
    ResponseData GetById(Guid id);
    ResponseData Create(DepartmentModel model);
    ResponseData Update(Guid id, DepartmentModel model);
    ResponseData Delete(Guid id);
}