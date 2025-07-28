// src/config/api.ts
const BASE_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.sanskaraai.com' // Replace with your production API URL
  : 'http://localhost:8765'; // Local API backend

export { BASE_API_URL };