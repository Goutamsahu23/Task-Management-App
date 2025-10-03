# Task Management App

A full-stack Task Management application built with Node.js (Express) for the backend and React for the frontend. The app allows users to register, log in, create boards, lists, cards, attach files, and search tasks efficiently.

---

## Features

- **User Authentication:** Register, login, JWT-based authentication.
- **Board Management:** Create, update, delete boards.
- **List & Card Management:** Organize tasks into lists and cards.
- **File Attachments:** Upload and manage attachments for cards.
- **Search:** Filter and search tasks across boards.
- **Responsive UI:** Modern, user-friendly interface.

---

## Folder Structure

### Backend (`/backend`)
- **src/**
  - `server.js` — Entry point for Express server.
  - `config/db.js` — Database connection setup.
  - `controllers/` — Route logic for attachments, auth, boards, cards, lists, search.
  - `middleware/authMiddleware.js` — JWT authentication middleware.
  - `models/` — Mongoose models for Board, Card, List, User.
  - `routes/` — Express routes for all resources.
  - `utils/generateToken.js` — JWT token generation.
- **uploads/** — Stores uploaded files.
- `.env` — Environment variables.
- `package.json` — Backend dependencies and scripts.

### Frontend (`/frontend`)
- **src/**
  - `components/` — UI components (BoardCard, CardItem, ListColumn, Navbar, SearchFilter).
  - `hooks/useAuth.js` — Custom authentication hook.
  - `pages/` — Main pages (Dashboard, BoardPage, Login, Register, SearchResults).
  - `redux/` — Redux slices and store setup.
  - `services/api.js` — API calls to backend.
  - `utils/helpers.js` — Utility functions.
  - `App.js` — Main app component.
- **public/** — Static assets and HTML template.
- `.env` — Frontend environment variables.
- `package.json` — Frontend dependencies and scripts.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud)

### Setup

#### 1. Clone the repository

```bash
git clone <repo-url>
cd Task-Management-App
```

#### 2. Backend Setup

```bash
cd backend
npm install
# Configure .env with MongoDB URI and JWT secret
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

#### 4. Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000) (default)

---

## Environment Variables

### Backend (`backend/.env`)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Scripts

### Backend

- `npm run dev` — Start server with nodemon
- `npm start` — Start server

### Frontend

- `npm start` — Start React development server
- `npm test` — Run tests

---

## License

MIT

---

## Author

Goutam Sahu