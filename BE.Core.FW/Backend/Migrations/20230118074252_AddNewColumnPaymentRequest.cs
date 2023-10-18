using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class AddNewColumnPaymentRequest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResponseToVnp",
                table: "SysPaymentResponseLog",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponseToVnpDescription",
                table: "SysPaymentResponseLog",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DOB",
                table: "SysPaymentRequestLog",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamAddress",
                table: "SysPaymentRequestLog",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamAreaName",
                table: "SysPaymentRequestLog",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamDate",
                table: "SysPaymentRequestLog",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamLocation",
                table: "SysPaymentRequestLog",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamName",
                table: "SysPaymentRequestLog",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KoreanName",
                table: "SysPaymentRequestLog",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "SysPaymentRequestLog",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileCode",
                table: "SysPaymentRequestLog",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                table: "SysPaymentRequestLog",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VietnameseName",
                table: "SysPaymentRequestLog",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResponseToVnp",
                table: "SysPaymentResponseLog");

            migrationBuilder.DropColumn(
                name: "ResponseToVnpDescription",
                table: "SysPaymentResponseLog");

            migrationBuilder.DropColumn(
                name: "DOB",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "ExamAddress",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "ExamAreaName",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "ExamDate",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "ExamLocation",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "ExamName",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "KoreanName",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "ProfileCode",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "UserEmail",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "VietnameseName",
                table: "SysPaymentRequestLog");
        }
    }
}
