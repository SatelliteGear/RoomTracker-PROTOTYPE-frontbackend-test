const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use persistent database file or in-memory for CI/test environments
const isCI = process.env.CI || process.env.NODE_ENV === 'test';
const dbPath = isCI ? ':memory:' : path.join(__dirname, 'library_rooms.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create rooms table
            db.run(`
                CREATE TABLE IF NOT EXISTS rooms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    floor INTEGER NOT NULL,
                    capacity INTEGER NOT NULL,
                    equipment TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create bookings table
            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_id INTEGER NOT NULL,
                    user_name TEXT NOT NULL,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME NOT NULL,
                    status TEXT DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (room_id) REFERENCES rooms (id)
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    // Insert sample rooms if table is empty
                    insertSampleRooms().then(resolve).catch(reject);
                }
            });
        });
    });
}

// Insert sample rooms for testing
function insertSampleRooms() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM rooms", (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row.count === 0) {
                // Actual Cal Poly Pomona University Library Study Rooms
                const sampleRooms = [
                    // 2nd Floor - Group Study Rooms
                    { name: 'Group Study Room 2A', floor: 2, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 2B', floor: 2, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 2C', floor: 2, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    { name: 'Group Study Room 2D', floor: 2, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    
                    // 3rd Floor - Group Study Rooms
                    { name: 'Group Study Room 3A', floor: 3, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 3B', floor: 3, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 3C', floor: 3, capacity: 8, equipment: 'Whiteboard, Power Outlets, Large Table, Projector' },
                    { name: 'Group Study Room 3D', floor: 3, capacity: 8, equipment: 'Whiteboard, Power Outlets, Large Table, Projector' },
                    
                    // 4th Floor - Group Study Rooms
                    { name: 'Group Study Room 4A', floor: 4, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 4B', floor: 4, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 4C', floor: 4, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    { name: 'Group Study Room 4D', floor: 4, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    
                    // 5th Floor - Group Study Rooms
                    { name: 'Group Study Room 5A', floor: 5, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 5B', floor: 5, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 5C', floor: 5, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    { name: 'Group Study Room 5D', floor: 5, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    
                    // 6th Floor - Group Study Rooms
                    { name: 'Group Study Room 6A', floor: 6, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 6B', floor: 6, capacity: 4, equipment: 'Whiteboard, Power Outlets, Large Table' },
                    { name: 'Group Study Room 6C', floor: 6, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' },
                    { name: 'Group Study Room 6D', floor: 6, capacity: 6, equipment: 'Whiteboard, Power Outlets, Large Table, TV' }
                ];

                const stmt = db.prepare(`
                    INSERT INTO rooms (name, floor, capacity, equipment)
                    VALUES (?, ?, ?, ?)
                `);

                sampleRooms.forEach(room => {
                    stmt.run(room.name, room.floor, room.capacity, room.equipment);
                });

                stmt.finalize((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Cal Poly Pomona Library study rooms inserted successfully');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

// Get all rooms
function getAllRooms() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM rooms WHERE is_active = 1 ORDER BY floor, name", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Get rooms by floor
function getRoomsByFloor(floor) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM rooms WHERE floor = ? AND is_active = 1 ORDER BY name", [floor], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Get room by ID
function getRoomById(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM rooms WHERE id = ? AND is_active = 1", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Get current bookings for a room
function getRoomBookings(roomId, date = new Date()) {
    return new Promise((resolve, reject) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        db.all(`
            SELECT * FROM bookings 
            WHERE room_id = ? 
            AND start_time >= ? 
            AND start_time <= ?
            AND status = 'active'
            ORDER BY start_time
        `, [roomId, startOfDay.toISOString(), endOfDay.toISOString()], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Create a new booking
function createBooking(roomId, userName, startTime, endTime) {
    return new Promise((resolve, reject) => {
        // Check if room is available for the time slot
        db.get(`
            SELECT COUNT(*) as count FROM bookings 
            WHERE room_id = ? 
            AND status = 'active'
            AND (
                (start_time <= ? AND end_time > ?) OR
                (start_time < ? AND end_time >= ?) OR
                (start_time >= ? AND end_time <= ?)
            )
        `, [roomId, startTime, startTime, endTime, endTime, startTime, endTime], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row.count > 0) {
                reject(new Error('Room is not available for the selected time slot'));
                return;
            }

            // Create the booking
            db.run(`
                INSERT INTO bookings (room_id, user_name, start_time, end_time)
                VALUES (?, ?, ?, ?)
            `, [roomId, userName, startTime, endTime], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    });
}

// Get all floors
function getFloors() {
    return new Promise((resolve, reject) => {
        db.all("SELECT DISTINCT floor FROM rooms WHERE is_active = 1 ORDER BY floor", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => row.floor));
            }
        });
    });
}

// Get all bookings (for admin)
function getAllBookings() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT b.*, r.name as room_name, r.floor 
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id 
            WHERE b.status = 'active'
            ORDER BY b.start_time DESC
        `, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Get bookings by date range (for admin)
function getBookingsByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT b.*, r.name as room_name, r.floor 
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id 
            WHERE b.status = 'active'
            AND b.start_time >= ? 
            AND b.start_time <= ?
            ORDER BY b.start_time DESC
        `, [startDate.toISOString(), endDate.toISOString()], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Delete a booking (for admin)
function deleteBooking(bookingId) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM bookings WHERE id = ?", [bookingId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ deleted: this.changes > 0 });
            }
        });
    });
}

// Get booking statistics (for admin dashboard)
function getBookingStats() {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(*) as total_bookings,
                COUNT(DISTINCT room_id) as rooms_booked,
                COUNT(DISTINCT user_name) as unique_users
            FROM bookings 
            WHERE status = 'active'
        `, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
}

// Clear all bookings (for testing purposes)
function clearAllBookings() {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM bookings", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    initializeDatabase,
    getAllRooms,
    getRoomsByFloor,
    getRoomById,
    getRoomBookings,
    createBooking,
    getFloors,
    getAllBookings,
    getBookingsByDateRange,
    deleteBooking,
    getBookingStats,
    clearAllBookings
}; 