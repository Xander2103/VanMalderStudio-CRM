using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanMalderStudio.CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadBusinessValueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedValue",
                table: "Leads",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ProposalValue",
                table: "Leads",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WinProbability",
                table: "Leads",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstimatedValue",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ProposalValue",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "WinProbability",
                table: "Leads");
        }
    }
}
