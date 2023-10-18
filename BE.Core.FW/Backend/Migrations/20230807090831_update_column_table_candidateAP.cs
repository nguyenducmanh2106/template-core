using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class update_column_table_candidateAP : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExamScheduleId",
                table: "ManageRegistedCandidateAPs");

            migrationBuilder.RenameColumn(
                name: "ExamIds",
                table: "ManageRegistedCandidateAPs",
                newName: "ScheduleDetailIds");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ScheduleDetailIds",
                table: "ManageRegistedCandidateAPs",
                newName: "ExamIds");

            migrationBuilder.AddColumn<Guid>(
                name: "ExamScheduleId",
                table: "ManageRegistedCandidateAPs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}
