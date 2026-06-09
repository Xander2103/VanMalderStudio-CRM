using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanMalderStudio.CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddArchiveFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArchiveReason",
                table: "Leads",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Leads",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Leads",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ArchiveReason",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Clients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Clients",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchiveReason",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ArchiveReason",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Clients");
        }
    }
}
