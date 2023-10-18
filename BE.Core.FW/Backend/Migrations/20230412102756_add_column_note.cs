using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_column_note : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ExamResultsReturnRate",
                table: "ManageRegisteredCandidates",
                newName: "ReturnResultDate");

            migrationBuilder.AddColumn<string>(
                name: "ProfileIncludes",
                table: "ManageRegisteredCandidates",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileIncludes",
                table: "ManageRegisteredCandidates");

            migrationBuilder.RenameColumn(
                name: "ReturnResultDate",
                table: "ManageRegisteredCandidates",
                newName: "ExamResultsReturnRate");
        }
    }
}
