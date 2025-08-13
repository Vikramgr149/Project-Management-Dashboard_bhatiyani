/**
 * API Service - Centralized API communication
 * 
 * This service provides a centralized way to communicate with the backend API.
 * Uses axios for HTTP requests and includes error handling and base configuration.
 * 
 * Features:
 * - Centralized API configuration
 * - Error handling and logging
 * - Request/response interceptors
 * - Base URL from environment variables
 */

import axios from 'axios';

// Get backend URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to log outgoing requests
 */
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common response patterns
 */
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API methods for different resources
 */
export const projectsApi = {
  /**
   * Get all projects
   * @returns {Promise} API response with projects array
   */
  getAll: () => api.get('/projects'),
  
  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @returns {Promise} API response with project data
   */
  getById: (id) => api.get(`/projects/${id}`),
  
  /**
   * Create new project
   * @param {Object} projectData - Project data
   * @returns {Promise} API response with created project
   */
  create: (projectData) => api.post('/projects', projectData),
  
  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} API response with updated project
   */
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  
  /**
   * Delete project
   * @param {string} id - Project ID
   * @returns {Promise} API response
   */
  delete: (id) => api.delete(`/projects/${id}`),
  
  /**
   * Get AI insights for project
   * @param {string} id - Project ID
   * @returns {Promise} API response with insights
   */
  getInsights: (id) => api.get(`/ai/insights/${id}`)
};

export const tasksApi = {
  /**
   * Get all tasks or tasks for specific project
   * @param {string} projectId - Optional project ID to filter tasks
   * @returns {Promise} API response with tasks array
   */
  getAll: (projectId = null) => {
    const params = projectId ? { project_id: projectId } : {};
    return api.get('/tasks', { params });
  },
  
  /**
   * Get task by ID
   * @param {string} id - Task ID
   * @returns {Promise} API response with task data
   */
  getById: (id) => api.get(`/tasks/${id}`),
  
  /**
   * Create new task
   * @param {Object} taskData - Task data
   * @returns {Promise} API response with created task
   */
  create: (taskData) => api.post('/tasks', taskData),
  
  /**
   * Update task
   * @param {string} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} API response with updated task
   */
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  /**
   * Delete task
   * @param {string} id - Task ID
   * @returns {Promise} API response
   */
  delete: (id) => api.delete(`/tasks/${id}`)
};

export const usersApi = {
  /**
   * Get all users
   * @returns {Promise} API response with users array
   */
  getAll: () => api.get('/users'),
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} API response with user data
   */
  getById: (id) => api.get(`/users/${id}`),
  
  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} API response with created user
   */
  create: (userData) => api.post('/users', userData),
  
  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} API response with updated user
   */
  update: (id, userData) => api.put(`/users/${id}`, userData),
  
  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise} API response
   */
  delete: (id) => api.delete(`/users/${id}`)
};

export const analyticsApi = {
  /**
   * Get project analytics
   * @returns {Promise} API response with project analytics
   */
  getProjects: () => api.get('/analytics/projects'),
  
  /**
   * Get task analytics
   * @returns {Promise} API response with task analytics
   */
  getTasks: () => api.get('/analytics/tasks')
};

// Export the main api instance
export { api };

// Default export
export default api;