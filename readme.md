# Masterblog

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.0+-black.svg)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.0+-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**Masterblog** is a full-stack web application for creating, managing, and displaying blog posts. It features a Flask-based RESTful API (backend) and a separate Flask-based frontend, with JSON storage and a responsive UI styled with Tailwind CSS. The application supports user authentication, post CRUD operations, commenting, advanced search, sorting, pagination, and API documentation via Swagger UI.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview

Masterblog provides a platform for users to create, read, update, and delete blog posts, with features like authentication, commenting, and filtering. The backend API runs on port `5002`, and the frontend runs on port `5001`. Data is stored persistently in JSON files (`posts.json`, `users.json`), and Swagger UI offers interactive API documentation.

## Features

### Backend (Flask API)
- **CRUD Operations**: Create, read, update, and delete posts via `/api/posts`.
- **User Authentication**: Secure registration (`/api/register`) and login (`/api/login`) with JWT, stored in `users.json`.
- **Extended Post Model**: Posts include `id`, `title`, `content`, `author`, `date`, `category`, `tags`, and `comments`.
- **Search & Sorting**: Filter posts by multiple fields with pagination; sort by any field.
- **Commenting**: Add (`POST /api/posts/<id>/comments`), retrieve (`GET /api/posts/<id>/comments`), and delete (`DELETE /api/posts/<id>/comments/<comment_id>`) comments.
- **Rate Limiting**: 100/day general, 20/hour for POST/PUT/DELETE, 10/hour for register/login.
- **Persistent Storage**: Uses `posts.json` and `users.json`.
- **API Documentation**: Swagger UI at `/api/docs`.
- **Date Validation**: Ensures `YYYY-MM-DD` format for dates.

### Frontend
- Responsive UI with Tailwind CSS.
- Displays post details (`author`, `date`, `category`, `tags`, `comments`).
- Supports post creation, deletion, commenting (add/delete), searching, sorting, pagination.
- User-friendly authentication and error messaging.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend   | Python 3.8+, Flask, Flask-CORS, Flask-JWT-Extended, Flask-Limiter, Flask-Swagger-UI |
| Frontend  | HTML, JavaScript, Tailwind CSS (CDN) |
| Storage   | JSON (`posts.json`, `users.json`) |
| API Docs  | Swagger UI |

## Installation

### Prerequisites
- Python 3.8 or higher
- Git
- Postman (optional, for API testing)

### Clone the Repository
```bash
git clone https://github.com/Helvanljar/MasterblogAPI.git
cd masterblog
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install flask flask-cors flask-jwt-extended flask-limiter flask-swagger-ui
   ```
4. Run the backend:
   ```bash
   python backend_app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install Flask:
   ```bash
   pip install flask
   ```
4. Run the frontend:
   ```bash
   python frontend_app.py
   ```

### Codio Setup
1. Upload the repository to Codio.
2. Ensure ports `5001` (frontend) and `5002` (backend) are public (Project > Settings > Ports).
3. Run both servers:
   ```bash
   cd ~/workspace/masterblog
   ./start.sh
   ```
4. Access:
   - Frontend: `https://<codio-box-url>:5001`
   - API: `https://<codio-box-url>:5002/api/posts`
   - Swagger UI: `https://<codio-box-url>:5002/api/docs`

## Usage

### Application
- **Frontend**: Access at `https://<codio-box-url>:5001` or `http://localhost:5001`.
- **API**: Use `https://<codio-box-url>:5002/api` or `http://localhost:5002/api`.
- Test all features: register, login, post CRUD, comment add/delete, search, sort, pagination.

### API
| Method | Endpoint                              | Description                              |
|--------|---------------------------------------|------------------------------------------|
| POST   | `/api/register`                      | Register a new user (`{username, password}`) |
| POST   | `/api/login`                         | Login and receive a JWT token |
| GET    | `/api/posts`                         | List posts with pagination and sorting |
| POST   | `/api/posts`                         | Create a post (requires JWT) |
| PUT    | `/api/posts/<id>`                    | Update a post (requires JWT) |
| DELETE | `/api/posts/<id>`                    | Delete a post (requires JWT) |
| GET    | `/api/posts/search`                  | Search posts by multiple fields |
| GET    | `/api/posts/<id>/comments`           | Get all comments for a post |
| POST   | `/api/posts/<id>/comments`           | Add a comment (requires JWT) |
| DELETE | `/api/posts/<id>/comments/<comment_id>` | Delete a comment (requires JWT, author only) |

## API Reference

See Swagger UI at `https://<codio-box-url>:5002/api/docs`.

## File Structure

```
masterblog/
├── backend/
│   ├── backend_app.py
│   ├── posts.json
│   ├── users.json
│   └── static/
│       └── masterblog.json
├── frontend/
│   ├── frontend_app.py
│   ├── static/
│   │   └── main.js
│   └── templates/
│       └── index.html
├── start.sh
└── README.md
```

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push (`git push origin feature/your-feature`).
5. Open a pull request.

## Future Enhancements

- Transition to a database (e.g., SQLite, PostgreSQL).
- Add frontend support for editing posts.
- Implement a "like" feature.
- Add user roles (admin, user).
- Enhance frontend with animations.

## License

This project is licensed under the [MIT License](LICENSE).

---
Developed by Helvanljar