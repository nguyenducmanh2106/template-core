using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class addcolumn_ExamRoomIdandcolumn_CandidateNumberintoManageRegisteredCandidateTopik : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CandidateNumber",
                table: "ManageRegisteredCandidateTopik",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ExamRoomId",
                table: "ManageRegisteredCandidateTopik",
                type: "uniqueidentifier",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CandidateNumber",
                table: "ManageRegisteredCandidateTopik");

            migrationBuilder.DropColumn(
                name: "ExamRoomId",
                table: "ManageRegisteredCandidateTopik");
        }
    }
}
