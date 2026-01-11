# Digital Parking Management System

## Overview
A full-stack smart parking management system designed to optimize parking space utilization, reduce congestion, and support rule enforcement through digital workflows.

The system allows users to view real-time parking slot availability, make time-based reservations, complete a simulated payment flow, and report parking violations with supporting evidence.

## Key Features
- User authentication with role-based access
- Real-time parking slot availability and booking
- Time-based slot reservation with payment simulation
- Booking history and cancellation support
- Parking violation reporting with image upload
- Admin and traffic authority workflows

## Tech Stack
**Frontend:** React  
**Backend:** Node.js, Express.js  
**Database:** SQLite  
**Other:** REST APIs, File uploads

## System Architecture
The application follows a client–server architecture where a React frontend communicates with an Express backend via REST APIs. The backend handles business logic and persists data using an SQLite database.

## Backend Capabilities
- Secure login with failed-attempt tracking and temporary account lock
- Slot booking and cancellation logic with time-based availability
- Mock payment confirmation workflow
- Image upload handling for parking violation reporting
- Modular and maintainable REST API design

## Frontend Capabilities
- Responsive interface for parking slot discovery and booking
- Booking modal with dynamic pricing and time calculation
- Role-aware navigation and conditional UI rendering
- Violation reporting form with image upload support

## Screenshots
(Screenshots will be added to demonstrate login flow, slot booking, booking history, and violation reporting.)

## How to Run Locally
1. Clone the repository  
2. Install dependencies in both `backend/` and `frontend/` directories  
3. Start the backend server (default port: 4000)  
4. Start the frontend development server  
5. Access the application through the browser

## Future Enhancements
- Integration with a real payment gateway
- Real-time updates using WebSockets
- Admin dashboard with analytics and reporting
- Deployment on cloud infrastructure
