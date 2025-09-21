from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_swagger_ui import get_swaggerui_blueprint
import datetime

app = Flask(__name__)
CORS(app)

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change in production
jwt = JWTManager(app)

# Rate limiting configuration
limiter = Limiter(app=app, key_func=get_remote_address, default_limits=["100 per day"])

# Swagger UI configuration
SWAGGER_URL = "/api/docs"
API_URL = "/static/masterblog.json"
swagger_ui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': 'Masterblog API'}
)
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

POSTS = [
    {
        "id": 1,
        "title": "First post",
        "content": "This is the first post.",
        "author": "Author One",
        "date": "2023-06-07",
        "category": "General",
        "tags": ["intro", "blog"],
        "comments": []
    },
    {
        "id": 2,
        "title": "Second post",
        "content": "This is the second post.",
        "author": "Author Two",
        "date": "2023-06-08",
        "category": "Tech",
        "tags": ["tech", "news"],
        "comments": []
    },
]

USERS = {}  # In-memory user storage: {username: {"password": str, "id": int}}


@app.route('/api/v1/register', methods=['POST'])
@limiter.limit("10 per hour")
def register():
    """Register a new user."""
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if username in USERS:
        return jsonify({"error": "Username already exists"}), 400
    USERS[username] = {"password": password, "id": len(USERS) + 1}
    return jsonify({"message": "User registered successfully"}), 201


@app.route('/api/v1/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    """Log in a user and return a JWT token."""
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    user = USERS.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    access_token = create_access_token(identity=username, expires_delta=datetime.timedelta(hours=1))
    return jsonify({"access_token": access_token}), 200


@app.route('/api/v1/posts', methods=['GET'])
@limiter.limit("50 per hour")
def get_posts():
    """Return a paginated list of blog posts, optionally sorted."""
    sort_field = request.args.get('sort')
    direction = request.args.get('direction', 'asc').lower()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    if sort_field and sort_field not in ['title', 'content', 'category', 'author', 'date']:
        return jsonify({"error": "Invalid sort field. Use 'title', 'content', 'category', 'author', or 'date'"}), 400
    if direction not in ['asc', 'desc']:
        return jsonify({"error": "Invalid direction. Use 'asc' or 'desc'"}), 400
    if page < 1 or per_page < 1:
        return jsonify({"error": "Page and per_page must be positive integers"}), 400

    posts = POSTS.copy()
    if sort_field:
        reverse = direction == 'desc'
        if sort_field == 'date':
            posts.sort(key=lambda x: datetime.datetime.strptime(x.get('date', '0001-01-01'), "%Y-%m-%d"),
                       reverse=reverse)
        else:
            posts.sort(key=lambda x: str(x.get(sort_field, '')).lower(), reverse=reverse)

    start = (page - 1) * per_page
    end = start + per_page
    paginated_posts = posts[start:end]

    return jsonify({
        "posts": paginated_posts,
        "total": len(posts),
        "page": page,
        "per_page": per_page
    })


@app.route('/api/v1/posts', methods=['POST'])
@limiter.limit("20 per hour")
@jwt_required()
def add_post():
    """Add a new blog post with a unique ID."""
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400
    title = data.get('title')
    content = data.get('content')
    author = data.get('author', get_jwt_identity())  # Default to current user
    date = data.get('date', datetime.date.today().strftime("%Y-%m-%d"))  # Default to today

    if not title or not content:
        missing_fields = []
        if not title:
            missing_fields.append("title")
        if not content:
            missing_fields.append("content")
        error_msg = f"Missing required fields: {', '.join(missing_fields)}"
        return jsonify({"error": error_msg}), 400

    new_id = max((post['id'] for post in POSTS), default=0) + 1
    new_post = {
        "id": new_id,
        "title": title,
        "content": content,
        "author": author,
        "date": date,
        "category": data.get('category', ''),
        "tags": data.get('tags', []),
        "comments": []
    }
    POSTS.append(new_post)
    return jsonify(new_post), 201


@app.route('/api/v1/posts/<int:post_id>', methods=['DELETE'])
@limiter.limit("20 per hour")
@jwt_required()
def delete_post(post_id):
    """Delete a blog post by its ID."""
    global POSTS
    post = next((post for post in POSTS if post['id'] == post_id), None)
    if not post:
        return jsonify({"error": f"Post with id {post_id} not found"}), 404
    POSTS = [post for post in POSTS if post['id'] != post_id]
    success_msg = f"Post with id {post_id} has been deleted successfully."
    return jsonify({"message": success_msg}), 200


@app.route('/api/v1/posts/<int:post_id>', methods=['PUT'])
@limiter.limit("20 per hour")
@jwt_required()
def update_post(post_id):
    """Update a blog post's title, content, author, date, category, or tags by its ID."""
    global POSTS
    post = next((post for post in POSTS if post['id'] == post_id), None)
    if not post:
        return jsonify({"error": f"Post with id {post_id} not found"}), 404

    data = request.get_json() or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400

    if 'title' in data:
        post['title'] = data['title']
    if 'content' in data:
        post['content'] = data['content']
    if 'author' in data:
        post['author'] = data['author']
    if 'date' in data:
        post['date'] = data['date']
    if 'category' in data:
        post['category'] = data['category']
    if 'tags' in data:
        post['tags'] = data['tags']

    return jsonify(post), 200


@app.route('/api/v1/posts/search', methods=['GET'])
@limiter.limit("50 per hour")
def search_posts():
    """Search posts by title, content, author, date, category, or tags with pagination."""
    title_query = request.args.get('title', '').lower()
    content_query = request.args.get('content', '').lower()
    author_query = request.args.get('author', '').lower()
    date_query = request.args.get('date', '')
    category_query = request.args.get('category', '').lower()
    tags_query = request.args.get('tags', '').lower().split(',')
    tags_query = [tag.strip() for tag in tags_query if tag.strip()]
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    if page < 1 or per_page < 1:
        return jsonify({"error": "Page and per_page must be positive integers"}), 400

    filtered_posts = [
        post for post in POSTS
        if (title_query in post['title'].lower() or
            content_query in post['content'].lower() or
            author_query in post['author'].lower() or
            (date_query and date_query in post['date']) or
            category_query in post['category'].lower() or
            (tags_query and any(tag.lower() in [t.lower() for t in post['tags']] for tag in tags_query)))
    ]

    start = (page - 1) * per_page
    end = start + per_page
    paginated_posts = filtered_posts[start:end]

    return jsonify({
        "posts": paginated_posts,
        "total": len(filtered_posts),
        "page": page,
        "per_page": per_page
    })


@app.route('/api/v1/posts/<int:post_id>/comments', methods=['POST'])
@limiter.limit("20 per hour")
@jwt_required()
def add_comment(post_id):
    """Add a comment to a blog post by its ID."""
    global POSTS
    post = next((post for post in POSTS if post['id'] == post_id), None)
    if not post:
        return jsonify({"error": f"Post with id {post_id} not found"}), 404

    data = request.get_json() or {}
    if not isinstance(data, dict) or 'text' not in data or not data['text']:
        return jsonify({"error": "Comment text is required"}), 400

    comment_id = len(post['comments']) + 1
    new_comment = {
        "id": comment_id,
        "text": data['text'],
        "author": get_jwt_identity()
    }
    post['comments'].append(new_comment)
    return jsonify(new_comment), 201


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)