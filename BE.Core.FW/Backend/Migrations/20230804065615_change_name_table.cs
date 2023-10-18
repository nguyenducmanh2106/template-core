using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class change_name_table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_SysUserProfileRegisteredAPs",
                table: "SysUserProfileRegisteredAPs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SysManageRegistedCandidateAPs",
                table: "SysManageRegistedCandidateAPs");

            migrationBuilder.RenameTable(
                name: "SysUserProfileRegisteredAPs",
                newName: "UserProfileRegisteredAPs");

            migrationBuilder.RenameTable(
                name: "SysManageRegistedCandidateAPs",
                newName: "ManageRegistedCandidateAPs");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserProfileRegisteredAPs",
                table: "UserProfileRegisteredAPs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ManageRegistedCandidateAPs",
                table: "ManageRegistedCandidateAPs",
                column: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserProfileRegisteredAPs",
                table: "UserProfileRegisteredAPs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ManageRegistedCandidateAPs",
                table: "ManageRegistedCandidateAPs");

            migrationBuilder.RenameTable(
                name: "UserProfileRegisteredAPs",
                newName: "SysUserProfileRegisteredAPs");

            migrationBuilder.RenameTable(
                name: "ManageRegistedCandidateAPs",
                newName: "SysManageRegistedCandidateAPs");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SysUserProfileRegisteredAPs",
                table: "SysUserProfileRegisteredAPs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SysManageRegistedCandidateAPs",
                table: "SysManageRegistedCandidateAPs",
                column: "Id");
        }
    }
}
