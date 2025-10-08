// Token-based authentication helper for serverless deployment

export const authHelper = {
  // Store authentication token
  setToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    }
  },

  // Get authentication token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Remove authentication token
  clearToken() {
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get authorization header
  getAuthHeader() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  // Make authenticated fetch request
  async fetchWithAuth(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  },
};
