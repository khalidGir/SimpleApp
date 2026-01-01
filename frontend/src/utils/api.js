const API_BASE = 'https://simpleapp-gp8l.onrender.com';

/**
 * Helper to handle fetch responses and errors.
 */
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    // If JSON parsing fails (e.g. 502/503 HTML from proxy), treat as service error
    throw new Error('Service unavailable, please try again later.');
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
};

/**
 * Wrapper for fetch that handles auth headers and errors.
 * @param {string} endpoint - The API endpoint (e.g., '/urls').
 * @param {object} options - Fetch options.
 * @returns {Promise<any>} - The response data.
 */
export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Service unavailable, please try again later.');
    }
    throw error;
  }
};

/**
 * Public fetch wrapper for login/register.
 */
export const publicFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Service unavailable, please try again later.');
    }
    throw error;
  }
};
