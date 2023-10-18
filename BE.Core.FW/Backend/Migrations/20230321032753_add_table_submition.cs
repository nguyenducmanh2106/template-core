using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_table_submition : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TestedTOEIC",
                table: "ManageRegisteredCandidates",
                newName: "IsTested");

            migrationBuilder.RenameColumn(
                name: "TestTOEICDate",
                table: "ManageRegisteredCandidates",
                newName: "TestDate");

            migrationBuilder.CreateTable(
                name: "UserSubmitTime",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmissionTimeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSubmitTime", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSubmitTime");

            migrationBuilder.RenameColumn(
                name: "TestDate",
                table: "ManageRegisteredCandidates",
                newName: "TestTOEICDate");

            migrationBuilder.RenameColumn(
                name: "IsTested",
                table: "ManageRegisteredCandidates",
                newName: "TestedTOEIC");
        }
    }
}
