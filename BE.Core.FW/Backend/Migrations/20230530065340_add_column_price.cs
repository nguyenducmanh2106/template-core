using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_column_price : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowUsePersonalData",
                table: "UserProfileRegistered",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<long>(
                name: "Price",
                table: "ManageRegisteredCandidates",
                type: "bigint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowUsePersonalData",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "ManageRegisteredCandidates");
        }
    }
}
