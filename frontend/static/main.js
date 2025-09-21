/**
 * Initializes the page by loading saved API base URL and token.
 */
window.onload = function() {
  const savedBaseUrl = localStorage.getItem('apiBaseUrl');
  if (savedBaseUrl) {
    document.getElementById('api-base-url').value = savedBaseUrl;
  }
  updateAuthSection();
};

/**
 * Updates the authentication section based on login status.
 */
function updateAuthSection() {
  const token = localStorage.getItem('jwtToken');
  const authSection = document.getElementById('auth-section');
  if (token) {
    authSection.innerHTML = `
      <button onclick="logout()" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Logout</button>`;
  } else {
    authSection.innerHTML = `
      <input type="text" id="username" placeholder="Username" class="border rounded-md p-2 flex-1">
      <input type="password" id="password" placeholder="Password" class="border rounded-md p-2 flex-1">
      <button onclick="register()" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Register</button>
      <button onclick="login()" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Login</button>`;
  }
}

/**
 * Registers a new user.
 */
function register() {
  const baseUrl = getBaseUrl();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showError('Please enter both username and password.');
    return;
  }

  fetch(baseUrl + '/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(response => {
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    })
    .then(data => {
      showError(data.message, 'green');
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Registration failed: ' + error.message);
    });
}

/**
 * Logs in a user and stores the JWT token.
 */
function login() {
  const baseUrl = getBaseUrl();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showError('Please enter both username and password.');
    return;
  }

  fetch(baseUrl + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(response => {
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    })
    .then(data => {
      localStorage.setItem('jwtToken', data.access_token);
      updateAuthSection();
      showError('Login successful', 'green');
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      loadPosts();
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Login failed: ' + error.message);
    });
}

/**
 * Logs out the user by removing the JWT token.
 */
function logout() {
  localStorage.removeItem('jwtToken');
  updateAuthSection();
  showError('Logged out successfully', 'green');
  loadPosts();
}

/**
 * Gets the API base URL with a trailing slash.
 * @returns {string} The formatted base URL.
 */
function getBaseUrl() {
  let baseUrl = document.getElementById('api-base-url').value.trim();
  localStorage.setItem('apiBaseUrl', baseUrl);
  return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
}

/**
 * Fetches and displays paginated blog posts with optional sorting.
 */
let currentPage = 1;
function loadPosts() {
  const baseUrl = getBaseUrl();
  const sortField = document.getElementById('sort-field').value;
  const sortDirection = document.getElementById('sort-direction').value;
  const perPage = 10;

  let url = `${baseUrl}posts?page=${currentPage}&per_page=${perPage}`;
  if (sortField) {
    url += `&sort=${sortField}&direction=${sortDirection}`;
  }

  fetch(url, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    })
    .then(data => {
      const postContainer = document.getElementById('post-container');
      postContainer.innerHTML = '';
      data.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'bg-white p-6 rounded-lg shadow-md';
        postDiv.innerHTML = `
          <h2 class="text-xl font-semibold text-gray-800 mb-2">${post.title}</h2>
          <p class="text-gray-600"><strong>Author:</strong> ${post.author || 'Unknown'}</p>
          <p class="text-gray-600"><strong>Date:</strong> ${post.date || 'N/A'}</p>
          <p class="text-gray-600"><strong>Category:</strong> ${post.category || 'None'}</p>
          <p class="text-gray-600"><strong>Tags:</strong> ${post.tags.length ? post.tags.join(', ') : 'None'}</p>
          <p class="text-gray-700 mt-2">${post.content}</p>
          <div class="mt-4">
            <h3 class="text-lg font-semibold text-gray-700">Comments</h3>
            <ul class="list-disc pl-5 mt-2">
              ${post.comments.map(c => `<li class="text-gray-600">${c.author}: ${c.text}</li>`).join('') || '<li class="text-gray-500">No comments</li>'}
            </ul>
            <div class="flex gap-2 mt-2">
              <input type="text" id="comment-${post.id}" placeholder="Add a comment" class="border rounded-md p-2 flex-1">
              <button onclick="addComment(${post.id})" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Comment</button>
            </div>
          </div>
          <button onclick="deletePost(${post.id})" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Delete</button>`;
        postContainer.appendChild(postDiv);
      });
      document.getElementById('page-info').textContent = `Page ${data.page} of ${Math.ceil(data.total / data.per_page)}`;
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Failed to load posts: ' + error.message);
    });
}

/**
 * Moves to the previous page of posts.
 */
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadPosts();
  }
}

/**
 * Moves to the next page of posts.
 */
function nextPage() {
  currentPage++;
  loadPosts();
}

/**
 * Adds a new blog post via the API.
 */
function addPost() {
  const baseUrl = getBaseUrl();
  const postTitle = document.getElementById('post-title').value.trim();
  const postContent = document.getElementById('post-content').value.trim();
  const postAuthor = document.getElementById('post-author').value.trim();
  const postDate = document.getElementById('post-date').value.trim();
  const postCategory = document.getElementById('post-category').value.trim();
  const postTags = document.getElementById('post-tags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);

  if (!postTitle || !postContent) {
    showError('Please enter both title and content.');
    return;
  }

  if (!localStorage.getItem('jwtToken')) {
    showError('Please log in to add a post.');
    return;
  }

  const postData = { title: postTitle, content: postContent };
  if (postAuthor) postData.author = postAuthor;
  if (postDate) postData.date = postDate;
  if (postCategory) postData.category = postCategory;
  if (postTags.length) postData.tags = postTags;

  fetch(baseUrl + 'posts', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData)
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add post');
      return response.json();
    })
    .then(post => {
      console.log('Post added:', post);
      document.getElementById('post-title').value = '';
      document.getElementById('post-content').value = '';
      document.getElementById('post-author').value = '';
      document.getElementById('post-date').value = '';
      document.getElementById('post-category').value = '';
      document.getElementById('post-tags').value = '';
      loadPosts();
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Failed to add post: ' + error.message);
    });
}

/**
 * Deletes a blog post by its ID via the API.
 * @param {number} postId - The ID of the post to delete.
 */
function deletePost(postId) {
  const baseUrl = getBaseUrl();

  if (!localStorage.getItem('jwtToken')) {
    showError('Please log in to delete a post.');
    return;
  }

  fetch(baseUrl + 'posts/' + postId, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete post');
      console.log('Post deleted:', postId);
      loadPosts();
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Failed to delete post: ' + error.message);
    });
}

/**
 * Adds a comment to a blog post via the API.
 * @param {number} postId - The ID of the post to comment on.
 */
function addComment(postId) {
  const baseUrl = getBaseUrl();
  const commentText = document.getElementById(`comment-${postId}`).value.trim();

  if (!commentText) {
    showError('Please enter a comment.');
    return;
  }

  if (!localStorage.getItem('jwtToken')) {
    showError('Please log in to add a comment.');
    return;
  }

  fetch(baseUrl + `posts/${postId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text: commentText })
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    })
    .then(comment => {
      console.log('Comment added:', comment);
      document.getElementById(`comment-${postId}`).value = '';
      loadPosts();
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Failed to add comment: ' + error.message);
    });
}

/**
 * Searches posts by title, content, author, date, category, or tags with pagination.
 */
function searchPosts() {
  const baseUrl = getBaseUrl();
  const title = document.getElementById('search-title').value.trim();
  const content = document.getElementById('search-content').value.trim();
  const author = document.getElementById('search-author').value.trim();
  const date = document.getElementById('search-date').value.trim();
  const category = document.getElementById('search-category').value.trim();
  const tags = document.getElementById('search-tags').value.trim();

  let url = `${baseUrl}posts/search?page=${currentPage}&per_page=10`;
  if (title) url += `&title=${encodeURIComponent(title)}`;
  if (content) url += `&content=${encodeURIComponent(content)}`;
  if (author) url += `&author=${encodeURIComponent(author)}`;
  if (date) url += `&date=${encodeURIComponent(date)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (tags) url += `&tags=${encodeURIComponent(tags)}`;

  fetch(url, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to search posts');
      return response.json();
    })
    .then(data => {
      const postContainer = document.getElementById('post-container');
      postContainer.innerHTML = '';
      data.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'bg-white p-6 rounded-lg shadow-md';
        postDiv.innerHTML = `
          <h2 class="text-xl font-semibold text-gray-800 mb-2">${post.title}</h2>
          <p class="text-gray-600"><strong>Author:</strong> ${post.author || 'Unknown'}</p>
          <p class="text-gray-600"><strong>Date:</strong> ${post.date || 'N/A'}</p>
          <p class="text-gray-600"><strong>Category:</strong> ${post.category || 'None'}</p>
          <p class="text-gray-600"><strong>Tags:</strong> ${post.tags.length ? post.tags.join(', ') : 'None'}</p>
          <p class="text-gray-700 mt-2">${post.content}</p>
          <div class="mt-4">
            <h3 class="text-lg font-semibold text-gray-700">Comments</h3>
            <ul class="list-disc pl-5 mt-2">
              ${post.comments.map(c => `<li class="text-gray-600">${c.author}: ${c.text}</li>`).join('') || '<li class="text-gray-500">No comments</li>'}
            </ul>
            <div class="flex gap-2 mt-2">
              <input type="text" id="comment-${post.id}" placeholder="Add a comment" class="border rounded-md p-2 flex-1">
              <button onclick="addComment(${post.id})" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Comment</button>
            </div>
          </div>
          <button onclick="deletePost(${post.id})" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Delete</button>`;
        postContainer.appendChild(postDiv);
      });
      document.getElementById('page-info').textContent = `Page ${data.page} of ${Math.ceil(data.total / data.per_page)}`;
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Failed to search posts: ' + error.message);
    });
}

/**
 * Returns headers with JWT token if available.
 * @returns {Object} Headers object.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('jwtToken');
  return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
}

/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {string} [color='red'] - The color of the message.
 */
function showError(message, color = 'red') {
  const errorDiv = document.createElement('div');
  errorDiv.className = `text-${color}-500 bg-${color}-100 border border-${color}-500 p-2 rounded-md mb-4`;
  errorDiv.textContent = message;
  document.getElementById('post-container').prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}