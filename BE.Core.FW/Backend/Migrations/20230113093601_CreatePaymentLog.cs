using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class CreatePaymentLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SysPaymentRequestLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TmnCode = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    TxnRef = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Version = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    OrderInfo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ReturnUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    CreateDate = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    ExpireDate = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DateCreateRecord = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysPaymentRequestLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SysPaymentResponseLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentRequestId = table.Column<Guid>(type: "uniqueidentifier", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    OrderInfo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ResponseCode = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    ResponseCodeDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    BankCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BankTranNo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CardType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PayDate = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    TransactionNo = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    TransactionStatus = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    TransactionStatusDescription = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DateCreateRecord = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysPaymentResponseLog", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SysPaymentRequestLog");

            migrationBuilder.DropTable(
                name: "SysPaymentResponseLog");
        }
    }
}
