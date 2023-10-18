using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class Add_Column_SysPaymentRequest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "TxnRef",
                table: "SysPaymentRequestLog",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<bool>(
                name: "IsSendMailPaymentConfirm",
                table: "SysPaymentRequestLog",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoteTimeEnterExamRoom",
                table: "SysPaymentRequestLog",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSendMailPaymentConfirm",
                table: "SysPaymentRequestLog");

            migrationBuilder.DropColumn(
                name: "NoteTimeEnterExamRoom",
                table: "SysPaymentRequestLog");

            migrationBuilder.AlterColumn<string>(
                name: "TxnRef",
                table: "SysPaymentRequestLog",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");
        }
    }
}
