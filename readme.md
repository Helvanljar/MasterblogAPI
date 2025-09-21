# Masterblog

Masterblog is a full-stack web application for creating, managing, and viewing blog posts. It features a Flask-based backend API with persistent JSON storage and a responsive frontend built with HTML, JavaScript, and Tailwind CSS. The application supports user authentication, post CRUD operations, comments, search, sorting, pagination, and API documentation via Swagger UI.

## Features

- **Backend (Flask API)**:
  - **CRUD Operations**: Create, read, update, and delete blog posts via `/api/v1/posts` endpoints.
  - **User Authentication**: Register (`/api/v1/register`) and login (`/api/v1/login`) with JWT-based authentication.
  - **Extended Data Model**: Posts include `id`, `title`, `content`, `author`, `date`, `category`, `tags`, and `comments`.
  - **Search & Sorting**: Search posts by `title`, `content`, `author`, `date`, `category`, or `tags` with pagination; sort by any field, including proper date sorting.
  - **Comments**: Add comments to posts via `/api/v1/posts/<id>/comments`.
  - **Rate Limiting**: Limits requests (e.g., 100/day for general, 20/hour for POST/PUT/DELETE, 10/hour for register/login).
  - **Persistent Storage**: Stores posts in `posts.json` for data persistence across server restarts.
  - **API Documentation**: Swagger UI available at `/api/docs`.

- **Frontend**:
  - Responsive UI with Tailwind CSS for a clean, modern design.
  - Displays posts with `author`, `date`, `category`, `tags`, and comments.
  - Supports post creation, deletion, commenting, searching, sorting, and pagination.
  - Authentication interface for user registration and login/logout.
  - Error messaging for user feedback.

## Prerequisites

- **Python 3.8+**: For running the backend.
- **Node.js**: Not required (frontend uses CDN for Tailwind CSS).
- **Git**: For cloning the repository.
- **Postman** (optional): For testing API endpoints.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd masterblog
```

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip3 install flask flask-cors flask-jwt-extended flask-limiter flask-swagger-ui
   ```

4. **Run the backend**:
   ```bash
   python3 backend_app.py
   ```
   The backend runs on `http://localhost:5002`. Swagger UI is available at `http://localhost:5002/api/docs`.

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Create a virtual environment** (optional):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Flask** (if not already installed):
   ```bash
   pip3 install flask
   ```

4. **Run the frontend**:
   ```bash
   python3 frontend_app.py
   ```
   The frontend runs on `http://localhost:5001`.

### 4. File Structure

```
masterblog/
├── backend/
│   ├── backend_app.py       # Flask backend API
│   ├── posts.json          # Persistent storage for posts
│   └── static/
│       └── masterblog.json # Swagger API definition
├── frontend/
│   ├── frontend_app.py     # Flask frontend server
│   ├── static/
│   │   └── main.js         # JavaScript for frontend logic
│   └── templates/
│       └── index.html      # Main HTML template with Tailwind CSS
└── README.md               # This file
```

## Usage

### Backend
- **API Endpoints**:
  - `POST /api/v1/register`: Register a user (`{username, password}`).
  - `POST /api/v1/login`: Login and receive a JWT token (`{username, password}`).
  - `GET /api/v1/posts`: List posts with pagination (`?page=1&per_page=10&sort=field&direction=asc`).
  - `POST /api/v1/posts`: Create a post (`{title, content, author?, date?, category?, tags?}`, requires JWT).
  - `PUT /api/v1/posts/<id>`: Update a post (requires JWT).
  - `DELETE /api/v1/posts/<id>`: Delete a post (requires JWT).
  - `GET /api/v1/posts/search`: Search posts (`?title=term&content=term&author=term&date=YYYY-MM-DD&category=term&tags=term1,term2`).
  - `POST /api/v1/posts/<id>/comments`: Add a comment (`{text}`, requires JWT).
- **Swagger UI**: Access at `http://localhost:5002/api/docs` to test endpoints interactively.
- **Testing**: Use Postman to send requests, especially for authenticated endpoints (add `Authorization: Bearer <token>`).

### Frontend
- Open `http://localhost:5001` in a browser.
- **Register/Login**: Enter username/password and click Register or Login.
- **Configure API**: Set the API base URL (default: `http://127.0.0.1:5002/api/v1`).
- **Create Posts**: Fill in title, content, and optional fields (author, date, category, tags).
- **Search/Sort**: Use search inputs or sort dropdowns to filter/order posts.
- **Comment**: Add comments to posts (requires login).
- **Pagination**: Navigate pages with Previous/Next buttons.

## Notes
- **Data Persistence**: Posts are stored in `backend/posts.json`. If the file doesn’t exist, it’s created with sample data.
- **Authentication**: JWT tokens are stored in `localStorage` on the frontend and required for `POST`, `PUT`, `DELETE`, and comment actions.
- **Styling**: Frontend uses Tailwind CSS (CDN) for a modern, responsive design.
- **Error Handling**: Backend handles file errors (`posts.json`) and invalid JSON; frontend displays error messages.

## Future Improvements
- Add a `PUT` endpoint to the frontend for editing posts.
- Implement a “like” feature for posts with a counter.
- Replace JSON storage with a database (e.g., SQLite, MongoDB).
- Add user roles (e.g., admin for moderating comments).
- Enhance frontend with animations or additional styling.

## License
MIT License

---
Built with 💻 by [Your Name]