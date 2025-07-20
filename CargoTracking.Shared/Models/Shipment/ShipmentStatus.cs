using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CargoTracking.Shared.Models.Shipment
{
    public enum ShipmentStatus
    {
        Created,
        InTransit,
        Delivered,
        Cancelled
    }
}
