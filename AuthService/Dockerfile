# Base image - runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Build image - sdk
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared project and main project
COPY ["CargoTracking.Shared/CargoTracking.Shared.csproj", "CargoTracking.Shared/"]
COPY ["AuthService/AuthService.csproj", "AuthService/"]

# Restore NuGet packages
RUN dotnet restore "AuthService/AuthService.csproj"

# Copy the rest of the code
COPY . .

# Build the project
WORKDIR "/src/AuthService"
RUN dotnet build "AuthService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AuthService.csproj" -c Release -o /app/publish

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AuthService.dll"]
