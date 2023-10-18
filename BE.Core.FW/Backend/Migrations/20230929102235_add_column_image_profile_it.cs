using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_column_image_profile_it : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StudentCardImage",
                table: "UserProfileRegisteredIT",
                newName: "SchoolCertificate");

            migrationBuilder.AddColumn<string>(
                name: "BirthCertificate",
                table: "UserProfileRegisteredIT",
                type: "nvarchar(max)",
                nullable: true);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthCertificate",
                table: "UserProfileRegisteredIT");

            migrationBuilder.RenameColumn(
                name: "SchoolCertificate",
                table: "UserProfileRegisteredIT",
                newName: "StudentCardImage");
        }
    }
}
