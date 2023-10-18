using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_table_Profile_register : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CandidateNumber",
                table: "ManageRegisteredCandidateTopik");

            migrationBuilder.DropColumn(
                name: "ExamRoomId",
                table: "ManageRegisteredCandidateTopik");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "ManageRegisteredCandidateTopik",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "UserProfileRegistered",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateRegisterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Birthday = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CCCD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CMND = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Passport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfCCCD = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PlaceOfCCCD = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactAddressCityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactAddressDictrictId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactAddressWardId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContactAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Job = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfileRegistered", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ManageRegisteredCandidateTopik");

            migrationBuilder.AddColumn<string>(
                name: "CandidateNumber",
                table: "ManageRegisteredCandidateTopik",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExamRoomId",
                table: "ManageRegisteredCandidateTopik",
                type: "uniqueidentifier",
                nullable: true);
        }
    }
}
