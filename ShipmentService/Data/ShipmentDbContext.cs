using Microsoft.EntityFrameworkCore;
using ShipmentService.Domain.Entities;
using ShipmentService.Domain.Entity;

namespace ShipmentService.Data
{
    public class ShipmentDbContext : DbContext
    {
        public ShipmentDbContext(DbContextOptions<ShipmentDbContext> options) : base(options) { }

        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<ShipmentLocationUpdate> ShipmentLocationUpdates { get; set; }
        public DbSet<CityLocation> CityLocations { get; set; }
        public DbSet<ShipmentStatusHistory> shipmentStatusHistories { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Shipment>()
                .HasMany(s => s.LocationUpdates)
                .WithOne()
                .HasForeignKey(lu => lu.ShipmentId);


            modelBuilder.Entity<CityLocation>().HasData(
                new CityLocation { Id = 1, CityName = "Adana", Latitude = 37.00167, Longitude = 35.32889 },
                new CityLocation { Id = 2, CityName = "Adıyaman", Latitude = 37.76483, Longitude = 38.27864 },
                new CityLocation { Id = 3, CityName = "Afyonkarahisar", Latitude = 38.76389, Longitude = 30.54028 },
                new CityLocation { Id = 4, CityName = "Ağrı", Latitude = 39.71944, Longitude = 43.05139 },
                new CityLocation { Id = 5, CityName = "Amasya", Latitude = 40.65222, Longitude = 35.83361 },
                new CityLocation { Id = 6, CityName = "Ankara", Latitude = 39.92077, Longitude = 32.85411 },
                new CityLocation { Id = 7, CityName = "Antalya", Latitude = 36.88414, Longitude = 30.70563 },
                new CityLocation { Id = 8, CityName = "Artvin", Latitude = 41.18283, Longitude = 41.81833 },
                new CityLocation { Id = 9, CityName = "Aydın", Latitude = 37.85607, Longitude = 27.84568 },
                new CityLocation { Id = 10, CityName = "Balıkesir", Latitude = 39.64944, Longitude = 27.88222 },
                new CityLocation { Id = 11, CityName = "Bilecik", Latitude = 40.15000, Longitude = 29.98333 },
                new CityLocation { Id = 12, CityName = "Bingöl", Latitude = 38.88472, Longitude = 40.49361 },
                new CityLocation { Id = 13, CityName = "Bitlis", Latitude = 38.40167, Longitude = 42.12306 },
                new CityLocation { Id = 14, CityName = "Bolu", Latitude = 40.73610, Longitude = 31.60972 },
                new CityLocation { Id = 15, CityName = "Burdur", Latitude = 37.72028, Longitude = 30.29028 },
                new CityLocation { Id = 16, CityName = "Bursa", Latitude = 40.19556, Longitude = 29.06083 },
                new CityLocation { Id = 17, CityName = "Çanakkale", Latitude = 40.15500, Longitude = 26.41444 },
                new CityLocation { Id = 18, CityName = "Çankırı", Latitude = 40.60139, Longitude = 33.61361 },
                new CityLocation { Id = 19, CityName = "Çorum", Latitude = 40.55000, Longitude = 34.95361 },
                new CityLocation { Id = 20, CityName = "Denizli", Latitude = 37.77652, Longitude = 29.08639 },
                new CityLocation { Id = 21, CityName = "Diyarbakır", Latitude = 37.91444, Longitude = 40.23056 },
                new CityLocation { Id = 22, CityName = "Edirne", Latitude = 41.67706, Longitude = 26.55572 },
                new CityLocation { Id = 23, CityName = "Elazığ", Latitude = 38.67417, Longitude = 39.22611 },
                new CityLocation { Id = 24, CityName = "Erzincan", Latitude = 39.75000, Longitude = 39.48333 },
                new CityLocation { Id = 25, CityName = "Erzurum", Latitude = 39.90444, Longitude = 41.26722 },
                new CityLocation { Id = 26, CityName = "Eskişehir", Latitude = 39.77667, Longitude = 30.52056 },
                new CityLocation { Id = 27, CityName = "Gaziantep", Latitude = 37.06617, Longitude = 37.38333 },
                new CityLocation { Id = 28, CityName = "Giresun", Latitude = 40.91250, Longitude = 38.38972 },
                new CityLocation { Id = 29, CityName = "Gümüşhane", Latitude = 40.46000, Longitude = 39.48250 },
                new CityLocation { Id = 30, CityName = "Hakkâri", Latitude = 37.57472, Longitude = 43.74056 },
                new CityLocation { Id = 31, CityName = "Hatay", Latitude = 36.20278, Longitude = 36.16028 },
                new CityLocation { Id = 32, CityName = "Isparta", Latitude = 37.76417, Longitude = 30.55667 },
                new CityLocation { Id = 33, CityName = "Mersin", Latitude = 36.81278, Longitude = 34.64167 },
                new CityLocation { Id = 34, CityName = "İstanbul", Latitude = 41.00527, Longitude = 28.97696 },
                new CityLocation { Id = 35, CityName = "İzmir", Latitude = 38.41885, Longitude = 27.12872 },
                new CityLocation { Id = 36, CityName = "Kars", Latitude = 40.61583, Longitude = 43.09722 },
                new CityLocation { Id = 37, CityName = "Kastamonu", Latitude = 41.37694, Longitude = 33.77528 },
                new CityLocation { Id = 38, CityName = "Kayseri", Latitude = 38.73122, Longitude = 35.47869 },
                new CityLocation { Id = 39, CityName = "Kırklareli", Latitude = 41.73333, Longitude = 27.21667 },
                new CityLocation { Id = 40, CityName = "Kırşehir", Latitude = 39.14222, Longitude = 34.16972 },
                new CityLocation { Id = 41, CityName = "Kocaeli", Latitude = 40.85333, Longitude = 29.88194 },
                new CityLocation { Id = 42, CityName = "Konya", Latitude = 37.86667, Longitude = 32.48333 },
                new CityLocation { Id = 43, CityName = "Kütahya", Latitude = 39.42444, Longitude = 29.98389 },
                new CityLocation { Id = 44, CityName = "Malatya", Latitude = 38.35556, Longitude = 38.30972 },
                new CityLocation { Id = 45, CityName = "Manisa", Latitude = 38.61944, Longitude = 27.42972 },
                new CityLocation { Id = 46, CityName = "Kahramanmaraş", Latitude = 37.57361, Longitude = 36.93722 },
                new CityLocation { Id = 47, CityName = "Mardin", Latitude = 37.31222, Longitude = 40.73500 },
                new CityLocation { Id = 48, CityName = "Muğla", Latitude = 37.21556, Longitude = 28.36389 },
                new CityLocation { Id = 49, CityName = "Muş", Latitude = 38.94667, Longitude = 41.75333 },
                new CityLocation { Id = 50, CityName = "Nevşehir", Latitude = 38.62472, Longitude = 34.71250 },
                new CityLocation { Id = 51, CityName = "Niğde", Latitude = 37.96611, Longitude = 34.68250 },
                new CityLocation { Id = 52, CityName = "Ordu", Latitude = 40.98389, Longitude = 37.87611 },
                new CityLocation { Id = 53, CityName = "Rize", Latitude = 41.02056, Longitude = 40.52361 },
                new CityLocation { Id = 54, CityName = "Sakarya", Latitude = 40.77667, Longitude = 30.40333 },
                new CityLocation { Id = 55, CityName = "Samsun", Latitude = 41.28694, Longitude = 36.33000 },
                new CityLocation { Id = 56, CityName = "Siirt", Latitude = 37.94472, Longitude = 41.93250 },
                new CityLocation { Id = 57, CityName = "Sinop", Latitude = 42.02361, Longitude = 35.15389 },
                new CityLocation { Id = 58, CityName = "Sivas", Latitude = 39.74778, Longitude = 37.01722 },
                new CityLocation { Id = 59, CityName = "Tekirdağ", Latitude = 40.98333, Longitude = 27.51667 },
                new CityLocation { Id = 60, CityName = "Tokat", Latitude = 40.31667, Longitude = 36.55389 },
                new CityLocation { Id = 61, CityName = "Trabzon", Latitude = 41.00278, Longitude = 39.73083 },
                new CityLocation { Id = 62, CityName = "Tunceli", Latitude = 39.10833, Longitude = 39.53806 },
                new CityLocation { Id = 63, CityName = "Şanlıurfa", Latitude = 37.16722, Longitude = 38.79528 },
                new CityLocation { Id = 64, CityName = "Uşak", Latitude = 38.67361, Longitude = 29.40389 },
                new CityLocation { Id = 65, CityName = "Van", Latitude = 38.48944, Longitude = 43.40889 },
                new CityLocation { Id = 66, CityName = "Yozgat", Latitude = 39.81806, Longitude = 34.81472 },
                new CityLocation { Id = 67, CityName = "Zonguldak", Latitude = 41.45639, Longitude = 31.79861 },
                new CityLocation { Id = 68, CityName = "Aksaray", Latitude = 38.36867, Longitude = 34.03669 },
                new CityLocation { Id = 69, CityName = "Bayburt", Latitude = 40.25583, Longitude = 40.22472 },
                new CityLocation { Id = 70, CityName = "Karaman", Latitude = 37.18131, Longitude = 33.21564 },
                new CityLocation { Id = 71, CityName = "Kırıkkale", Latitude = 39.84667, Longitude = 33.51528 },
                new CityLocation { Id = 72, CityName = "Batman", Latitude = 37.88236, Longitude = 41.13514 },
                new CityLocation { Id = 73, CityName = "Şırnak", Latitude = 37.41833, Longitude = 42.49139 },
                new CityLocation { Id = 74, CityName = "Bartın", Latitude = 41.58111, Longitude = 32.46111 },
                new CityLocation { Id = 75, CityName = "Ardahan", Latitude = 41.11055, Longitude = 42.70222 },
                new CityLocation { Id = 76, CityName = "Iğdır", Latitude = 39.91778, Longitude = 44.04556 },
                new CityLocation { Id = 77, CityName = "Yalova", Latitude = 40.65000, Longitude = 29.26667 },
                new CityLocation { Id = 78, CityName = "Karabük", Latitude = 41.20444, Longitude = 32.62139 },
                new CityLocation { Id = 79, CityName = "Kilis", Latitude = 36.71833, Longitude = 37.11972 },
                new CityLocation { Id = 80, CityName = "Osmaniye", Latitude = 37.07444, Longitude = 36.24639 },
                new CityLocation { Id = 81, CityName = "Düzce", Latitude = 40.84389, Longitude = 31.15611 }
            );

        }
    }
}
