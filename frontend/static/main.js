let currentPage = 1;
let perPage = 10;
let totalPosts = 0;
let token = localStorage.getItem('token') || null;

function displayMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mt-4 p-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    messageDiv.textContent = message;
    document.querySelector('.container').prepend(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

async function makeRequest(endpoint, method = 'GET', data = null, includeToken = false) {
    const baseUrl = document.getElementById('api-base-url').value;
    const headers = { 'Content-Type': 'application/json' };
    if (includeToken && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const config = { method, headers };
    if (data) {
        config.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(`${baseUrl}${endpoint}`, config);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        displayMessage(error.message, true);
        throw error;
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) {
        displayMessage('Username and password are required', true);
        return;
    }
    try {
        const data = await makeRequest('/register', 'POST', { username, password });
        displayMessage(data.message);
    } catch (error) {}
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) {
        displayMessage('Username and password are required', true);
        return;
    }
    try {
        const data = await makeRequest('/login', 'POST', { username, password });
        token = data.access_token;
        localStorage.setItem('token', token);
        displayMessage('Login successful');
        loadPosts();
    } catch (error) {}
}

async function loadPosts() {
    const sortField = document.getElementById('sort-field').value;
    const sortDirection = document.getElementById('sort-direction').value;
    const queryParams = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
        ...(sortField && { sort: sortField, direction: sortDirection })
    });
    try {
        const data = await makeRequest(`/posts?${queryParams}`);
        totalPosts = data.total;
        document.getElementById('page-info').textContent = `Page ${data.page} of ${Math.ceil(totalPosts / perPage)}`;
        displayPosts(data.posts);
    } catch (error) {}
}

function displayPosts(posts) {
    const container = document.getElementById('post-container');
    container.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'bg-white p-6 rounded-lg shadow-md';
        postDiv.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800">${post.title}</h3>
            <p class="text-gray-600 mt-2">${post.content}</p>
            <p class="text-gray-500 mt-2">By: ${post.author} | Date: ${post.date}</p>
            <p class="text-gray-500">Category: ${post.category || 'None'}</p>
            <p class="text-gray-500">Tags: ${post.tags.join(', ') || 'None'}</p>
            <div class="mt-4">
                <h4 class="text-md font-semibold text-gray-700">Comments:</h4>
                ${post.comments.map(c => `
                    <div class="flex justify-between items-center">
                        <p class="text-gray-600">${c.author}: ${c.text}</p>
                        ${token && c.author === localStorage.getItem('username') ? `
                            <button onclick="deleteComment(${post.id}, ${c.id})" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
                        ` : ''}
                    </div>
                `).join('')}
                ${token ? `
                    <input type="text" id="comment-${post.id}" placeholder="Add a comment" class="border rounded-md p-2 mt-2 w-full">
                    <button onclick="addComment(${post.id})" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Comment</button>
                    <button onclick="deletePost(${post.id})" class="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Delete</button>
                ` : ''}
            </div>
        `;
        container.appendChild(postDiv);
    });
}

async function addPost() {
    if (!token) {
        displayMessage('Please login to add a post', true);
        return;
    }
    const post = {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value,
        author: document.getElementById('post-author').value || undefined,
        date: document.getElementById('post-date').value || undefined,
        category: document.getElementById('post-category').value || undefined,
        tags: document.getElementById('post-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag) || undefined
    };
    try {
        await makeRequest('/posts', 'POST', post, true);
        displayMessage('Post added successfully');
        loadPosts();
    } catch (error) {}
}

async function deletePost(postId) {
    if (!token) {
        displayMessage('Please login to delete a post', true);
        return;
    }
    try {
        const data = await makeRequest(`/posts/${postId}`, 'DELETE', null, true);
        displayMessage(data.message);
        loadPosts();
    } catch (error) {}
}

async function addComment(postId) {
    if (!token) {
        displayMessage('Please login to comment', true);
        return;
    }
    const text = document.getElementById(`comment-${postId}`).value;
    if (!text) {
        displayMessage('Comment text is required', true);
        return;
    }
    try {
        await makeRequest(`/posts/${postId}/comments`, 'POST', { text }, true);
        displayMessage('Comment added successfully');
        loadPosts();
    } catch (error) {}
}

async function deleteComment(postId, commentId) {
    if (!token) {
        displayMessage('Please login to delete a comment', true);
        return;
    }
    try {
        const data = await makeRequest(`/posts/${postId}/comments/${commentId}`, 'DELETE', null, true);
        displayMessage(data.message);
        loadPosts();
    } catch (error) {}
}

async function searchPosts() {
    const queryParams = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
        ...(document.getElementById('search-title').value && { title: document.getElementById('search-title').value }),
        ...(document.getElementById('search-content').value && { content: document.getElementById('search-content').value }),
        ...(document.getElementById('search-author').value && { author: document.getElementById('search-author').value }),
        ...(document.getElementById('search-date').value && { date: document.getElementById('search-date').value }),
        ...(document.getElementById('search-category').value && { category: document.getElementById('search-category').value }),
        ...(document.getElementById('search-tags').value && { tags: document.getElementById('search-tags').value })
    });
    try {
        const data = await makeRequest(`/posts/search?${queryParams}`);
        totalPosts = data.total;
        document.getElementById('page-info').textContent = `Page ${data.page} of ${Math.ceil(totalPosts / perPage)}`;
        displayPosts(data.posts);
    } catch (error) {}
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPosts();
    }
}

function nextPage() {
    if (currentPage < Math.ceil(totalPosts / perPage)) {
        currentPage++;
        loadPosts();
    }
}

// Store username after login
document.getElementById('login').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) localStorage.setItem('username', username);
});