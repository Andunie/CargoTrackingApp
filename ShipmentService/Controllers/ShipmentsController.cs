using CargoTracking.Shared.Models.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShipmentService.Data;
using ShipmentService.Domain.Entity;
using ShipmentService.Dtos.ShipmentsDtos;
using ShipmentService.Services;
using System.Security.Claims;
using static System.Net.WebRequestMethods;

namespace ShipmentService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentsController : ControllerBase
    {
        private readonly ShipmentDbContext _context;
        private readonly IShipmentEventPublisher _eventPublisher;
        private readonly HttpClient _httpClient;

        public ShipmentsController(ShipmentDbContext context, IShipmentEventPublisher eventPublisher, HttpClient httpClient)
        {
            _context = context;
            _eventPublisher = eventPublisher;
            _httpClient = httpClient;
        }

        // GET: api/shipments
        [HttpGet]
        public async Task<ActionResult<List<ShipmentReadDto>>> GetShipments()
        {
            var shipments = await _context.Shipments.ToListAsync();

            var dtoList = shipments.Select(s => new ShipmentReadDto
            {
                Id = s.Id,
                TrackingNumber = s.TrackingNumber,
                Sender = s.Sender,
                SenderLatitude = s.SenderLatitude,
                SenderLongitude = s.SenderLongitude,
                Receiver = s.Receiver,
                ReceiverLatitude = s.ReceiverLatitude,
                ReceiverLongitude = s.ReceiverLongitude,
                Origin = s.Origin,
                Destination = s.Destination,
                CreatedAt = s.CreatedAt,
                Status = s.Status.ToString(),
                SenderUserId = s.SenderUserId,
                ReceiverUserId = s.ReceiverUserId
            }).ToList();

            return Ok(dtoList);
        }

        // [Authorize]
        [HttpGet("incoming")]
        public async Task<IActionResult> GetIncomingShipments(string userId)
        {
            var shipments = await _context.Shipments
                .Where(s => s.ReceiverUserId == userId)
                .ToListAsync();
            return Ok(shipments);
        }

        // GET: api/shipments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ShipmentReadDto>> GetShipment(int id)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
                return NotFound();

            var dto = new ShipmentReadDto
            {
                Id = shipment.Id,
                TrackingNumber = shipment.TrackingNumber,
                Sender = shipment.Sender,
                SenderLatitude = shipment.SenderLatitude,
                SenderLongitude = shipment.SenderLongitude,
                Receiver = shipment.Receiver,
                ReceiverLatitude = shipment.ReceiverLatitude,
                ReceiverLongitude = shipment.ReceiverLongitude,
                Origin = shipment.Origin,
                Destination = shipment.Destination,
                CreatedAt = shipment.CreatedAt,
                Status = shipment.Status.ToString(),
                SenderUserId = shipment.SenderUserId,
                ReceiverUserId = shipment.ReceiverUserId
            };

            return Ok(dto);
        }

        // POST: api/shipments
        [HttpPost]
        public async Task<ActionResult<ShipmentReadDto>> CreateShipment([FromBody] ShipmentCreateDto request)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("User ID claim not found in token.");
            }

            // Koordinat kontrolü
            if (request.SenderLatitude == 0 && request.SenderLongitude == 0)
            {
                ModelState.AddModelError("SenderCoordinates", "Sender coordinates cannot both be 0");
                return BadRequest(ModelState);
            }

            if (request.ReceiverLatitude == 0 && request.ReceiverLongitude == 0)
            {
                ModelState.AddModelError("ReceiverCoordinates", "Receiver coordinates cannot both be 0");
                return BadRequest(ModelState);
            }

            var shipment = new Shipment
            {
                TrackingNumber = request.TrackingNumber,
                Sender = request.Sender,
                SenderLatitude = request.SenderLatitude,
                SenderLongitude = request.SenderLongitude,
                Receiver = request.Receiver, // Alıcı adı doğrudan DTO'dan geliyor
                ReceiverLatitude = request.ReceiverLatitude,
                ReceiverLongitude = request.ReceiverLongitude,
                Origin = request.Origin,
                Destination = request.Destination,
                CreatedAt = DateTime.UtcNow,
                Status = ShipmentStatus.Created,
                SenderUserId = userIdClaim.Value,
                ReceiverUserId = request.ReceiverUserId, // Alıcı ID'si doğrudan DTO'dan geliyor
                LocationUpdates = new List<ShipmentLocationUpdate>()
            };

            _context.Shipments.Add(shipment);
            await _context.SaveChangesAsync();

            var resultDto = new ShipmentReadDto
            {
                Id = shipment.Id,
                TrackingNumber = shipment.TrackingNumber,
                Sender = shipment.Sender,
                SenderLatitude = shipment.SenderLatitude,
                SenderLongitude = shipment.SenderLongitude,
                Receiver = shipment.Receiver,
                ReceiverLatitude = shipment.ReceiverLatitude,
                ReceiverLongitude = shipment.ReceiverLongitude,
                Origin = shipment.Origin,
                Destination = shipment.Destination,
                CreatedAt = shipment.CreatedAt,
                Status = shipment.Status.ToString(),
                SenderUserId = shipment.SenderUserId,
                ReceiverUserId = shipment.ReceiverUserId,
            };

            _eventPublisher.PublishShipmentStatusChanged(shipment.ReceiverUserId, shipment.Id, shipment.Status.ToString());

            return CreatedAtAction(nameof(GetShipment), new { id = shipment.Id }, resultDto);
        }

        // PUT: api/shipments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShipment(int id, ShipmentUpdateDto request)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
                return NotFound();

            shipment.TrackingNumber = request.TrackingNumber;
            shipment.Sender = request.Sender;
            shipment.Receiver = request.Receiver;
            shipment.Origin = request.Origin;
            shipment.Destination = request.Destination;
            shipment.SenderLatitude = request.SenderLatitude;
            shipment.SenderLongitude = request.SenderLongitude;
            shipment.ReceiverLatitude = request.ReceiverLatitude;
            shipment.ReceiverLongitude = request.ReceiverLongitude;
            shipment.Status = Enum.Parse<ShipmentStatus>(request.Status);
            shipment.ReceiverUserId = request.ReceiverUserId; // EKSİK SATIR BURAYA EKLENDİ

            await _context.SaveChangesAsync();
            
            _eventPublisher.PublishShipmentStatusChanged(shipment.ReceiverUserId, shipment.Id, shipment.Status.ToString());

            return NoContent();
        }

        // DELETE: api/shipments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShipment(int id)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
                return NotFound();

            _context.Shipments.Remove(shipment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Status güncellemesi için yeni endpoint
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateShipmentStatus(int id, [FromBody] string status)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
                return NotFound();

            if (!Enum.TryParse<ShipmentStatus>(status, out var newStatus))
                return BadRequest("Invalid status value");

            shipment.Status = newStatus;
            await _context.SaveChangesAsync();
            
            _eventPublisher.PublishShipmentStatusChanged(shipment.ReceiverUserId, shipment.Id, shipment.Status.ToString());

            return NoContent();
        }

        [HttpGet("GetShipmentsByUserId")]
        public async Task<ActionResult<IEnumerable<ShipmentReadDto>>> GetShipmentsByUserId(int userId)
        {
            var shipments = await _context.Shipments
                .Where(s => s.SenderUserId == userId.ToString())
                .ToListAsync();

            if (!shipments.Any())
                return NotFound("Bu kullanıcıya ait gönderi bulunamadı.");

            var shipmentDtos = shipments.Select(s => new ShipmentReadDto
            {
                Id = s.Id,
                TrackingNumber = s.TrackingNumber,
                Sender = s.Sender,
                SenderLatitude = s.SenderLatitude,
                SenderLongitude = s.SenderLongitude,
                Receiver = s.Receiver,
                ReceiverLatitude = s.ReceiverLatitude,
                ReceiverLongitude = s.ReceiverLongitude,
                Origin = s.Origin,
                Destination = s.Destination,
                CreatedAt = s.CreatedAt,
                Status = s.Status.ToString(),
                SenderUserId = s.SenderUserId,
                ReceiverUserId = s.ReceiverUserId,
            }).ToList();

            return Ok(shipmentDtos);
        }
    }
}