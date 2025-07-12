# Library Room Availability Tracker

A modern web application for managing and booking study rooms at Cal Poly Pomona University Library, inspired by the [official CPP library room booking system](https://cpp.libcal.com/spaces?lid=8262&gid=0&c=0).

## Features

- **Floor-based Navigation**: Browse study rooms by library floor (2nd, 3rd, 4th, 5th floors)
- **Real-time Availability**: See current room status (Available, Occupied, Booked)
- **Room Booking System**: Reserve rooms for specific time slots with conflict prevention
- **Room Details**: View capacity, equipment, and floor information
- **Modern UI**: Clean, responsive design with intuitive navigation
- **Database Backend**: SQLite database for persistent room and booking data

## Project Structure

```
web-service-prototype/
├── package.json          # Node.js dependencies and scripts
├── server.js             # Express server with room management APIs
├── database.js           # SQLite database operations
├── library_rooms.db      # SQLite database file (auto-generated)
├── public/               # Frontend files
│   ├── index.html        # Room availability interface
│   ├── styles.css        # Modern CSS styling
│   └── script.js         # Frontend functionality
├── tests/                # Unit tests
│   └── server.test.js    # API endpoint tests
└── README.md             # This file
```

## Technologies Used

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: SQLite for data persistence
- **Testing**: Jest, Supertest
- **Styling**: Modern CSS with gradients, flexbox, and grid

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

1. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:3000`
   - The room availability tracker will load automatically

## API Endpoints

### Core Endpoints
- `GET /` - Serves the main room availability interface
- `GET /admin` - Serves the admin dashboard
- `GET /api/hello` - Returns a "Hello World" message
- `GET /api/health` - Health check endpoint

### Room Management
- `GET /api/rooms` - Get all available rooms
- `GET /api/rooms/floors` - Get list of available floors
- `GET /api/rooms/floor/:floor` - Get rooms for a specific floor
- `GET /api/rooms/:id` - Get details for a specific room
- `GET /api/rooms/:id/bookings` - Get bookings for a specific room

### Booking System
- `POST /api/bookings` - Create a new room booking

### Admin Management
- `GET /api/admin/bookings` - Get all bookings with room details
- `GET /api/admin/bookings/stats` - Get booking statistics
- `GET /api/admin/bookings/range` - Get bookings within a date range
- `DELETE /api/admin/bookings/:id` - Delete a specific booking

## How It Works

1. **Floor Selection**: Choose a library floor from the navigation buttons
2. **Room Display**: View all rooms on the selected floor with their current status
3. **Room Information**: Each room card shows:
   - Room name and status (Available/Occupied/Booked)
   - Floor number and capacity
   - Available equipment (whiteboards, power outlets, etc.)
4. **Booking Process**: Click "Book Room" on available rooms to open the booking modal
5. **Time Selection**: Choose start and end times for your reservation
6. **Confirmation**: Receive a booking ID upon successful reservation

## Admin Dashboard

The admin dashboard provides comprehensive booking management capabilities:

### **📊 Statistics Overview**
- Total bookings count
- Number of rooms booked
- Unique users
- Currently active bookings

### **🔍 Booking Management**
- View all bookings in a sortable table
- Filter by date range (Today, This Week, This Month, Custom)
- Filter by floor
- Search and sort functionality

### **📋 Booking Details**
- Booking ID, room name, floor
- User name and contact information
- Start and end times with duration
- Current status (Active, Upcoming, Completed)

### **⚙️ Administrative Actions**
- **View Details**: Click "View" to see complete booking information
- **Delete Bookings**: Remove bookings with confirmation dialog
- **Export Data**: Download bookings as CSV file
- **Real-time Updates**: Refresh data to see latest bookings

### **🎯 Access Admin Dashboard**
- Click the "📊 Admin Dashboard" button on the main booking page
- Or navigate directly to `http://localhost:3000/admin`

## Sample Data

The system comes pre-loaded with sample study rooms across 5 floors:

- **2nd Floor**: Study Rooms 201-202 (4-6 person capacity)
- **3rd Floor**: Study Rooms 301-302 (4-8 person capacity)  
- **4th Floor**: Study Rooms 401-402 (4-6 person capacity)
- **5th Floor**: Study Rooms 501-502 (4-6 person capacity)

Each room includes equipment like whiteboards, power outlets, TVs, and projectors.

## Testing

This project uses [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) for comprehensive testing.

### To run the tests:

1. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
2. Run the tests:
   ```bash
   npm test
   ```

The tests cover:
- Basic API endpoints (hello, health)
- Room management operations
- Booking system functionality
- Error handling and edge cases

## Development

- The backend runs on port 3000 by default
- CORS is enabled for frontend-backend communication
- Static files are served from the `public` directory
- Database is automatically initialized with sample data on first run
- The server automatically restarts when using `npm run dev`

## Future Enhancements

- User authentication and student ID integration
- Real-time updates using WebSockets
- Advanced filtering (capacity, equipment, time slots)
- Admin panel for room management
- Booking history and cancellation
- Mobile app integration

This room availability tracker provides a solid foundation for building a comprehensive library room management system, demonstrating modern web development practices with a focus on user experience and data integrity.
