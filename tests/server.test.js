const request = require('supertest');
const app = require('../server');
const { clearAllBookings } = require('../database');

describe('API Endpoints', () => {
  it('GET /api/hello should return greeting message', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Hello World from Backend!');
  });

  it('GET /api/health should return status OK and a valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    // Check if timestamp is a valid ISO string
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });

  it('GET /api/nonexistent should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});

describe('Room Management API', () => {
  it('GET /api/rooms should return all rooms', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Check room structure
    const room = res.body[0];
    expect(room).toHaveProperty('id');
    expect(room).toHaveProperty('name');
    expect(room).toHaveProperty('floor');
    expect(room).toHaveProperty('capacity');
    expect(room).toHaveProperty('equipment');
  });

  it('GET /api/rooms/floors should return available floors', async () => {
    const res = await request(app).get('/api/rooms/floors');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body).toContain(2); // Should have floor 2
    expect(res.body).toContain(6); // Should have floor 6 (new addition)
  });

  it('GET /api/rooms/floor/:floor should return rooms for specific floor', async () => {
    const res = await request(app).get('/api/rooms/floor/2');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // All rooms should be on floor 2
    res.body.forEach(room => {
      expect(room.floor).toBe(2);
    });
    
    // Should have 4 rooms on floor 2 (2A, 2B, 2C, 2D)
    expect(res.body.length).toBe(4);
  });

  it('GET /api/rooms/:id should return specific room', async () => {
    // First get all rooms to get a valid ID
    const roomsRes = await request(app).get('/api/rooms');
    const roomId = roomsRes.body[0].id;
    
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', roomId);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('floor');
  });

  it('GET /api/rooms/:id should return 404 for non-existent room', async () => {
    const res = await request(app).get('/api/rooms/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Room not found');
  });

  it('GET /api/rooms/:id/bookings should return room bookings', async () => {
    // First get all rooms to get a valid ID
    const roomsRes = await request(app).get('/api/rooms');
    const roomId = roomsRes.body[0].id;
    
    const res = await request(app).get(`/api/rooms/${roomId}/bookings`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Booking API', () => {
  beforeEach(async () => {
    // Clear all bookings before each test to ensure isolation
    await clearAllBookings();
  });

  it('POST /api/bookings should create a new booking', async () => {
    // First get a room ID
    const roomsRes = await request(app).get('/api/rooms');
    const roomId = roomsRes.body[0].id;
    
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2); // 2 hours from now to avoid conflicts
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // 3 hours from now
    
    const bookingData = {
      roomId: roomId,
      userName: 'Test User',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    const res = await request(app)
      .post('/api/bookings')
      .send(bookingData);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /api/bookings should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ roomId: 1, userName: 'Test' }); // Missing startTime and endTime
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  it('POST /api/bookings should return 400 for conflicting bookings', async () => {
    // First get a room ID
    const roomsRes = await request(app).get('/api/rooms');
    const roomId = roomsRes.body[0].id;
    
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 3); // 3 hours from now
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // 4 hours from now
    
    const bookingData = {
      roomId: roomId,
      userName: 'Test User',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    // Create first booking
    const firstRes = await request(app).post('/api/bookings').send(bookingData);
    expect(firstRes.statusCode).toBe(201);
    
    // Try to create conflicting booking
    const conflictingData = {
      roomId: roomId,
      userName: 'Another User',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    const res = await request(app)
      .post('/api/bookings')
      .send(conflictingData);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('not available');
  });
});

describe('Admin API', () => {
  beforeEach(async () => {
    // Clear all bookings before each test
    await clearAllBookings();
  });

  it('GET /api/admin/bookings should return all bookings', async () => {
    // Create a test booking first
    const roomsRes = await request(app).get('/api/rooms');
    const roomId = roomsRes.body[0].id;
    
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    await request(app).post('/api/bookings').send({
      roomId: roomId,
      userName: 'Admin Test User',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    // Get all bookings
    const res = await request(app).get('/api/admin/bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('room_name');
    expect(res.body[0]).toHaveProperty('floor');
  });

  it('GET /api/admin/bookings/stats should return booking statistics', async () => {
    const res = await request(app).get('/api/admin/bookings/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total_bookings');
    expect(res.body).toHaveProperty('rooms_booked');
    expect(res.body).toHaveProperty('unique_users');
  });

  it('GET /api/admin/bookings/range should return bookings in date range', async () => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const res = await request(app).get(`/api/admin/bookings/range?start=${startDate}&end=${endDate}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE /api/admin/bookings/:id should delete a booking', async () => {
    // Create a test booking first
    const roomsRes = await request(app).get('/api/rooms');
    const roomId = roomsRes.body[0].id;
    
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    const bookingRes = await request(app).post('/api/bookings').send({
      roomId: roomId,
      userName: 'Delete Test User',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    const bookingId = bookingRes.body.id;
    
    // Delete the booking
    const deleteRes = await request(app).delete(`/api/admin/bookings/${bookingId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'Booking deleted successfully');
    
    // Verify booking is deleted
    const allBookingsRes = await request(app).get('/api/admin/bookings');
    expect(allBookingsRes.body.length).toBe(0);
  });

  it('DELETE /api/admin/bookings/:id should return 404 for non-existent booking', async () => {
    const res = await request(app).delete('/api/admin/bookings/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Booking not found');
  });
}); 