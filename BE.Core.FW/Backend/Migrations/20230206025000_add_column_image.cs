using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_column_image : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IDCardBack",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IDCardFront",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Image3x4",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentCardImage",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IDCardBack",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "IDCardFront",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "Image3x4",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "StudentCardImage",
                table: "UserProfileRegistered");
        }
    }
}
