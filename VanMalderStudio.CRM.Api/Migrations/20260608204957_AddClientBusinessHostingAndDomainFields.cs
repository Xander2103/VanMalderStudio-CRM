using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanMalderStudio.CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientBusinessHostingAndDomainFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AmountPaid",
                table: "Clients",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DomainManagementUrl",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DomainName",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DomainRegistrar",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DomainRenewalDate",
                table: "Clients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HostingManagementUrl",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HostingPlan",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HostingProvider",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "HostingRenewalDate",
                table: "Clients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyMaintenanceFee",
                table: "Clients",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServerIpAddress",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SshUsername",
                table: "Clients",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WebsitePrice",
                table: "Clients",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmountPaid",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DomainManagementUrl",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DomainName",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DomainRegistrar",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DomainRenewalDate",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "HostingManagementUrl",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "HostingPlan",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "HostingProvider",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "HostingRenewalDate",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "MonthlyMaintenanceFee",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "ServerIpAddress",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "SshUsername",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "WebsitePrice",
                table: "Clients");
        }
    }
}
