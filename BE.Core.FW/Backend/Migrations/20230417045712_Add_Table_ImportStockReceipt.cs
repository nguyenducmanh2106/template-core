using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class Add_Table_ImportStockReceipt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SysImportStockReceipt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DatePropose = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ImportStockProposalCode = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Code = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    StockId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BatchNote = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ImportMethod = table.Column<int>(type: "int", nullable: false),
                    FileImportSavedPath = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DateSendForApprove = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserApprove = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DateApprove = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReasonReject = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LastModifiedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOnDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysImportStockReceipt", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SysImportStockReceiptDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImportStockReceiptId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SuppliesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SysImportStockReceiptDetail", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SysImportStockReceipt");

            migrationBuilder.DropTable(
                name: "SysImportStockReceiptDetail");
        }
    }
}
