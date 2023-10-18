using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class update_colum_filePath : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "Blacklist");

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "DecisionBlacklists",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "DecisionBlacklists");

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "Blacklist",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
