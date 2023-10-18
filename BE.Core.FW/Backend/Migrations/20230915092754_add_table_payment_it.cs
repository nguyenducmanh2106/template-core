using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_table_payment_it : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SysPaymentITRequestLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    OrderInfo = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ReturnUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DateCreateRecord = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VietnameseName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DOB = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExamSubject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamSubjectDetail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsSendMailPaymentConfirm = table.Column<bool>(type: "bit", nullable: false),
                    FullRequestUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysPaymentITRequestLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SysPaymentITResponseLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    BankCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankTranNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CardType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PayDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransactionNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Result = table.Column<bool>(type: "bit", nullable: false),
                    RawResponse = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateCreateRecord = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysPaymentITResponseLog", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SysPaymentITRequestLog");

            migrationBuilder.DropTable(
                name: "SysPaymentITResponseLog");
        }
    }
}
