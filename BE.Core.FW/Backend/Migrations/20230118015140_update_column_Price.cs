using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class update_column_Price : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "ExamScheduleTopiks");

            migrationBuilder.AddColumn<long>(
                name: "Price",
                table: "ManageRegisteredCandidateTopik",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "ManageRegisteredCandidateTopik");

            migrationBuilder.AddColumn<long>(
                name: "Price",
                table: "ExamScheduleTopiks",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }
    }
}
