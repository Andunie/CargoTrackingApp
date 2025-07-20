using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrackingService.Migrations
{
    /// <inheritdoc />
    public partial class mig_ShipmentLocation_Latitude_Longitutde_Delayed_Delivered : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDelayed",
                table: "ShipmentLocations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDelivered",
                table: "ShipmentLocations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "ShipmentLocations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "ShipmentLocations",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDelayed",
                table: "ShipmentLocations");

            migrationBuilder.DropColumn(
                name: "IsDelivered",
                table: "ShipmentLocations");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "ShipmentLocations");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "ShipmentLocations");
        }
    }
}
