using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class addCountryAndLanguageKoreaName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Country",
                table: "UserProfileRegistered",
                newName: "CountryEnglishName");

            migrationBuilder.AddColumn<string>(
                name: "CountryKoreanName",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LanguageEnglishName",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LanguageKoreanName",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryKoreanName",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "LanguageEnglishName",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "LanguageKoreanName",
                table: "UserProfileRegistered");

            migrationBuilder.RenameColumn(
                name: "CountryEnglishName",
                table: "UserProfileRegistered",
                newName: "Country");
        }
    }
}
