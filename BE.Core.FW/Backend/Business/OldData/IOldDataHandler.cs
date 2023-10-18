using Backend.Infrastructure.Utils;

namespace Backend.Business
{
    public interface IOldData
    {
        ResponseData GetHoSoDangKy(HoSoDangKyModel model);
    }
}
