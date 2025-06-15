# Real-Time Chat Application with Authentication & Sentiment Analysis

A modern, secure real-time chat application built with ASP.NET Core, SignalR, React, and JWT authentication. Features automatic sentiment detection, user management, and a beautiful modern UI.

## 🚀 Features

- **🔐 JWT Authentication** - Secure user registration and login
- **⚡ Real-time messaging** using SignalR with authentication
- **🧠 Sentiment analysis** for each message (Positive, Negative, Neutral)
- **💾 Message persistence** with Entity Framework Core
- **🔗 RESTful API** for message retrieval and statistics
- **🎨 Modern React UI** with TypeScript and styled-components
- **📱 Responsive design** optimized for all devices
- **🏗️ Clean Architecture** with separated concerns
- **🌐 CORS support** for cross-origin requests

## 🏗️ Architecture

The application follows Clean Architecture principles with the following structure:

```
ChatApp/
├── ChatApp.API/               # Web API and SignalR Hub with JWT auth
├── ChatApp.Core/              # Domain Models and DTOs
├── ChatApp.Infrastructure/    # Data Access, Services & Authentication
├── ChatApp.Tests/             # Unit Tests
└── chatapp-frontend/          # React TypeScript Frontend
    ├── src/
    │   ├── components/        # React Components
    │   ├── contexts/          # React Context (Auth & Chat)
    │   ├── services/          # API & SignalR Services
    │   ├── types/             # TypeScript Interfaces
    │   └── pages/             # Route Pages
    └── public/
```

### Technology Stack

**Backend:**
- ASP.NET Core 8.0
- SignalR for real-time communication
- Entity Framework Core with SQL Server
- JWT Bearer Authentication
- Custom sentiment analysis (extensible to Azure Cognitive Services)

**Frontend:**
- React 18 with TypeScript
- SignalR Client with JWT authentication
- Styled Components for modern styling
- React Router for navigation
- Axios for HTTP requests

## 🛠️ Setup and Installation

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server or SQL Server LocalDB
- Visual Studio 2022 or Visual Studio Code (optional)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reenbit-test
   ```

2. **Backend Setup**
   ```bash
   # Restore .NET packages
   dotnet restore
   
   # Build the solution
   dotnet build
   
   # Start the API server
   cd ChatApp.API
   dotnet run
   ```
   
   The API will be available at: `http://localhost:5281`

3. **Frontend Setup**
   ```bash
   # In a new terminal, navigate to frontend
   cd chatapp-frontend
   
   # Install npm packages
   npm install
   
   # Start React development server
   npm start
   ```
   
   The React app will be available at: `http://localhost:3000`

4. **Database Configuration**
   
   The database connection string in `ChatApp.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ChatAppDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     },
     "Jwt": {
       "Key": "this-is-a-very-strong-secret-key-with-at-least-32-characters-for-hmacsha256",
       "Issuer": "ChatApp.API",
       "Audience": "ChatApp.API.Users"
     }
   }
   ```

## 🔐 Authentication

### Default Admin Account

The application automatically creates an admin account on startup:

- **Email:** `admin@chatapp.com`
- **Password:** `Admin123!`

### User Registration

New users can register through the React frontend with:
- Username (3+ characters)
- Email address
- Password (6+ characters)

### JWT Token Management

- Tokens expire after 7 days
- Automatic token refresh on API requests
- Secure token storage in localStorage
- Protected routes with authentication guards

## 📡 API Endpoints

### Authentication API

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Messages API (Authenticated)

- `GET /api/messages` - Get paginated messages
- `POST /api/messages` - Send a new message
- `GET /api/messages/{id}` - Get specific message
- `GET /api/messages/sentiment-stats` - Get sentiment statistics

### SignalR Hub (Authenticated)

- **Hub URL**: `/chathub`
- **Authentication**: JWT token required
- **Methods**:
  - `SendMessage(message, roomId)` - Send a message
  - `JoinRoom(roomId)` - Join a chat room
  - `LeaveRoom(roomId)` - Leave a chat room

## 🎨 Frontend Features

### Modern React UI

- **Authentication Pages**: Beautiful login/register forms
- **Chat Interface**: Real-time messaging with sentiment indicators
- **Responsive Design**: Mobile-first approach
- **Connection Status**: Visual indicator of SignalR connection
- **Message History**: Automatic loading of previous messages

### Styling Features

- **Gradient Backgrounds**: Modern purple gradient design
- **Styled Components**: CSS-in-JS with TypeScript support
- **Message Bubbles**: Different styles for own vs others' messages
- **Sentiment Badges**: Color-coded sentiment indicators
- **Loading States**: Smooth loading animations

## 🧪 Testing

Run the backend tests:

```bash
dotnet test
```

Run the frontend tests:

```bash
cd chatapp-frontend
npm test
```

## 📊 Features in Detail

### Authentication & Security

- **JWT tokens** with HMAC SHA256 signing
- **Password hashing** using PBKDF2 with salt
- **Protected routes** in both API and frontend
- **Automatic logout** on token expiration
- **CORS configuration** for secure cross-origin requests

### Real-time Communication

- **SignalR with JWT** authentication
- **Automatic reconnection** on connection loss
- **Room-based messaging** support
- **Connection status** indicators
- **Message broadcasting** to all connected users

### Sentiment Analysis

- **Real-time analysis** of every message
- **Confidence scoring** (0.0 to 1.0)
- **Visual indicators** with color coding:
  - 🟢 **Positive**: Green badges
  - 🔴 **Negative**: Red badges  
  - ⚪ **Neutral**: Gray badges

## 🚀 Development

### Running in Development

1. **Start API server:**
   ```bash
   cd ChatApp.API
   dotnet run
   ```

2. **Start React dev server:**
   ```bash
   cd chatapp-frontend
   npm start
   ```

3. **Access the application:**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:5281`
   - Swagger: `http://localhost:5281/swagger`

### Project Structure

```
Frontend Architecture:
├── contexts/          # React Context for state management
├── services/          # API and SignalR service classes
├── components/        # Reusable UI components
│   ├── auth/         # Authentication forms
│   ├── chat/         # Chat interface
│   └── styled/       # Styled components
├── pages/            # Route-level components
└── types/            # TypeScript interfaces
```

## 🔮 Future Enhancements

- [x] User authentication and authorization
- [ ] Role-based access control (Admin/User roles)
- [ ] Multiple chat rooms with creation/management
- [ ] File sharing capabilities
- [ ] Push notifications
- [ ] Message reactions and emojis
- [ ] Advanced sentiment analytics dashboard
- [ ] User profiles with avatars
- [ ] Private messaging
- [ ] Message encryption
- [ ] Mobile app (React Native)
- [ ] Voice and video calling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using ASP.NET Core, SignalR, React, and TypeScript** 