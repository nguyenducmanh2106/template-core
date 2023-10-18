using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_table_for_it : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ManageRegisteredCandidateIT",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExamPurpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScoreGoal = table.Column<long>(type: "bigint", nullable: false),
                    IsTested = table.Column<bool>(type: "bit", nullable: false),
                    TestDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExamId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExamRegistedData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExamScheduleString = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StatusPaid = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Price = table.Column<long>(type: "bigint", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManageRegisteredCandidateIT", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserProfileRegisteredIT",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateRegisterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FullNameOrigin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Birthday = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TypeIdCard = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IDNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Job = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateOfCCCD = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PlaceOfCCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactAddressCityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactAddressDistrictId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactAddressWardId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IDCardFront = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IDCardBack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StudentCardImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image3x4 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkAddressDistrictId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkAddressWardsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkAddressCityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldCardIDNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldCardID = table.Column<bool>(type: "bit", nullable: false),
                    IsStudent = table.Column<bool>(type: "bit", nullable: false),
                    AllowUsePersonalData = table.Column<bool>(type: "bit", nullable: false),
                    StudentCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfileRegisteredIT", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ManageRegisteredCandidateIT");

            migrationBuilder.DropTable(
                name: "UserProfileRegisteredIT");
        }
    }
}
