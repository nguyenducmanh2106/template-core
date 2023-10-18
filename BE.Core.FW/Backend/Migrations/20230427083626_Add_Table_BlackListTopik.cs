using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class Add_Table_BlackListTopik : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BlackListTopik",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdentityCard = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CitizenIdentityCard = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Passport = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    StartWorkDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinishWorkDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NotifyResultDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinishPunishmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PunishmentAction = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CandicateNumber = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExamPeriod = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Area = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Exam = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlackListTopik", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlackListTopik");
        }
    }
}
