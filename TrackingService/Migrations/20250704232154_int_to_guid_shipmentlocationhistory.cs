using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrackingService.Migrations
{
    /// <inheritdoc />
    public partial class int_to_guid_shipmentlocationhistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ShipmentLocationHistories");

            migrationBuilder.CreateTable(
                name: "ShipmentLocationHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ShipmentId = table.Column<int>(nullable: false),
                    Latitude = table.Column<double>(nullable: false),
                    Longitude = table.Column<double>(nullable: false),
                    UpdatedAt = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentLocationHistories", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
            name: "Id",
            table: "ShipmentLocationHistories",
            nullable: false,
            defaultValue: Guid.NewGuid());
        }
    }
}
