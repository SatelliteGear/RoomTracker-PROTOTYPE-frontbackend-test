// Admin Dashboard JavaScript

// Global variables
let allBookings = [];
let filteredBookings = [];
let selectedBookingForDelete = null;

// API base URL
const API_BASE_URL = window.location.origin;

// Initialize admin dashboard
async function initializeAdmin() {
    try {
        await loadStats();
        await loadBookings();
        setupEventListeners();
        populateFloorFilter();
    } catch (error) {
        console.error('Failed to initialize admin dashboard:', error);
        showError('Failed to load admin data. Please refresh the page.');
    }
}

// Load booking statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/bookings/stats`);
        if (!response.ok) throw new Error('Failed to load statistics');
        
        const stats = await response.json();
        
        document.getElementById('totalBookings').textContent = stats.total_bookings || 0;
        document.getElementById('roomsBooked').textContent = stats.rooms_booked || 0;
        document.getElementById('uniqueUsers').textContent = stats.unique_users || 0;
        
        // Calculate active now
        const activeNow = allBookings.filter(booking => {
            const now = new Date();
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            return now >= start && now <= end;
        }).length;
        
        document.getElementById('activeNow').textContent = activeNow;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all bookings
async function loadBookings() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/admin/bookings`);
        if (!response.ok) throw new Error('Failed to load bookings');
        
        allBookings = await response.json();
        filteredBookings = [...allBookings];
        
        renderBookings();
        await loadStats();
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Failed to load bookings.');
    }
}

// Render bookings table
function renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (filteredBookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <h3>No bookings found</h3>
                    <p>There are no bookings matching your current filters.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredBookings.map(booking => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const now = new Date();
        
        // Calculate duration
        const durationMs = endTime - startTime;
        const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
        
        // Determine status
        let status = 'upcoming';
        let statusClass = 'upcoming';
        if (now >= startTime && now <= endTime) {
            status = 'active';
            statusClass = 'active';
        } else if (now > endTime) {
            status = 'completed';
            statusClass = 'completed';
        }
        
        return `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.room_name}</td>
                <td>${booking.floor}</td>
                <td>${booking.user_name}</td>
                <td>${formatDateTime(startTime)}</td>
                <td>${formatDateTime(endTime)}</td>
                <td>${durationHours}h</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="action-btn view" onclick="viewBooking(${booking.id})">View</button>
                    <button class="action-btn delete" onclick="deleteBooking(${booking.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Format date and time
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading state
function showLoading() {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Loading bookings...</td></tr>';
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="error">
                <strong>Error:</strong> ${message}
            </td>
        </tr>
    `;
}

// Refresh bookings
async function refreshBookings() {
    await loadBookings();
}

// Apply date range filter
function applyDateFilter() {
    const dateRange = document.getElementById('dateRange').value;
    const now = new Date();
    
    let startDate, endDate;
    
    switch (dateRange) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
        case 'week':
            const dayOfWeek = now.getDay();
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 23, 59, 59);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'all':
            startDate = null;
            endDate = null;
            break;
        case 'custom':
            return; // Handle custom range separately
    }
    
    filterBookings(startDate, endDate);
}

// Apply custom date filter
async function applyCustomFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showError('Please select both start and end dates.');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        showError('Start date must be before end date.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/bookings/range?start=${startDate}&end=${endDate}`);
        if (!response.ok) throw new Error('Failed to load filtered bookings');
        
        filteredBookings = await response.json();
        renderBookings();
        
    } catch (error) {
        console.error('Error applying custom filter:', error);
        showError('Failed to apply custom filter.');
    }
}

// Filter bookings by date range
function filterBookings(startDate, endDate) {
    if (!startDate && !endDate) {
        filteredBookings = [...allBookings];
    } else {
        filteredBookings = allBookings.filter(booking => {
            const bookingDate = new Date(booking.start_time);
            if (startDate && bookingDate < startDate) return false;
            if (endDate && bookingDate > endDate) return false;
            return true;
        });
    }
    
    applyFloorFilter();
    renderBookings();
}

// Apply floor filter
function applyFloorFilter() {
    const floorFilter = document.getElementById('floorFilter').value;
    
    if (floorFilter === 'all') {
        return; // No additional filtering needed
    }
    
    const floor = parseInt(floorFilter);
    filteredBookings = filteredBookings.filter(booking => booking.floor === floor);
}

// Populate floor filter dropdown
function populateFloorFilter() {
    const floorFilter = document.getElementById('floorFilter');
    const floors = [...new Set(allBookings.map(booking => booking.floor))].sort();
    
    floors.forEach(floor => {
        const option = document.createElement('option');
        option.value = floor;
        option.textContent = `${floor}${getFloorSuffix(floor)} Floor`;
        floorFilter.appendChild(option);
    });
}

// Get floor suffix
function getFloorSuffix(floor) {
    if (floor >= 11 && floor <= 13) return 'th';
    switch (floor % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// View booking details
function viewBooking(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    
    alert(`
Booking Details:
ID: ${booking.id}
Room: ${booking.room_name} (Floor ${booking.floor})
User: ${booking.user_name}
Start: ${startTime.toLocaleString()}
End: ${endTime.toLocaleString()}
Duration: ${Math.round((endTime - startTime) / (1000 * 60 * 60) * 10) / 10} hours
Created: ${new Date(booking.created_at).toLocaleString()}
    `);
}

// Delete booking
function deleteBooking(bookingId) {
    const booking = allBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    selectedBookingForDelete = booking;
    
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    
    document.getElementById('deleteBookingDetails').innerHTML = `
        <p><strong>Room:</strong> ${booking.room_name} (Floor ${booking.floor})</p>
        <p><strong>User:</strong> ${booking.user_name}</p>
        <p><strong>Start:</strong> ${startTime.toLocaleString()}</p>
        <p><strong>End:</strong> ${endTime.toLocaleString()}</p>
    `;
    
    document.getElementById('deleteModal').style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!selectedBookingForDelete) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${selectedBookingForDelete.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete booking');
        
        closeDeleteModal();
        await loadBookings(); // Refresh the list
        
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
    }
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    selectedBookingForDelete = null;
}

// Export bookings to CSV
function exportBookings() {
    if (filteredBookings.length === 0) {
        alert('No bookings to export.');
        return;
    }
    
    const headers = ['ID', 'Room', 'Floor', 'User', 'Start Time', 'End Time', 'Duration (hours)', 'Status'];
    
    const csvContent = [
        headers.join(','),
        ...filteredBookings.map(booking => {
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);
            const duration = Math.round((endTime - startTime) / (1000 * 60 * 60) * 10) / 10;
            
            let status = 'upcoming';
            const now = new Date();
            if (now >= startTime && now <= endTime) {
                status = 'active';
            } else if (now > endTime) {
                status = 'completed';
            }
            
            return [
                booking.id,
                `"${booking.room_name}"`,
                booking.floor,
                `"${booking.user_name}"`,
                `"${startTime.toLocaleString()}"`,
                `"${endTime.toLocaleString()}"`,
                duration,
                status
            ].join(',');
        })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Setup event listeners
function setupEventListeners() {
    // Date range filter
    document.getElementById('dateRange').addEventListener('change', function() {
        if (this.value === 'custom') {
            document.getElementById('customDateRange').style.display = 'flex';
        } else {
            document.getElementById('customDateRange').style.display = 'none';
            applyDateFilter();
        }
    });
    
    // Floor filter
    document.getElementById('floorFilter').addEventListener('change', function() {
        applyFloorFilter();
        renderBookings();
    });
    
    // Close modal when clicking outside
    document.getElementById('deleteModal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeDeleteModal();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdmin); 