from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

POSTS = [
    {"id": 1, "title": "First post", "content": "This is the first post."},
    {"id": 2, "title": "Second post", "content": "This is the second post."},
]


@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Return the list of blog posts, optionally sorted by field and direction."""
    sort_field = request.args.get('sort')
    direction = request.args.get('direction', 'asc').lower()

    if sort_field and sort_field not in ['title', 'content']:
        return jsonify({"error": "Invalid sort field. Use 'title' or 'content'"}), 400
    if direction not in ['asc', 'desc']:
        return jsonify({"error": "Invalid direction. Use 'asc' or 'desc'"}), 400

    posts = POSTS.copy()
    if sort_field:
        reverse = direction == 'desc'
        posts.sort(key=lambda x: x[sort_field].lower(), reverse=reverse)

    return jsonify(posts)


@app.route('/api/posts', methods=['POST'])
def add_post():
    """Add a new blog post with a unique ID."""
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400
    title = data.get('title')
    content = data.get('content')
    if not title or not content:
        missing_fields = []
        if not title:
            missing_fields.append("title")
        if not content:
            missing_fields.append("content")
        error_msg = f"Missing required fields: {', '.join(missing_fields)}"
        return jsonify({"error": error_msg}), 400

    new_id = max((post['id'] for post in POSTS), default=0) + 1
    new_post = {"id": new_id, "title": title, "content": content}
    POSTS.append(new_post)
    return jsonify(new_post), 201


@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a blog post by its ID."""
    global POSTS
    post = next((post for post in POSTS if post['id'] == post_id), None)
    if not post:
        return jsonify({"error": f"Post with id {post_id} not found"}), 404
    POSTS = [post for post in POSTS if post['id'] != post_id]
    success_msg = f"Post with id {post_id} has been deleted successfully."
    return jsonify({"message": success_msg}), 200


@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Update a blog post's title and/or content by its ID."""
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

    return jsonify(post), 200


@app.route('/api/posts/search', methods=['GET'])
def search_posts():
    """Search posts by title or content using query parameters."""
    title_query = request.args.get('title', '').lower()
    content_query = request.args.get('content', '').lower()
    filtered_posts = [
        post for post in POSTS
        if (title_query in post['title'].lower() or
            content_query in post['content'].lower())
    ]
    return jsonify(filtered_posts)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)