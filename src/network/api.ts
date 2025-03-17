import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.trapcall.com/v4',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;