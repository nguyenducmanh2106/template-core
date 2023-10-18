using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Infrastructure.EntityFramework.Datatables
{
    public class RegisteredHistorySpResponse
    {
        public int? Id { get; set; }
        public string? MaHoSo { get; set; }
        public string? Hoten { get; set; }
        public string? NgaySinh { get; set; }
        public bool? GioiTinh { get; set; }
        public DateTime? NgayThuHoSo { get; set; }
        public TimeSpan? GioBatDau { get; set; }
        public TimeSpan? GioKetThuc { get; set; }
        public string? TenPhongBan { get; set; }
        public string? TenMonThi { get; set; }
        public int? IDTrangThaiHoSo { get; set; }
        public string? TenTrangThai { get; set; }
        public bool? IsDaThanhToan { get; set; }
        public string? DangKyGhiChu { get; set; }
        [Column(TypeName = "decimal(18,0)")]
        public decimal? ThanhTien { get; set; }
        [Column(TypeName = "decimal(18,0)")]
        public decimal? DonGia { get; set; }
        public DateTime? NgayThi { get; set; }
        public string? GioThi { get; set; }
        public string? TenHoiDongThi { get; set; }
        public string? LichThiGhiChu { get; set; }
        public string? HinhThucNhanKetQua { get; set; }
        public string? DiaChiNguoiNhan { get; set; }
        public int? IDPhienBanMonThi { get; set; }
        public string? TenPhienBan { get; set; }
        public DateTime? NgayDangKy { get; set; }
    }
}
