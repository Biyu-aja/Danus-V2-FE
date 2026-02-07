// API Configuration
// Use environment variable in production, fallback to localhost for development
const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// Ensure /api suffix is present
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

export default API_BASE_URL;
