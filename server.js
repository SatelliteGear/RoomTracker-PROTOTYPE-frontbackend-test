const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, getAllRooms, getRoomsByFloor, getRoomById, getRoomBookings, createBooking, getFloors, getAllBookings, getBookingsByDateRange, deleteBooking, getBookingStats } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database on startup
initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch(err => console.error('Database initialization failed:', err));

// API Routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World from Backend!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Room Management API Endpoints
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getAllRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/floors', async (req, res) => {
  try {
    const floors = await getFloors();
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/floor/:floor', async (req, res) => {
  try {
    const floor = parseInt(req.params.floor);
    const rooms = await getRoomsByFloor(floor);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const room = await getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:id/bookings', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const bookings = await getRoomBookings(roomId, date);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { roomId, userName, startTime, endTime } = req.body;
    
    if (!roomId || !userName || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const booking = await createBooking(roomId, userName, startTime, endTime);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin API Endpoints
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/bookings/stats', async (req, res) => {
  try {
    const stats = await getBookingStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/bookings/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const bookings = await getBookingsByDateRange(startDate, endDate);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const result = await deleteBooking(bookingId);
    if (result.deleted) {
      res.json({ message: 'Booking deleted successfully' });
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoint available at http://localhost:${PORT}/api/hello`);
  });
}

module.exports = app; 