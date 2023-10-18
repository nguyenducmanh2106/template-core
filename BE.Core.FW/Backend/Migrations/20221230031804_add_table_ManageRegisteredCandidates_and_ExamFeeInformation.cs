using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_table_ManageRegisteredCandidates_and_ExamFeeInformation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamFeeInformation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ManageRegisteredCandidatesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SeviceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NameService = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<long>(type: "bigint", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamFeeInformation", x => x.Id);
                });


            migrationBuilder.CreateTable(
                name: "ManageRegisteredCandidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExamPurpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScoreGoal = table.Column<long>(type: "bigint", nullable: false),
                    TestedTOEIC = table.Column<bool>(type: "bit", nullable: false),
                    TestTOEICDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PlaceOfRegistration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmissionTime = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExamVersion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TestScheduleDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExamResultsReturnRate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PriorityObject = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AccompaniedService = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsAccept = table.Column<bool>(type: "bit", nullable: true),
                    IsPaid = table.Column<bool>(type: "bit", nullable: true),
                    DateAccept = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateReceive = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManageRegisteredCandidates", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamFeeInformation");

            migrationBuilder.DropTable(
                name: "ManageRegisteredCandidates");

        }
    }
}
