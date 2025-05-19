// frontend/src/api/index.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://trello-clone-app-3rra.onrender.com/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchTasks = () => apiClient.get('/tasks/');
export const createTask = (taskData) => apiClient.post('/tasks/', taskData);
export const updateTask = (taskId, taskData) => apiClient.put(`/tasks/${taskId}/`, taskData);
export const deleteTask = (taskId) => apiClient.delete(`/tasks/${taskId}/`);