using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class Add_Faq_Language : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FullAnswerEnglish",
                table: "SysFaq",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullAnswerKorean",
                table: "SysFaq",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuestionEnglish",
                table: "SysFaq",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "QuestionKorean",
                table: "SysFaq",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShortAnswerEnglish",
                table: "SysFaq",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShortAnswerKorean",
                table: "SysFaq",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullAnswerEnglish",
                table: "SysFaq");

            migrationBuilder.DropColumn(
                name: "FullAnswerKorean",
                table: "SysFaq");

            migrationBuilder.DropColumn(
                name: "QuestionEnglish",
                table: "SysFaq");

            migrationBuilder.DropColumn(
                name: "QuestionKorean",
                table: "SysFaq");

            migrationBuilder.DropColumn(
                name: "ShortAnswerEnglish",
                table: "SysFaq");

            migrationBuilder.DropColumn(
                name: "ShortAnswerKorean",
                table: "SysFaq");
        }
    }
}
