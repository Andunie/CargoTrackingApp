using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShipmentService.Data;
using ShipmentService.Domain.Entity;
using ShipmentService.Dtos.ShipmentLocationsDtos;

namespace ShipmentService.Controllers
{
    [Route("api/shipments/{shipmentId}/locations")]
    [ApiController]
    public class ShipmentLocationsController : ControllerBase
    {
        private readonly ShipmentDbContext _context;

        public ShipmentLocationsController(ShipmentDbContext context)
        {
            _context = context;
        }

        // GET: api/shipments/{shipmentId}/locations
        [HttpGet]
        public async Task<ActionResult<List<ShipmentLocationReadDto>>> GetLocations(int shipmentId)
        {
            var shipmentExists = await _context.Shipments.AnyAsync(s => s.Id == shipmentId);
            if (!shipmentExists)
                return NotFound($"Shipment with Id {shipmentId} not found.");

            var locations = await _context.ShipmentLocationUpdates
                                .Where(l => l.ShipmentId == shipmentId)
                                .OrderByDescending(l => l.Timestamp)
                                .ToListAsync();

            var dtoList = locations.Select(l => new ShipmentLocationReadDto
            {
                Id = l.Id,
                ShipmentId = l.ShipmentId,
                Latitude = l.Latitude,
                Longitude = l.Longitude,
                Timestamp = l.Timestamp
            }).ToList();

            return Ok(dtoList);
        }

        // POST: api/shipments/{shipmentId}/locations
        [HttpPost]
        public async Task<ActionResult<ShipmentLocationReadDto>> AddLocation(int shipmentId, ShipmentLocationCreateDto dto)
        {
            var shipment = await _context.Shipments.FindAsync(shipmentId);
            if (shipment == null)
                return NotFound($"Shipment with Id {shipmentId} not found.");

            var locationUpdate = new ShipmentLocationUpdate
            {
                ShipmentId = shipmentId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Timestamp = dto.Timestamp ?? DateTime.UtcNow
            };

            _context.ShipmentLocationUpdates.Add(locationUpdate);

            // Teslimat kontrolü için:
            var cityLocation = await _context.CityLocations
                .FirstOrDefaultAsync(c => c.CityName.ToLower() == shipment.Destination.ToLower());

            if (cityLocation != null)
            {
                var distance = GeoHelper.CalculateDistanceKm(
                    locationUpdate.Latitude,
                    locationUpdate.Longitude,
                    cityLocation.Latitude,
                    cityLocation.Longitude);

                if (distance <= 5.0 && shipment.Status != ShipmentStatus.Delivered)
                {
                    shipment.Status = ShipmentStatus.Delivered;
                    shipment.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            var resultDto = new ShipmentLocationReadDto
            {
                Id = locationUpdate.Id,
                ShipmentId = shipmentId,
                Latitude = locationUpdate.Latitude,
                Longitude = locationUpdate.Longitude,
                Timestamp = locationUpdate.Timestamp
            };

            return CreatedAtAction(nameof(GetLocations), new { shipmentId = shipmentId }, resultDto);
        }


        // DELETE: api/shipments/{shipmentId}/locations/{locationId}
        [HttpDelete("{locationId}")]
        public async Task<IActionResult> DeleteLocation(int shipmentId, int locationId)
        {
            var location = await _context.ShipmentLocationUpdates
                .FirstOrDefaultAsync(l => l.Id == locationId && l.ShipmentId == shipmentId);

            if (location == null)
                return NotFound($"Location with Id {locationId} for Shipment {shipmentId} not found.");

            _context.ShipmentLocationUpdates.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("/api/shipments/{shipmentId}/check-delivered")]
        public async Task<IActionResult> CheckDelivered(int shipmentId)
        {
            var shipment = await _context.Shipments
                .Include(s => s.LocationUpdates)
                .FirstOrDefaultAsync(s => s.Id == shipmentId);

            if (shipment == null)
                return NotFound($"Shipment with Id {shipmentId} not found.");

            var cityLocation = await _context.CityLocations
                .FirstOrDefaultAsync(c => c.CityName.ToLower() == shipment.Destination.ToLower());

            if (cityLocation == null)
                return BadRequest($"Destination city coordinates not found for {shipment.Destination}");

            foreach (var loc in shipment.LocationUpdates)
            {
                var distance = GeoHelper.CalculateDistanceKm(loc.Latitude, loc.Longitude, cityLocation.Latitude, cityLocation.Longitude);

                if (distance <= 5.0) // 5 km yakınsa
                {
                    // Durumu güncelle
                    shipment.Status = ShipmentStatus.Delivered;
                    shipment.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    return Ok(new { delivered = true, distanceKm = distance });
                }
            }

            return Ok(new { delivered = false });
        }


        public static class GeoHelper
        {
            public static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
            {
                const double R = 6371; // Dünya yarıçapı km
                var dLat = (lat2 - lat1) * Math.PI / 180.0;
                var dLon = (lon2 - lon1) * Math.PI / 180.0;

                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                return R * c;
            }
        }

    }
}