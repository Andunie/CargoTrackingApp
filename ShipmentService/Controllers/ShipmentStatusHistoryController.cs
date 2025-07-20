using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShipmentService.Dtos.ShipmentsDtos;
using ShipmentService.Services;

namespace ShipmentService.Controllers
{
    [Route("api/shipments/status-history")]
    [ApiController]
    public class ShipmentStatusHistoryController : ControllerBase
    {
        private readonly IShipmentStatusHistoryService _shipmentStatusHistoryService;

        public ShipmentStatusHistoryController(IShipmentStatusHistoryService shipmentStatusHistoryService)
        {
            _shipmentStatusHistoryService = shipmentStatusHistoryService;
        }

        [HttpPost]
        public async Task<IActionResult> AddHistory([FromBody] CreateShipmentStatusHistoryDto dto)
        {
            await _shipmentStatusHistoryService.AddHistoryAsync(dto);
            return Ok();
        }

        [HttpGet("{shipmentId}")]
        public async Task<IActionResult> GetHistory(int shipmentId)
        {
            var history = await _shipmentStatusHistoryService.GetHistoryByShipmentIdAsync(shipmentId);
            return Ok(history);
        }
    }
}
