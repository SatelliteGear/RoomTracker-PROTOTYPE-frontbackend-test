# Web Service Prototype

A simple web service prototype showing frontend-backend communication with "Hello World"

## Features

- **Frontend**: Modern, responsive HTML/CSS/JavaScript interface
- **Backend**: Node.js/Express server with REST API endpoints
- **Communication**: Frontend can fetch data from backend API
- **Status Monitoring**: Real-time connection status display
- **Modern UI**: Clean, gradient-based design with hover effects

## Project Structure

```
web-service-prototype/
├── package.json          # Node.js dependencies and scripts
├── server.js             # Express server (backend)
├── public/               # Frontend files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # CSS styles
│   └── script.js         # JavaScript functionality
└── README.md             # This file
```

## Necessities

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the App

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
   - The frontend will automatically load and attempt to connect to the backend

## API Endpoints

- `GET /` - Serves the main HTML page
- `GET /api/hello` - Returns a "Hello World" message from the backend
- `GET /api/health` - Health check endpoint

## How It Works

1. **Frontend Display**: The page shows a "Hello World" message from the frontend
2. **Backend Communication**: Click the "Fetch from Backend" button to get a message from the backend API
3. **Status Monitoring**: The connection status indicator shows whether the frontend can communicate with the backend
4. **Auto-demo**: The page automatically fetches from the backend after loading to demonstrate functionality

## Testing the Connection

- **Success**: You'll see a green checkmark and "Hello World from Backend!" message
- **Failure**: You'll see a red X and error message if the backend is not running

## Development

- The backend runs on port 3000 by default
- CORS is enabled to allow frontend-backend communication
- Static files are served from the `public` directory
- The server automatically restarts when using `npm run dev`

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with gradients, flexbox, and grid
- **Communication**: Fetch API for HTTP requests

This prototype validates that your frontend and backend are working and connected correctly, providing a foundation for building more complex web services. 

## Running Backend Unit Tests

This project uses [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) for backend unit testing.

### To run the tests:

1. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
2. Run the tests:
   ```bash
   npm test
   ```

Test files are located in the `tests/` directory. The tests cover API endpoints and include edge cases.
