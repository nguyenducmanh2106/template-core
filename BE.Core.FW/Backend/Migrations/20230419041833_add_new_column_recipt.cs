using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_new_column_recipt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddReceipt",
                table: "ManageRegisteredCandidates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullNameReceipt",
                table: "ManageRegisteredCandidates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneReceipt",
                table: "ManageRegisteredCandidates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Receipt",
                table: "ManageRegisteredCandidates",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddReceipt",
                table: "ManageRegisteredCandidates");

            migrationBuilder.DropColumn(
                name: "FullNameReceipt",
                table: "ManageRegisteredCandidates");

            migrationBuilder.DropColumn(
                name: "PhoneReceipt",
                table: "ManageRegisteredCandidates");

            migrationBuilder.DropColumn(
                name: "Receipt",
                table: "ManageRegisteredCandidates");
        }
    }
}
