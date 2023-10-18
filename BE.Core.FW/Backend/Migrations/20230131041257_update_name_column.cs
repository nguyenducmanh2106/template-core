using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class update_name_column : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContactAddressDictrictId",
                table: "UserProfileRegistered",
                newName: "ContactAddressDistrictId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfCCCD",
                table: "UserProfileRegistered",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Birthday",
                table: "UserProfileRegistered",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContactAddressDistrictId",
                table: "UserProfileRegistered",
                newName: "ContactAddressDictrictId");

            migrationBuilder.AlterColumn<string>(
                name: "DateOfCCCD",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Birthday",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");
        }
    }
}
