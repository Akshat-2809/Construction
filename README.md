# ACE Construction

A modern construction equipment rental marketplace that connects equipment owners with contractors and businesses that need machinery on demand.

## Overview

ACE Construction simplifies the process of finding, listing, and renting construction equipment. Instead of relying on personal contacts and fragmented communication channels, users can discover available machinery, connect with owners, and manage rental requests through a single platform.

## Problem

Construction projects often face delays because contractors cannot quickly locate available machinery such as:

- Excavators
- Backhoe Loaders
- Concrete Mixers
- Cranes
- Road Rollers
- Dumpers
- Concrete Pumps
- Other heavy equipment

Equipment owners also struggle with low machine utilization and limited visibility in the market.

## Solution

ACE Construction provides a digital marketplace where:

- Equipment owners can list available machines.
- Contractors can search and request equipment.
- Rental inquiries are streamlined.
- Equipment visibility is increased.
- Idle machinery can generate additional revenue.

---

## Features

### User Features

- User registration and authentication
- Browse available construction equipment
- View machine details
- Submit rental requests
- Manage profile information
- Contact equipment owners

### Equipment Owner Features

- Create equipment listings
- Update machine information
- Manage availability
- Track rental inquiries
- Remove inactive listings

### Platform Features

- Secure authentication
- Responsive design
- Modern user interface
- Search and filtering
- Mobile-friendly experience

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Deployment

- Vercel (Frontend)
- MongoDB Atlas (Database)

---

## Project Structure

```bash
Construction/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── lib/
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── ...
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Akshat-2809/Construction.git

cd Construction
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5001

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

Run backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Run frontend:

```bash
npm run dev
```

Application will start at:

```bash
http://localhost:3000
```

---

## Environment Variables

### Backend

```env
PORT=
MONGO_URI=
JWT_SECRET=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=
```

Add Firebase variables if Firebase authentication or storage is used.

---

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Equipment

```http
GET    /api/machines
GET    /api/machines/:id
POST   /api/machines
PUT    /api/machines/:id
DELETE /api/machines/:id
```

### Requests

```http
POST /api/requests
GET  /api/requests
```

---

## Future Roadmap

- Real-time equipment availability
- Integrated payments
- Equipment location tracking
- Owner verification
- Contractor verification
- WhatsApp notifications
- AI-powered equipment recommendations
- Equipment maintenance records
- Rental analytics dashboard

---

## Business Vision

Our goal is to become the operating system for construction equipment rentals by connecting equipment owners and contractors through a reliable, transparent, and scalable platform.

---

## Live Demo

🌐 https://construction-chi-six.vercel.app

---

## License

This project is licensed under the ISC License.

---

## Author

Developed by the ACE Construction Team.
