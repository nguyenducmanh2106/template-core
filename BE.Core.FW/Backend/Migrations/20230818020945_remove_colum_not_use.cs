using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class remove_colum_not_use : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NTHTime",
                table: "ExamPeriod");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NTHTime",
                table: "ExamPeriod",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
