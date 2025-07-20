# CargoTracking

A real-time shipment monitoring and notification system for logistics companies and end users.

## 🚀 Overview

CargoTracking is a distributed logistics application built with a **microservices architecture** using modern technologies. It enables users to create, track, and manage cargo shipments with live location updates and instant status change notifications.

This project is designed to demonstrate scalable architecture, event-driven communication, real-time data flow, and DevOps best practices.

---

## 🧰 Tech Stack

### Backend:
- **.NET 8** / **ASP.NET Core**
- **Entity Framework Core**
- **SignalR** (real-time communication)
- **RabbitMQ** (notification queueing)
- **Redis** (caching location data)
- **MS SQL Server** (data storage)
- **Docker & Docker Compose** (containerization)

### Frontend:
- **React.js**
- **React Leaflet** (interactive maps)
- **React Toastify** (notifications)
- **JWT Auth**
- **Axios / Context API**

---

## 📦 Features

- Create, update, and track cargo shipments
- Live location updates on a map
- Real-time delivery status notifications (via SignalR)
- Shipment history by user
- User roles (Sender, Receiver)
- Interactive Dashboard with statistics
- Event-based communication between microservices
- Dockerized development and deployment

---

## 📁 Microservices

| Service             | Description |
|---------------------|-------------|
| `ShipmentService`   | Manages shipment creation and updates |
| `TrackingService`   | Consumes Kafka messages, caches locations |
| `NotificationService` | Listens from RabbitMQ and sends real-time updates |
| `UI (React)`        | Provides user interface for shipment management |
| `API Gateway`       | (Planned) Reverse proxy for services |

---

## ⚙️ DevOps

- Dockerized services with shared network
- Kafka and RabbitMQ managed via containers
- Redis for caching recent coordinates
- Git-based version control
- CI/CD ready (GitHub Actions or Azure Pipelines compatible)

---

## 🔧 Setup Instructions

### Prerequisites:
- [.NET 8 SDK](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone the repository

```bash
git clone https://github.com/Andunie/CargoTracking.git
cd CargoTracking
2. Start services
docker-compose up --build
3. Start React frontend
cd CargoTrackingApp.UI
npm install
npm start
React UI runs at: http://localhost:3000, you should manage it in program.cs for all services.
