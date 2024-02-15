import axios from 'axios';
import { BASE_URL } from './_config';
import { handleLocalAuthFetch } from "../services/storage.service";
import { handleRefreshToken } from '../services/auth.service';

class HomeApi {
  constructor() {

    this.api = axios.create({
      baseURL: `${BASE_URL}`,
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await handleLocalAuthFetch();
        if (token) {
          config.headers.Authorization = `Bearer ${JSON.parse(token)?.data?.id_token || ""}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.GetBreakingNews = async (diversity) => {
      try {
        const result = await this.api.get(`/breaking-news?diversity=${diversity}`);
        return result; 
       
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    };

    
    this.GetGenreNews = async (genre, page) => {
      try {
        const result = await this.api.get(`/news-for-you?page=${page ? page : `1`}${genre !== "" ? `&genre=${genre}` : ""}`);
        return result.data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    };

    this.GetGenreTypes = async () => {
      try {
        const result = await this.api.get(`/genres`);
        return result.data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    };

    this.createNewArticleApi = async (data) => {
      try {
        const result = await this.api.post('/new-article', data);
        return result.data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    };

    this.GetArticleByUser = async (userId) => {
      try {
        const result = await this.api.get(`/last-articles-by-user?user_id=${userId}`);
        return result.data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    };
    
    this.GetArticleById = async (articleId, clusterId) => {
      try {
        const result = await this.api.get(`/article-details/${articleId}/${clusterId}`);
        return result.data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    }

    this.InteractionCheck = async (data) => {
      try {
        const result = await this.api.post(`/user-interactions`,data);
        return result.data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.data?.message === "Expired token") {
          handleRefreshToken();
        }
      }
    }

  }
}

const Api = new HomeApi();
export default Api;
