using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Net.Http.Headers;
using TrackingService.Data;
using TrackingService.Hubs;
using TrackingService.Services;
using TrackingService.Services.Redis;

var builder = WebApplication.CreateBuilder(args);

// --- Veritaban� Servisi ---
builder.Services.AddDbContext<TrackingDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TrackingDb")));

// --- Redis ve Arkaplan Servisleri ---
var redisConfiguration = builder.Configuration.GetValue<string>("Redis:Configuration") ?? "redis:6379";

if (!builder.Environment.IsEnvironment("Migration"))
{
    builder.Services.AddSingleton<IConnectionMultiplexer>(
        ConnectionMultiplexer.Connect(redisConfiguration));

    builder.Services.AddHostedService<RedisSubscriber>();
    builder.Services.AddHostedService<ShipmentEventConsumer>();
    builder.Services.AddSingleton<LocationCacheService>();
}

// --- SignalR Servisi (Redis Backplane ile) ---
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConfiguration, options =>
    {
        options.Configuration.ChannelPrefix = "SignalR-Tracking";
    });

// --- HttpClient Servisleri (BaseAddress ile) ---
builder.Services.AddHttpClient<IShipmentApiClient, ShipmentApiClient>(client =>
{
    client.BaseAddress = new Uri("http://shipment-api:80/"); // Docker servis ad� ve port
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
});

builder.Services.AddHttpClient<IShipmentStatusUpdaterService, ShipmentStatusUpdaterService>(client =>
{
    client.BaseAddress = new Uri("http://shipment-api:80/"); // Docker servis ad� ve port
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
});

builder.Services.AddHttpClient<IShipmentHistoryApiClient, ShipmentHistoryApiClient>(client =>
{
    client.BaseAddress = new Uri("http://shipment-api:80/");
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
});

// --- Diğer Servisler ---
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IShipmentEventPublisher, RedisShipmentEventPublisher>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CORS Politikası ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// --- HTTP Request Pipeline ---
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Docker'da sorun ��kabilir, opsiyonel

app.UseAuthorization();

app.MapControllers();

// SignalR hub'�n� CORS politikas� ile e�le�tiriyoruz
app.MapHub<TrackingHub>("/trackingHub").RequireCors("AllowFrontend");

app.Run();