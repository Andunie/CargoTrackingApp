using Microsoft.Extensions.Logging;

namespace TrackingService.Services
{
    public class GeoHelper
    {
        private static readonly ILogger<GeoHelper> _logger;

        static GeoHelper()
        {
            var loggerFactory = LoggerFactory.Create(builder =>
            {
                builder.AddConsole();
            });
            _logger = loggerFactory.CreateLogger<GeoHelper>();
        }

        public static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            _logger.LogInformation($"Mesafe hesaplanıyor:");
            _logger.LogInformation($"Nokta 1: ({lat1}, {lon1})");
            _logger.LogInformation($"Nokta 2: ({lat2}, {lon2})");

            var R = 6371e3; // metre
            var φ1 = lat1 * Math.PI / 180;
            var φ2 = lat2 * Math.PI / 180;
            var Δφ = (lat2 - lat1) * Math.PI / 180;
            var Δλ = (lon2 - lon1) * Math.PI / 180;

            var a = Math.Sin(Δφ/2) * Math.Sin(Δφ/2) +
                    Math.Cos(φ1) * Math.Cos(φ2) *
                    Math.Sin(Δλ/2) * Math.Sin(Δλ/2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1-a));

            var d = R * c; // metre cinsinden
            var km = d / 1000; // kilometre

            _logger.LogInformation($"Hesaplanan mesafe: {km:F2} km");
            return km;
        }
    }
}
