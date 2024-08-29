# 3 Daily Route Trips Around the World

## Overview
This web application allows users to generate 3-day travel itineraries for various countries around the world. Users can choose between car and bicycle trips, and the application will create custom routes with points of interest and estimated travel times.

## Features
- Country selection from a comprehensive list
- Choice between car and bicycle trips
- Generation of 3-day continuous travel itineraries
- Display of route information including distances and durations
- Interactive map showing the generated routes
- AI-generated images representing each day of the trip
- Responsive design for various screen sizes

## Technologies Used
- Frontend: React.js
- Backend: Node.js with Express.js
- Map Integration: Leaflet.js
- AI Text Generation: Groq API
- AI Image Generation: Stable Horde API
- Styling: CSS with custom designs

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/3-daily-route-trips.git
   ```

2. Navigate to the project directory:
   ```
   cd 3-daily-route-trips
   ```

3. Install the dependencies for both frontend and backend:
   ```
   npm install
   cd server
   npm install
   cd ..
   ```

4. Create a `.env` file in the server directory and add your API keys:
   ```
   GROQ_API_KEY=your_groq_api_key
   STABLEHORDE_API_KEY=your_stablehorde_api_key
   ```

## Running the Application

1. Start the backend server:
   ```
   cd server
   npm start
   ```

2. In a new terminal, start the React frontend:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Select a country from the dropdown list.
2. Choose between a car or bicycle trip.
3. Click "Create Itinerary" to generate your 3-day trip plan.
4. View the generated route on the map and scroll down to see detailed information for each day.

## Contributing

Contributions to this project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Groq API for text generation
- Stable Horde API for image generation
- OpenStreetMap for mapping data
- All contributors who have helped to enhance this project
