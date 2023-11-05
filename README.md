# GhoomO - Your Ultimate Travel Planner

## Project Description

**GhoomO** is a web application designed to help tourists make the most of their time exploring a city by providing optimal routes to the best tourist destinations under given time constraints. 

**How It Works:**

- Users enter the name of the city they wish to visit and the time they have available, along with their starting location.
- Upon user input, GhoomO's backend utilizes the TomTom Maps API to access distance data for all tourist sites stored in our database.
- The system then generates and presents the most efficient route for visiting these places within the given timeframe. 
- Users can further customize the route by including or excluding specific destinations.

GhoomO ensures that tourists can optimize their time spent exploring a new city, making their visit enjoyable and stress-free.

## High-Level Design

### 1. Homepage

The homepage is the initial point of interaction for users and includes:

- An overview about the website with some famous tourist spots cards.
- Learn more information to redirect to Route Optimization page.

### 2. Route Optimization Page

The Route Optimization Page is the heart of the application and provides:

- A search bar to inquire about the desired city.
- A detailed route for visiting recommended tourist destinations.
- Step-by-step directions displayed on an interactive map.
- Customization options for the route, allowing users to include or exclude specific destinations.

### 3. Database and Backend

The application's backend performs several key functions:

- Utilizes the Tom Tom Maps API to calculate distances, optimize routes, and provide real-time directions.
- Stores information about tourist destinations, including location details, descriptions, and estimated visit times.

## Benefits

GhoomO offers numerous benefits for travelers, including:

- Time optimization, helping users make the most of their limited time.
- Customization of routes to suit individual preferences.
- Improved efficiency, enabling visitors to cover more ground with less effort.
- Reduced stress by providing clear directions and eliminating uncertainty.
- Enhanced tourism experiences through well-planned itineraries.

### Tech Stack: React.js

---

GhoomO is your travel companion, helping you explore new cities efficiently and with ease. Enjoy your trips like never before! So let's GhoomOooo...