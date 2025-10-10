// Configuration for API endpoints
// This will be updated once we have the Railway URL

// Always use Railway backend for now
export const API_BASE_URL = 'https://desieventsleeds-production.up.railway.app';

export const getApiUrl = (endpoint: string) => {
  // If endpoint already starts with http, use it as-is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If endpoint starts with /api, prepend the base URL
  if (endpoint.startsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // Otherwise, assume it's a full URL
  return endpoint;
};
