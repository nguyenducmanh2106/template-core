using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class modifiedcolumntableSysExamRoomDivided : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CandidateBirthday",
                table: "SysExamRoomDivided",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CandidateEmail",
                table: "SysExamRoomDivided",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CandidateName",
                table: "SysExamRoomDivided",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CandidateNumber",
                table: "SysExamRoomDivided",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CandidatePhone",
                table: "SysExamRoomDivided",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UserProfileId",
                table: "SysExamRoomDivided",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CandidateBirthday",
                table: "SysExamRoomDivided");

            migrationBuilder.DropColumn(
                name: "CandidateEmail",
                table: "SysExamRoomDivided");

            migrationBuilder.DropColumn(
                name: "CandidateName",
                table: "SysExamRoomDivided");

            migrationBuilder.DropColumn(
                name: "CandidateNumber",
                table: "SysExamRoomDivided");

            migrationBuilder.DropColumn(
                name: "CandidatePhone",
                table: "SysExamRoomDivided");

            migrationBuilder.DropColumn(
                name: "UserProfileId",
                table: "SysExamRoomDivided");
        }
    }
}
