using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class update_table_blaclist_add_table_decision : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrestationDate",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "CCCD",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "CMND",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "DeadlineTo",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "ExamTypeId",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "IsDelete",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "LimitedTime",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "OtherPapers",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "Passport",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "Blacklist");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Blacklist",
                newName: "TypeIdCard");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Blacklist",
                newName: "IDNumberCard");

            migrationBuilder.AlterColumn<int>(
                name: "IsSendMail",
                table: "SysExamRoomDivided",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<int>(
                name: "IsSendMail",
                table: "SysDividingExamPlace",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<int>(
                name: "Target",
                table: "Blacklist",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<Guid>(
                name: "ExamId",
                table: "Blacklist",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsAutoFill",
                table: "Blacklist",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "DecisionBlacklists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BlacklistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DecisionNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DecisionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Reason = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FormProcess = table.Column<int>(type: "int", nullable: true),
                    ExamIdBan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DecisionBlacklists", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DecisionBlacklists");

            migrationBuilder.DropColumn(
                name: "ExamId",
                table: "Blacklist");

            migrationBuilder.DropColumn(
                name: "IsAutoFill",
                table: "Blacklist");

            migrationBuilder.RenameColumn(
                name: "TypeIdCard",
                table: "Blacklist",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "IDNumberCard",
                table: "Blacklist",
                newName: "LastName");

            migrationBuilder.AlterColumn<bool>(
                name: "IsSendMail",
                table: "SysExamRoomDivided",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "IsSendMail",
                table: "SysDividingExamPlace",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Target",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrestationDate",
                table: "Blacklist",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CCCD",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CMND",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeadlineTo",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamTypeId",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDelete",
                table: "Blacklist",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LimitedTime",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherPapers",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Passport",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
