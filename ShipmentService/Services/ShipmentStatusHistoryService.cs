using Microsoft.EntityFrameworkCore;
using ShipmentService.Data;
using ShipmentService.Domain.Entities;
using ShipmentService.Dtos.ShipmentsDtos;

namespace ShipmentService.Services
{
    public class ShipmentStatusHistoryService : IShipmentStatusHistoryService
    {
        private readonly ShipmentDbContext _context;

        public ShipmentStatusHistoryService(ShipmentDbContext context)
        {
            _context = context;
        }

        public async Task AddHistoryAsync(CreateShipmentStatusHistoryDto dto)
        {
            var history = new ShipmentStatusHistory
            {
                ShipmentId = dto.ShipmentId,
                Status = dto.Status
            };

            _context.shipmentStatusHistories.Add(history);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ShipmentStatusHistory>> GetHistoryByShipmentIdAsync(int shipmentId)
        {
            return await _context.shipmentStatusHistories
            .Where(h => h.ShipmentId == shipmentId)
            .OrderBy(h => h.ChangedAt)
            .ToListAsync();
        }
    }
}
