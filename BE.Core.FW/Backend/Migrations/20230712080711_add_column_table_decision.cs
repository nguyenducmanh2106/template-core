using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class add_column_table_decision : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApproveBy",
                table: "DecisionBlacklists",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "DecisionBlacklists",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateApprove",
                table: "DecisionBlacklists",
                type: "datetime2",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApproveBy",
                table: "DecisionBlacklists");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DecisionBlacklists");

            migrationBuilder.DropColumn(
                name: "DateApprove",
                table: "DecisionBlacklists");
        }
    }
}
