using AutoMapper;
using Backend.Infrastructure.EntityFramework.Datatables;
using Backend.Infrastructure.EntityFramework.Repositories;
using Backend.Infrastructure.Utils;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace Backend.Business
{
    public class OldDataHandler : IOldData
    {
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public OldDataHandler(IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseData GetHoSoDangKy(HoSoDangKyModel model)
        {
            try
            {
                using UnitOfWork unitOfWork = new(_httpContextAccessor);
                var totalCount = new SqlParameter
                {
                    ParameterName = "TotalCount",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Direction = System.Data.ParameterDirection.Output
                };
                var spResult = unitOfWork.Repository<RegisteredHistorySpResponse>().dbSet.FromSqlRaw(
                    "SP_ThanhVien_LichSuHoSoDangKy @UserEmail = {0}, @PageNumber = {1}, @RowspPage = {2}, @TotalCount = {3} OUTPUT, @IDNhomMonThi = {4}",
                    model.UserEmail, model.PageNumber, model.PageSize, totalCount, model.ExamType.HasValue ? (int)model.ExamType : DBNull.Value).ToList();
                return new PageableData<IEnumerable<object>>
                {
                    Code = Code.Success,
                    PageNumber = model.PageNumber,
                    PageSize = model.PageSize,
                    TotalCount = Convert.ToInt32(totalCount.Value),
                    Data = spResult.Select(item => new
                    {
                        item.Id,
                        CodeProfile = item.MaHoSo,
                        FullName = item.Hoten,
                        BirthDay = item.NgaySinh,
                        Sex = item.GioiTinh.GetValueOrDefault() ? "Nam" : "Nữ",
                        DateApply = item.NgayThuHoSo?.ToString("dd/MM/yyyy"),
                        TimeApply = $"{item.GioBatDau?.Hours.ToString("D2")}:{item.GioBatDau?.Minutes.ToString("D2")} - {item.GioKetThuc?.Hours.ToString("D2")}:{item.GioKetThuc?.Minutes.ToString("D2")}",
                        HeaderQuater = item.TenPhongBan,
                        ExamName = item.TenMonThi,
                        Status = item.IDTrangThaiHoSo,
                        StatusText = item.TenTrangThai,
                        StatusPaid = item.IsDaThanhToan.GetValueOrDefault() ? "Đã thanh toán" : "Chưa thanh toán",
                        Note = item.DangKyGhiChu,
                        Price = item.ThanhTien,
                        DateTest = item.NgayThi?.ToString("dd/MM/yyyy"),
                        TimeTest = item.GioThi,
                        ExamVersionName = "",
                        PlaceTest = item.TenHoiDongThi,
                        ReturnDateResult = item.LichThiGhiChu,
                        ServiceName = "",
                        Receipt = item.HinhThucNhanKetQua,
                        Address = item.DiaChiNguoiNhan,
                        ExamVersionData = item.IDPhienBanMonThi.HasValue ? new
                        {
                            Id = item.IDPhienBanMonThi,
                            Name = item.TenPhienBan,
                            Price = item.DonGia
                        } : default,
                        ListService = Array.Empty<object>(),
                        CanEdit = false,
                        ReceiptFee = 0
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
