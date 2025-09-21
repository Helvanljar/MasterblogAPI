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
    authSection.innerHTML = '<button onclick="logout()">Logout</button>';
  } else {
    authSection.innerHTML = `
      <input type="text" id="username" placeholder="Username">
      <input type="password" id="password" placeholder="Password">
      <button onclick="register()">Register</button>
      <button onclick="login()">Login</button>`;
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
        postDiv.className = 'post';
        postDiv.innerHTML = `<h2>${post.title}</h2>
          <p><strong>Category:</strong> ${post.category || 'None'}</p>
          <p>${post.content}</p>
          <button onclick="deletePost(${post.id})">Delete</button>`;
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
  const postCategory = document.getElementById('post-category').value.trim();

  if (!postTitle || !postContent) {
    showError('Please enter both title and content.');
    return;
  }

  if (!localStorage.getItem('jwtToken')) {
    showError('Please log in to add a post.');
    return;
  }

  fetch(baseUrl + 'posts', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title: postTitle, content: postContent, category: postCategory })
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add post');
      return response.json();
    })
    .then(post => {
      console.log('Post added:', post);
      document.getElementById('post-title').value = '';
      document.getElementById('post-content').value = '';
      document.getElementById('post-category').value = '';
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
 * Searches posts by title, content, or category with pagination.
 */
function searchPosts() {
  const baseUrl = getBaseUrl();
  const title = document.getElementById('search-title').value.trim();
  const content = document.getElementById('search-content').value.trim();
  const category = document.getElementById('search-category').value.trim();
  const perPage = 10;

  let url = `${baseUrl}posts/search?page=${currentPage}&per_page=${perPage}`;
  if (title) url += `&title=${encodeURIComponent(title)}`;
  if (content) url += `&content=${encodeURIComponent(content)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;

  fetch(url, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to search posts');
      return response.json();
    })
    .then(data => {
      const postContainer = document.getElementById('post-container');
      postContainer.innerHTML='';
      data.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `<h2>${post.title}</h2>
          <p><strong>Category:</strong> ${post.category || 'None'}</p>
          <p>${post.content}</p>
          <button onclick="deletePost(${post.id})">Delete</button>`;
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
  errorDiv.style.color = color;
  errorDiv.style.marginBottom = '10px';
  errorDiv.textContent = message;
  document.getElementById('post-container').prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}