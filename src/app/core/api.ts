import axios from 'axios';

// Shared Axios instance; requests to `/api/*` are proxied to the Express server in dev.
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});
