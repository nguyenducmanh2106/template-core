using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_new_Column_image : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BirthCertificate",
                table: "UserProfileRegistered",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SchoolCertificate",
                table: "UserProfileRegistered",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthCertificate",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "SchoolCertificate",
                table: "UserProfileRegistered");
        }
    }
}
