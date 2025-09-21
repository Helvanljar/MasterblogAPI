Masterblog

Masterblog is a robust, full-stack web application designed for creating, managing, and displaying blog posts. It features a Flask-based RESTful API with persistent JSON storage and a responsive, modern frontend built with HTML, JavaScript, and Tailwind CSS. The application supports user authentication, post CRUD operations, commenting, advanced search, sorting, pagination, and comprehensive API documentation via Swagger UI.
Table of Contents

Overview
Features
Tech Stack
Installation
Usage
API Reference
File Structure
Contributing
Future Enhancements
License

Overview
Masterblog provides a seamless platform for users to create, read, update, and delete blog posts, with features like user authentication, commenting, and advanced filtering. The backend API is built with Flask and stores data in a JSON file for persistence, while the frontend offers an intuitive, responsive interface styled with Tailwind CSS. The project is designed for scalability and ease of use, with Swagger UI for API exploration.
Features
Backend (Flask API)

CRUD Operations: Create, read, update, and delete posts via /api/v1/posts endpoints.
User Authentication: Secure registration (/api/v1/register) and login (/api/v1/login) with JWT.
Extended Post Model: Posts include id, title, content, author, date, category, tags, and comments.
Search & Sorting: Filter posts by multiple fields (title, content, author, date, category, tags) with pagination; sort by any field, including proper date sorting.
Commenting: Add comments to posts via /api/v1/posts/<id>/comments.
Rate Limiting: Enforces limits (100/day general, 20/hour for POST/PUT/DELETE, 10/hour for register/login).
Persistent Storage: Stores posts in posts.json for data persistence.
API Documentation: Interactive Swagger UI at /api/docs.

Frontend

Responsive, modern UI styled with Tailwind CSS.
Displays post details (author, date, category, tags, comments).
Supports post creation, deletion, commenting, searching, sorting, and pagination.
User-friendly authentication interface (register, login, logout).
Real-time error messaging for user feedback.

Tech Stack



Component
Technology



Backend
Python 3.8+, Flask, Flask-CORS, Flask-JWT-Extended, Flask-Limiter, Flask-Swagger-UI


Frontend
HTML, JavaScript, Tailwind CSS (CDN)


Storage
JSON (posts.json)


API Docs
Swagger UI


Installation
Prerequisites

Python 3.8 or higher
Git
Postman (optional, for API testing)

Clone the Repository
git clone https://github.com/<Helvanljar>/MasterblogAPI.git
cd MasterblogAPI

Backend Setup

Navigate to the backend directory:cd backend


Create and activate a virtual environment (recommended):python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install dependencies:pip install flask flask-cors flask-jwt-extended flask-limiter flask-swagger-ui


Run the backend server:python backend_app.py

The API is available at http://localhost:5002. Swagger UI is at http://localhost:5002/api/docs.

Frontend Setup

Navigate to the frontend directory:cd frontend


Create and activate a virtual environment (recommended):python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install Flask (if not already installed):pip install flask


Run the frontend server:python frontend_app.py

The frontend is available at http://localhost:5001.

Usage
Backend
The Flask API provides the following endpoints:



Method
Endpoint
Description



POST
/api/v1/register
Register a new user ({username, password})


POST
/api/v1/login
Login and receive a JWT token ({username, password})


GET
/api/v1/posts
List posts with pagination and sorting (?page=1&per_page=10&sort=field&direction=asc)


POST
/api/v1/posts
Create a post ({title, content, author?, date?, category?, tags?}, requires JWT)


PUT
/api/v1/posts/<id>
Update a post (requires JWT)


DELETE
/api/v1/posts/<id>
Delete a post (requires JWT)


GET
/api/v1/posts/search
Search posts (?title=term&content=term&author=term&date=YYYY-MM-DD&category=term&tags=term1,term2)


POST
/api/v1/posts/<id>/comments
Add a comment ({text}, requires JWT)



Testing: Use Postman or Swagger UI (http://localhost:5002/api/docs) to interact with the API. For authenticated endpoints, include the JWT token in the Authorization header as Bearer <token>.

Frontend

Access the frontend at http://localhost:5001.
Authentication: Register or login using the provided fields.
API Configuration: Set the API base URL (default: http://127.0.0.1:5002/api/v1).
Create Posts: Enter title, content, and optional fields (author, date, category, tags).
Search/Sort: Filter posts by multiple fields or sort by any field.
Comment: Add comments to posts (requires login).
Pagination: Navigate pages using Previous/Next buttons.

API Reference
Interactive API documentation is available via Swagger UI at http://localhost:5002/api/docs. This interface allows you to explore endpoints, test requests, and view response schemas.
File Structure
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
└── README.md               # Project documentation

Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request with a detailed description of your changes.

Please ensure your code adheres to PEP 8 for Python and uses consistent JavaScript formatting. Include tests where applicable.
Future Enhancements

Implement a PUT endpoint in the frontend for editing posts.
Add a "like" feature for posts with a counter.
Transition from JSON storage to a database (e.g., SQLite, MongoDB).
Introduce user roles (e.g., admin for comment moderation).
Enhance frontend with animations or additional styling options.

License
This project is licensed under the MIT License.
