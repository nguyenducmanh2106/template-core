using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_column_for_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FullNameKorea",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OptionJob",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationCode",
                table: "ManageRegisteredCandidateTopik",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Country",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "FullNameKorea",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "OptionJob",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "RegistrationCode",
                table: "ManageRegisteredCandidateTopik");
        }
    }
}
