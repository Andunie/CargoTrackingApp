﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ShipmentService.Data;

#nullable disable

namespace ShipmentService.Migrations
{
    [DbContext(typeof(ShipmentDbContext))]
    [Migration("20250718222515_AddShipmetStatusHistory")]
    partial class AddShipmetStatusHistory
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.17")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("ShipmentService.Domain.Entities.CityLocation", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("CityName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("Latitude")
                        .HasColumnType("float");

                    b.Property<double>("Longitude")
                        .HasColumnType("float");

                    b.HasKey("Id");

                    b.ToTable("CityLocations");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            CityName = "Adana",
                            Latitude = 37.001669999999997,
                            Longitude = 35.328890000000001
                        },
                        new
                        {
                            Id = 2,
                            CityName = "Adıyaman",
                            Latitude = 37.764830000000003,
                            Longitude = 38.278640000000003
                        },
                        new
                        {
                            Id = 3,
                            CityName = "Afyonkarahisar",
                            Latitude = 38.763890000000004,
                            Longitude = 30.540279999999999
                        },
                        new
                        {
                            Id = 4,
                            CityName = "Ağrı",
                            Latitude = 39.719439999999999,
                            Longitude = 43.051389999999998
                        },
                        new
                        {
                            Id = 5,
                            CityName = "Amasya",
                            Latitude = 40.65222,
                            Longitude = 35.83361
                        },
                        new
                        {
                            Id = 6,
                            CityName = "Ankara",
                            Latitude = 39.920769999999997,
                            Longitude = 32.854109999999999
                        },
                        new
                        {
                            Id = 7,
                            CityName = "Antalya",
                            Latitude = 36.884140000000002,
                            Longitude = 30.705629999999999
                        },
                        new
                        {
                            Id = 8,
                            CityName = "Artvin",
                            Latitude = 41.182830000000003,
                            Longitude = 41.818330000000003
                        },
                        new
                        {
                            Id = 9,
                            CityName = "Aydın",
                            Latitude = 37.856070000000003,
                            Longitude = 27.845680000000002
                        },
                        new
                        {
                            Id = 10,
                            CityName = "Balıkesir",
                            Latitude = 39.649439999999998,
                            Longitude = 27.88222
                        },
                        new
                        {
                            Id = 11,
                            CityName = "Bilecik",
                            Latitude = 40.149999999999999,
                            Longitude = 29.983329999999999
                        },
                        new
                        {
                            Id = 12,
                            CityName = "Bingöl",
                            Latitude = 38.884720000000002,
                            Longitude = 40.493609999999997
                        },
                        new
                        {
                            Id = 13,
                            CityName = "Bitlis",
                            Latitude = 38.401670000000003,
                            Longitude = 42.123060000000002
                        },
                        new
                        {
                            Id = 14,
                            CityName = "Bolu",
                            Latitude = 40.7361,
                            Longitude = 31.609719999999999
                        },
                        new
                        {
                            Id = 15,
                            CityName = "Burdur",
                            Latitude = 37.720280000000002,
                            Longitude = 30.290279999999999
                        },
                        new
                        {
                            Id = 16,
                            CityName = "Bursa",
                            Latitude = 40.19556,
                            Longitude = 29.060829999999999
                        },
                        new
                        {
                            Id = 17,
                            CityName = "Çanakkale",
                            Latitude = 40.155000000000001,
                            Longitude = 26.414439999999999
                        },
                        new
                        {
                            Id = 18,
                            CityName = "Çankırı",
                            Latitude = 40.601390000000002,
                            Longitude = 33.613610000000001
                        },
                        new
                        {
                            Id = 19,
                            CityName = "Çorum",
                            Latitude = 40.549999999999997,
                            Longitude = 34.953609999999998
                        },
                        new
                        {
                            Id = 20,
                            CityName = "Denizli",
                            Latitude = 37.776519999999998,
                            Longitude = 29.086390000000002
                        },
                        new
                        {
                            Id = 21,
                            CityName = "Diyarbakır",
                            Latitude = 37.914439999999999,
                            Longitude = 40.230559999999997
                        },
                        new
                        {
                            Id = 22,
                            CityName = "Edirne",
                            Latitude = 41.677059999999997,
                            Longitude = 26.555720000000001
                        },
                        new
                        {
                            Id = 23,
                            CityName = "Elazığ",
                            Latitude = 38.674169999999997,
                            Longitude = 39.226109999999998
                        },
                        new
                        {
                            Id = 24,
                            CityName = "Erzincan",
                            Latitude = 39.75,
                            Longitude = 39.483330000000002
                        },
                        new
                        {
                            Id = 25,
                            CityName = "Erzurum",
                            Latitude = 39.904440000000001,
                            Longitude = 41.267220000000002
                        },
                        new
                        {
                            Id = 26,
                            CityName = "Eskişehir",
                            Latitude = 39.776670000000003,
                            Longitude = 30.52056
                        },
                        new
                        {
                            Id = 27,
                            CityName = "Gaziantep",
                            Latitude = 37.06617,
                            Longitude = 37.383330000000001
                        },
                        new
                        {
                            Id = 28,
                            CityName = "Giresun",
                            Latitude = 40.912500000000001,
                            Longitude = 38.389719999999997
                        },
                        new
                        {
                            Id = 29,
                            CityName = "Gümüşhane",
                            Latitude = 40.460000000000001,
                            Longitude = 39.482500000000002
                        },
                        new
                        {
                            Id = 30,
                            CityName = "Hakkâri",
                            Latitude = 37.574719999999999,
                            Longitude = 43.740560000000002
                        },
                        new
                        {
                            Id = 31,
                            CityName = "Hatay",
                            Latitude = 36.202779999999997,
                            Longitude = 36.16028
                        },
                        new
                        {
                            Id = 32,
                            CityName = "Isparta",
                            Latitude = 37.76417,
                            Longitude = 30.55667
                        },
                        new
                        {
                            Id = 33,
                            CityName = "Mersin",
                            Latitude = 36.812779999999997,
                            Longitude = 34.641669999999998
                        },
                        new
                        {
                            Id = 34,
                            CityName = "İstanbul",
                            Latitude = 41.005270000000003,
                            Longitude = 28.976959999999998
                        },
                        new
                        {
                            Id = 35,
                            CityName = "İzmir",
                            Latitude = 38.418849999999999,
                            Longitude = 27.128720000000001
                        },
                        new
                        {
                            Id = 36,
                            CityName = "Kars",
                            Latitude = 40.615830000000003,
                            Longitude = 43.09722
                        },
                        new
                        {
                            Id = 37,
                            CityName = "Kastamonu",
                            Latitude = 41.376939999999998,
                            Longitude = 33.775280000000002
                        },
                        new
                        {
                            Id = 38,
                            CityName = "Kayseri",
                            Latitude = 38.73122,
                            Longitude = 35.47869
                        },
                        new
                        {
                            Id = 39,
                            CityName = "Kırklareli",
                            Latitude = 41.733330000000002,
                            Longitude = 27.216670000000001
                        },
                        new
                        {
                            Id = 40,
                            CityName = "Kırşehir",
                            Latitude = 39.142220000000002,
                            Longitude = 34.169719999999998
                        },
                        new
                        {
                            Id = 41,
                            CityName = "Kocaeli",
                            Latitude = 40.85333,
                            Longitude = 29.88194
                        },
                        new
                        {
                            Id = 42,
                            CityName = "Konya",
                            Latitude = 37.866669999999999,
                            Longitude = 32.483330000000002
                        },
                        new
                        {
                            Id = 43,
                            CityName = "Kütahya",
                            Latitude = 39.424439999999997,
                            Longitude = 29.983889999999999
                        },
                        new
                        {
                            Id = 44,
                            CityName = "Malatya",
                            Latitude = 38.355559999999997,
                            Longitude = 38.309719999999999
                        },
                        new
                        {
                            Id = 45,
                            CityName = "Manisa",
                            Latitude = 38.619439999999997,
                            Longitude = 27.42972
                        },
                        new
                        {
                            Id = 46,
                            CityName = "Kahramanmaraş",
                            Latitude = 37.573610000000002,
                            Longitude = 36.937220000000003
                        },
                        new
                        {
                            Id = 47,
                            CityName = "Mardin",
                            Latitude = 37.312220000000003,
                            Longitude = 40.734999999999999
                        },
                        new
                        {
                            Id = 48,
                            CityName = "Muğla",
                            Latitude = 37.215560000000004,
                            Longitude = 28.363890000000001
                        },
                        new
                        {
                            Id = 49,
                            CityName = "Muş",
                            Latitude = 38.946669999999997,
                            Longitude = 41.753329999999998
                        },
                        new
                        {
                            Id = 50,
                            CityName = "Nevşehir",
                            Latitude = 38.624720000000003,
                            Longitude = 34.712499999999999
                        },
                        new
                        {
                            Id = 51,
                            CityName = "Niğde",
                            Latitude = 37.96611,
                            Longitude = 34.682499999999997
                        },
                        new
                        {
                            Id = 52,
                            CityName = "Ordu",
                            Latitude = 40.983890000000002,
                            Longitude = 37.876109999999997
                        },
                        new
                        {
                            Id = 53,
                            CityName = "Rize",
                            Latitude = 41.020560000000003,
                            Longitude = 40.523609999999998
                        },
                        new
                        {
                            Id = 54,
                            CityName = "Sakarya",
                            Latitude = 40.776670000000003,
                            Longitude = 30.40333
                        },
                        new
                        {
                            Id = 55,
                            CityName = "Samsun",
                            Latitude = 41.286940000000001,
                            Longitude = 36.329999999999998
                        },
                        new
                        {
                            Id = 56,
                            CityName = "Siirt",
                            Latitude = 37.944719999999997,
                            Longitude = 41.932499999999997
                        },
                        new
                        {
                            Id = 57,
                            CityName = "Sinop",
                            Latitude = 42.023609999999998,
                            Longitude = 35.153889999999997
                        },
                        new
                        {
                            Id = 58,
                            CityName = "Sivas",
                            Latitude = 39.747779999999999,
                            Longitude = 37.017220000000002
                        },
                        new
                        {
                            Id = 59,
                            CityName = "Tekirdağ",
                            Latitude = 40.983330000000002,
                            Longitude = 27.516670000000001
                        },
                        new
                        {
                            Id = 60,
                            CityName = "Tokat",
                            Latitude = 40.316670000000002,
                            Longitude = 36.553890000000003
                        },
                        new
                        {
                            Id = 61,
                            CityName = "Trabzon",
                            Latitude = 41.002780000000001,
                            Longitude = 39.730829999999997
                        },
                        new
                        {
                            Id = 62,
                            CityName = "Tunceli",
                            Latitude = 39.108330000000002,
                            Longitude = 39.538060000000002
                        },
                        new
                        {
                            Id = 63,
                            CityName = "Şanlıurfa",
                            Latitude = 37.16722,
                            Longitude = 38.795279999999998
                        },
                        new
                        {
                            Id = 64,
                            CityName = "Uşak",
                            Latitude = 38.673609999999996,
                            Longitude = 29.403890000000001
                        },
                        new
                        {
                            Id = 65,
                            CityName = "Van",
                            Latitude = 38.489440000000002,
                            Longitude = 43.40889
                        },
                        new
                        {
                            Id = 66,
                            CityName = "Yozgat",
                            Latitude = 39.818060000000003,
                            Longitude = 34.814720000000001
                        },
                        new
                        {
                            Id = 67,
                            CityName = "Zonguldak",
                            Latitude = 41.456389999999999,
                            Longitude = 31.79861
                        },
                        new
                        {
                            Id = 68,
                            CityName = "Aksaray",
                            Latitude = 38.368670000000002,
                            Longitude = 34.03669
                        },
                        new
                        {
                            Id = 69,
                            CityName = "Bayburt",
                            Latitude = 40.255830000000003,
                            Longitude = 40.224719999999998
                        },
                        new
                        {
                            Id = 70,
                            CityName = "Karaman",
                            Latitude = 37.181310000000003,
                            Longitude = 33.21564
                        },
                        new
                        {
                            Id = 71,
                            CityName = "Kırıkkale",
                            Latitude = 39.846670000000003,
                            Longitude = 33.515279999999997
                        },
                        new
                        {
                            Id = 72,
                            CityName = "Batman",
                            Latitude = 37.882359999999998,
                            Longitude = 41.13514
                        },
                        new
                        {
                            Id = 73,
                            CityName = "Şırnak",
                            Latitude = 37.418329999999997,
                            Longitude = 42.491390000000003
                        },
                        new
                        {
                            Id = 74,
                            CityName = "Bartın",
                            Latitude = 41.581110000000002,
                            Longitude = 32.461109999999998
                        },
                        new
                        {
                            Id = 75,
                            CityName = "Ardahan",
                            Latitude = 41.110550000000003,
                            Longitude = 42.702219999999997
                        },
                        new
                        {
                            Id = 76,
                            CityName = "Iğdır",
                            Latitude = 39.91778,
                            Longitude = 44.045560000000002
                        },
                        new
                        {
                            Id = 77,
                            CityName = "Yalova",
                            Latitude = 40.649999999999999,
                            Longitude = 29.266670000000001
                        },
                        new
                        {
                            Id = 78,
                            CityName = "Karabük",
                            Latitude = 41.204439999999998,
                            Longitude = 32.621389999999998
                        },
                        new
                        {
                            Id = 79,
                            CityName = "Kilis",
                            Latitude = 36.718330000000002,
                            Longitude = 37.119720000000001
                        },
                        new
                        {
                            Id = 80,
                            CityName = "Osmaniye",
                            Latitude = 37.074440000000003,
                            Longitude = 36.246389999999998
                        },
                        new
                        {
                            Id = 81,
                            CityName = "Düzce",
                            Latitude = 40.843890000000002,
                            Longitude = 31.156110000000002
                        });
                });

            modelBuilder.Entity("ShipmentService.Domain.Entities.ShipmentStatusHistory", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("ChangedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("ShipmentId")
                        .HasColumnType("int");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("shipmentStatusHistories");
                });

            modelBuilder.Entity("ShipmentService.Domain.Entity.Shipment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Destination")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Origin")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Receiver")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("ReceiverLatitude")
                        .HasColumnType("float");

                    b.Property<double>("ReceiverLongitude")
                        .HasColumnType("float");

                    b.Property<string>("ReceiverUserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Sender")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("SenderLatitude")
                        .HasColumnType("float");

                    b.Property<double>("SenderLongitude")
                        .HasColumnType("float");

                    b.Property<string>("SenderUserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("TrackingNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.ToTable("Shipments");
                });

            modelBuilder.Entity("ShipmentService.Domain.Entity.ShipmentLocationUpdate", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<double>("Latitude")
                        .HasColumnType("float");

                    b.Property<double>("Longitude")
                        .HasColumnType("float");

                    b.Property<int>("ShipmentId")
                        .HasColumnType("int");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.HasIndex("ShipmentId");

                    b.ToTable("ShipmentLocationUpdates");
                });

            modelBuilder.Entity("ShipmentService.Domain.Entity.ShipmentLocationUpdate", b =>
                {
                    b.HasOne("ShipmentService.Domain.Entity.Shipment", null)
                        .WithMany("LocationUpdates")
                        .HasForeignKey("ShipmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("ShipmentService.Domain.Entity.Shipment", b =>
                {
                    b.Navigation("LocationUpdates");
                });
#pragma warning restore 612, 618
        }
    }
}
