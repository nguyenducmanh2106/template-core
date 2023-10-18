using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class update_column_database : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAccept",
                table: "ManageRegisteredCandidates");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "ManageRegisteredCandidates");

            migrationBuilder.AlterColumn<string>(
                name: "CountryEnglishName",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "WorkAddress",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkAddressCityId",
                table: "UserProfileRegistered",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkAddressDistrictId",
                table: "UserProfileRegistered",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WorkAddressWardsId",
                table: "UserProfileRegistered",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PlaceOfRegistration",
                table: "ManageRegisteredCandidates",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "AcceptBy",
                table: "ManageRegisteredCandidates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ManageRegisteredCandidates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusPaid",
                table: "ManageRegisteredCandidates",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkAddress",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "WorkAddressCityId",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "WorkAddressDistrictId",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "WorkAddressWardsId",
                table: "UserProfileRegistered");

            migrationBuilder.DropColumn(
                name: "AcceptBy",
                table: "ManageRegisteredCandidates");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ManageRegisteredCandidates");

            migrationBuilder.DropColumn(
                name: "StatusPaid",
                table: "ManageRegisteredCandidates");

            migrationBuilder.AlterColumn<string>(
                name: "CountryEnglishName",
                table: "UserProfileRegistered",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PlaceOfRegistration",
                table: "ManageRegisteredCandidates",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<bool>(
                name: "IsAccept",
                table: "ManageRegisteredCandidates",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "ManageRegisteredCandidates",
                type: "bit",
                nullable: true);
        }
    }
}
