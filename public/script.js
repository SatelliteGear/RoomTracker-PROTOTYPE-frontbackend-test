// DOM elements
const floorButtons = document.getElementById('floorButtons');
const roomGrid = document.getElementById('roomGrid');
const bookingModal = document.getElementById('bookingModal');
const closeModal = document.getElementById('closeModal');
const cancelBooking = document.getElementById('cancelBooking');
const bookingForm = document.getElementById('bookingForm');
const roomNameInput = document.getElementById('roomName');
const userNameInput = document.getElementById('userName');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');

// API base URL
const API_BASE_URL = window.location.origin;

// Global state
let currentFloor = null;
let selectedRoom = null;
let rooms = [];

// Initialize the application
async function initializeApp() {
    try {
        await loadFloors();
        await loadRooms();
        setupEventListeners();
        setDefaultTimes();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load room data. Please refresh the page.');
    }
}

// Load available floors
async function loadFloors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/floors`);
        if (!response.ok) throw new Error('Failed to load floors');
        
        const floors = await response.json();
        renderFloorButtons(floors);
        
        // Select first floor by default
        if (floors.length > 0) {
            currentFloor = floors[0];
            selectFloor(currentFloor);
        }
    } catch (error) {
        console.error('Error loading floors:', error);
        throw error;
    }
}

// Render floor navigation buttons
function renderFloorButtons(floors) {
    floorButtons.innerHTML = '';
    floors.forEach(floor => {
        const button = document.createElement('button');
        button.className = 'floor-btn';
        button.textContent = `${floor}${getFloorSuffix(floor)} Floor`;
        button.onclick = () => selectFloor(floor);
        floorButtons.appendChild(button);
    });
}

// Get floor suffix (1st, 2nd, 3rd, etc.)
function getFloorSuffix(floor) {
    if (floor >= 11 && floor <= 13) return 'th';
    switch (floor % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Select a floor and load its rooms
async function selectFloor(floor) {
    currentFloor = floor;
    
    // Update active button
    document.querySelectorAll('.floor-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(`${floor}${getFloorSuffix(floor)} Floor`)) {
            btn.classList.add('active');
        }
    });
    
    await loadRoomsByFloor(floor);
}

// Load all rooms
async function loadRooms() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms`);
        if (!response.ok) throw new Error('Failed to load rooms');
        
        rooms = await response.json();
    } catch (error) {
        console.error('Error loading rooms:', error);
        throw error;
    }
}

// Load rooms for a specific floor
async function loadRoomsByFloor(floor) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/floor/${floor}`);
        if (!response.ok) throw new Error('Failed to load rooms for floor');
        
        const floorRooms = await response.json();
        await renderRooms(floorRooms);
    } catch (error) {
        console.error('Error loading rooms for floor:', error);
        showError('Failed to load rooms for this floor.');
    }
}

// Render room cards
async function renderRooms(rooms) {
    roomGrid.innerHTML = '';
    
    if (rooms.length === 0) {
        roomGrid.innerHTML = '<div class="loading">No rooms available on this floor.</div>';
        return;
    }
    
    for (const room of rooms) {
        const roomCard = await createRoomCard(room);
        roomGrid.appendChild(roomCard);
    }
}

// Create a room card element
async function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    
    // Get room availability
    const availability = await getRoomAvailability(room.id);
    card.classList.add(availability.status);
    
    card.innerHTML = `
        <div class="room-header">
            <div class="room-name">${room.name}</div>
            <div class="room-status ${availability.status}">${availability.status}</div>
        </div>
        <div class="room-details">
            <div class="room-detail">
                <span class="icon">🏢</span>
                <span>Floor ${room.floor}</span>
            </div>
            <div class="room-detail">
                <span class="icon">👥</span>
                <span>Capacity: ${room.capacity} people</span>
            </div>
            ${room.equipment ? `
                <div class="room-detail">
                    <span class="icon">🔌</span>
                    <span>Equipment: ${room.equipment}</span>
                </div>
            ` : ''}
        </div>
        ${room.equipment ? `<div class="room-equipment">${room.equipment}</div>` : ''}
        <button class="book-btn" ${availability.status !== 'available' ? 'disabled' : ''}>
            ${availability.status === 'available' ? 'Book Room' : 'Not Available'}
        </button>
    `;
    
    // Add click handler for booking
    const bookBtn = card.querySelector('.book-btn');
    if (availability.status === 'available') {
        bookBtn.onclick = () => openBookingModal(room);
    }
    
    return card;
}

// Get room availability status
async function getRoomAvailability(roomId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/bookings`);
        if (!response.ok) throw new Error('Failed to get room bookings');
        
        const bookings = await response.json();
        const now = new Date();
        
        // Check if room is currently booked
        const currentBooking = bookings.find(booking => {
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            return now >= start && now <= end;
        });
        
        if (currentBooking) {
            return { status: 'occupied', booking: currentBooking };
        }
        
        // Check if room has upcoming bookings today
        const todayBookings = bookings.filter(booking => {
            const start = new Date(booking.start_time);
            return start.toDateString() === now.toDateString();
        });
        
        if (todayBookings.length > 0) {
            return { status: 'booked', bookings: todayBookings };
        }
        
        return { status: 'available' };
    } catch (error) {
        console.error('Error getting room availability:', error);
        return { status: 'unknown' };
    }
}

// Open booking modal
function openBookingModal(room) {
    selectedRoom = room;
    roomNameInput.value = room.name;
    setDefaultTimes(); // Set default times when modal opens
    bookingModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close booking modal
function closeBookingModal() {
    bookingModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    selectedRoom = null;
    bookingForm.reset();
}

// Set default times for booking
function setDefaultTimes() {
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour later
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Set min attribute to current time to prevent past dates
    const minDateTime = formatDateTime(now);
    startTimeInput.min = minDateTime;
    endTimeInput.min = minDateTime;
    
    startTimeInput.value = formatDateTime(startTime);
    endTimeInput.value = formatDateTime(endTime);
}

// Handle booking form submission
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(bookingForm);
    const userName = formData.get('userName') || userNameInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    
    if (!userName || !startTime || !endTime) {
        showError('Please fill in all required fields.');
        return;
    }
    
    const startDateTime = new Date(startTime);
    const now = new Date();
    
    if (startDateTime <= now) {
        showError('Start time must be in the future.');
        return;
    }
    
    if (new Date(endTime) <= new Date(startTime)) {
        showError('End time must be after start time.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomId: selectedRoom.id,
                userName: userName,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString()
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create booking');
        }
        
        const booking = await response.json();
        closeBookingModal();
        showSuccess(`Room booked successfully! Booking ID: ${booking.id}`);
        
        // Refresh room display
        await loadRoomsByFloor(currentFloor);
        
    } catch (error) {
        console.error('Error creating booking:', error);
        showError(error.message);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    // Remove existing error messages
    document.querySelectorAll('.error').forEach(el => el.remove());
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(errorDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.style.cssText = `
        background: #c6f6d5;
        color: #22543d;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #48bb78;
    `;
    successDiv.textContent = message;
    
    // Remove existing success messages
    document.querySelectorAll('.success').forEach(el => el.remove());
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(successDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// Setup event listeners
function setupEventListeners() {
    // Modal close events
    closeModal.onclick = closeBookingModal;
    cancelBooking.onclick = closeBookingModal;
    
    // Close modal when clicking outside
    bookingModal.onclick = (event) => {
        if (event.target === bookingModal) {
            closeBookingModal();
        }
    };
    
    // Booking form submission
    bookingForm.onsubmit = handleBookingSubmit;
    
    // Set minimum end time based on start time
    startTimeInput.onchange = () => {
        if (startTimeInput.value) {
            const startTime = new Date(startTimeInput.value);
            const minEndTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes minimum
            endTimeInput.min = minEndTime.toISOString().slice(0, 16);
            
            if (!endTimeInput.value || new Date(endTimeInput.value) <= startTime) {
                endTimeInput.value = minEndTime.toISOString().slice(0, 16);
            }
        }
    };
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 