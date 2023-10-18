using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class addcolumnintableDividingExamPlace : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExamAreaName",
                table: "SysDividingExamPlace",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExamPlaceName",
                table: "SysDividingExamPlace",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExamScheduleTopikName",
                table: "SysDividingExamPlace",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExamAreaName",
                table: "SysDividingExamPlace");

            migrationBuilder.DropColumn(
                name: "ExamPlaceName",
                table: "SysDividingExamPlace");

            migrationBuilder.DropColumn(
                name: "ExamScheduleTopikName",
                table: "SysDividingExamPlace");
        }
    }
}
