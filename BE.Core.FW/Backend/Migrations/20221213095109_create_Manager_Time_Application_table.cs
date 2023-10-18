using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class create_Manager_Time_Application_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ManageApplicationTimes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SysTimeFrameId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HeaderQuarterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceivedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaxRegistry = table.Column<int>(type: "int", nullable: false),
                    Registed = table.Column<int>(type: "int", nullable: true),
                    TimeStart = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeEnd = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsShow = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManageApplicationTimes", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ManageApplicationTimes");
        }
    }
}
