using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanMalderStudio.CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientProjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientProjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProjectType = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Deadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LiveUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreviewUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GitHubRepoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientProjects_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientProjects_ClientId",
                table: "ClientProjects",
                column: "ClientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientProjects");
        }
    }
}
