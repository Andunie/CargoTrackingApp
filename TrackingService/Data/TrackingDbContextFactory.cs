using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;

namespace TrackingService.Data
{
    public class TrackingDbContextFactory : IDesignTimeDbContextFactory<TrackingDbContext>
    {
        public TrackingDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TrackingDbContext>();

            // Burada migration çalışırken doğrudan SQL Server connection string'i veriyoruz
            optionsBuilder.UseSqlServer("Server=localhost;Database=TrackingDb;User=sa;Password=Your_password123;TrustServerCertificate=true;");

            return new TrackingDbContext(optionsBuilder.Options);
        }
    }
}
