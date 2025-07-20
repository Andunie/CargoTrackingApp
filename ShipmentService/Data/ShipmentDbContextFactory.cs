using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;

namespace ShipmentService.Data
{
    public class ShipmentDbContextFactory : IDesignTimeDbContextFactory<ShipmentDbContext>
    {
        public ShipmentDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ShipmentDbContext>();

            // Burada migration çalışırken doğrudan SQL Server connection string'i veriyoruz
            optionsBuilder.UseSqlServer("Server=localhost;Database=ShipmentDb;User=sa;Password=Your_password123;TrustServerCertificate=true;");

            return new ShipmentDbContext(optionsBuilder.Options);
        }
    }
}
