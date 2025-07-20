FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared project and main project
COPY ["CargoTracking.Shared/CargoTracking.Shared.csproj", "CargoTracking.Shared/"]
COPY ["ShipmentService/ShipmentService.csproj", "ShipmentService/"]

# Restore NuGet packages
RUN dotnet restore "ShipmentService/ShipmentService.csproj"

# Copy the rest of the code
COPY . .

# Build the project
WORKDIR "/src/ShipmentService"
RUN dotnet build "ShipmentService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ShipmentService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ShipmentService.dll"]