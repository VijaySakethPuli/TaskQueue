const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, method = 'GET', data) {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'API error');
  return resData;
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', 'POST', data),
  login: (data) => request('/auth/login', 'POST', data),

  // Lists
  getLists: () => request('/lists'),
  createList: (data) => request('/lists', 'POST', data),
  renameList: (id, data) => request(`/lists/${id}`, 'PUT', data),
  deleteList: (id) => request(`/lists/${id}`, 'DELETE'),

  // Tasks
  getTasks: (listId) => request(`/tasks/${listId}`),
  createTask: (listId, data) => request(`/tasks/${listId}`, 'POST', data),
  updateTask: (listId, taskId, data) => request(`/tasks/${listId}/${taskId}`, 'PUT', data),
  deleteTask: (listId, taskId) => request(`/tasks/${listId}/${taskId}`, 'DELETE'),

  // Profile
  updateProfile: (data) => request('/auth/profile', 'PUT', data),
  changePassword: (data) => request('/auth/password', 'PUT', data),
}; 