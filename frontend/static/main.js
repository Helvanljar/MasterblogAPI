/**
 * Initializes the page by loading saved API base URL and fetching posts.
 */
window.onload = function() {
  const savedBaseUrl = localStorage.getItem('apiBaseUrl');
  if (savedBaseUrl) {
    document.getElementById('api-base-url').value = savedBaseUrl;
    loadPosts();
  }
};

/**
 * Fetches and displays all blog posts from the API.
 */
function loadPosts() {
  let baseUrl = document.getElementById('api-base-url').value;
  localStorage.setItem('apiBaseUrl', baseUrl);
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  fetch(baseUrl + 'posts')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    })
    .then(data => {
      const postContainer = document.getElementById('post-container');
      postContainer.innerHTML = '';
      data.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `<h2>${post.title}</h2><p>${post.content}</p>
          <button onclick="deletePost(${post.id})">Delete</button>`;
        postContainer.appendChild(postDiv);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      showError('Failed to load posts. Check the API URL.');
    });
}

/**
 * Adds a new blog post via the API.
 */
function addPost() {
  const baseUrl = document.getElementById('api-base-url').value;
  const postTitle = document.getElementById('post-title').value.trim();
  const postContent = document.getElementById('post-content').value.trim();

  if (!postTitle || !postContent) {
    showError('Please enter both title and content.');
    return;
  }

  const finalBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

  fetch(finalBaseUrl + 'posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: postTitle, content: postContent })
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add post');
      return response.json();
    })
    .then(post => {
      console.log('Post added:', post);
      document.getElementById('post-title').value = '';
      document.getElementById('post-content').value = '';
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
  let baseUrl = document.getElementById('api-base-url').value;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  fetch(baseUrl + 'posts/' + postId, {
    method: 'DELETE'
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
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.marginBottom = '10px';
  errorDiv.textContent = message;
  document.getElementById('post-container').prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}