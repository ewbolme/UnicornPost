import axios from 'axios';
import { store } from '../store';
import { BASE_URL } from '../api/_config';

const api = axios.create({
  baseURL: `${BASE_URL}`,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.IdToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;
