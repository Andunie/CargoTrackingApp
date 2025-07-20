using Microsoft.EntityFrameworkCore;
using TrackingService.Domain.Entities;

namespace TrackingService.Data
{
    public class TrackingDbContext : DbContext
    {
        public TrackingDbContext(DbContextOptions<TrackingDbContext> options) : base(options) {}

        public DbSet<ShipmentLocation> ShipmentLocations { get; set; }
        public DbSet<ShipmentLocationHistory> ShipmentLocationHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ShipmentLocation>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.ShipmentId)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.CurrentLocation)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Timestamp)
                    .IsRequired();

                entity.ToTable("ShipmentLocations");
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
