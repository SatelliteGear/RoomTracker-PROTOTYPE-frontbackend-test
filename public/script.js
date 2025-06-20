// DOM elements
const backendMessage = document.getElementById('backendMessage');
const fetchButton = document.getElementById('fetchButton');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// API base URL
const API_BASE_URL = window.location.origin;

// Update connection status
function updateConnectionStatus(isConnected, message) {
    statusIndicator.className = `status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
    statusText.textContent = message;
}

// Update backend message display
function updateBackendMessage(message, isError = false) {
    const icon = backendMessage.querySelector('.icon');
    const text = backendMessage.querySelector('span:last-child');
    
    if (isError) {
        icon.textContent = '❌';
        backendMessage.style.background = '#fed7d7';
        backendMessage.style.borderColor = '#f56565';
        backendMessage.style.color = '#c53030';
    } else {
        icon.textContent = '✅';
        backendMessage.style.background = '#f0fff4';
        backendMessage.style.borderColor = '#48bb78';
        backendMessage.style.color = '#2f855a';
    }
    
    text.textContent = message;
}

// Fetch data from backend
async function fetchFromBackend() {
    try {
        // Show loading state
        updateBackendMessage('Loading...', false);
        fetchButton.disabled = true;
        fetchButton.textContent = 'Fetching...';
        
        // Make API call
        const response = await fetch(`${API_BASE_URL}/api/hello`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update display with success
        updateBackendMessage(data.message, false);
        updateConnectionStatus(true, 'Connected to backend');
        
    } catch (error) {
        console.error('Error fetching from backend:', error);
        updateBackendMessage(`Error: ${error.message}`, true);
        updateConnectionStatus(false, 'Connection failed');
    } finally {
        // Reset button state
        fetchButton.disabled = false;
        fetchButton.textContent = 'Fetch from Backend';
    }
}

// Check backend health
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            updateConnectionStatus(true, 'Backend is healthy');
        } else {
            updateConnectionStatus(false, 'Backend health check failed');
        }
    } catch (error) {
        updateConnectionStatus(false, 'Cannot reach backend');
    }
}

// Event listeners
fetchButton.addEventListener('click', fetchFromBackend);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check backend health on page load
    checkBackendHealth();
    
    // Auto-fetch after a short delay to demonstrate functionality
    setTimeout(() => {
        fetchFromBackend();
    }, 1000);
}); 