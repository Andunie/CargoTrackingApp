namespace ShipmentService.Domain.Entities
{
    public class CityLocation
    {
        public int Id { get; set; }
        public string CityName { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
