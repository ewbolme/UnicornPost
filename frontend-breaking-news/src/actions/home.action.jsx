
import {
    BREAKING_NEWS_REQUEST,
    BREAKING_NEWS_RESOLVE,
    BREAKING_NEWS_REJECT,
    NEWS_BY_GENRE_REQUEST,
    NEWS_BY_GENRE_RESOLVE,
    NEWS_BY_GENRE_REJECT,
    NEWS_ARTICLE_REQUEST,
    NEWS_ARTICLE_RESOLVE,
    NEWS_ARTICLE_REJECT,
    ARTICLES_BY_USER_REQUEST,
    ARTICLES_BY_USER_RESOLVE,
    ARTICLES_BY_USER_REJECT,
    UPDATE_DIVERSITY_VALUE,
    UPDATE_DIVERSITY_VALUE_PERSONALIZED,
    UPDATE_CREATE_IN_PROGRESS_VALUE,
    CREATE_NEWS_LETTER_RESOLVE,
    CREATE_NEWS_LETTER_REJECT,
    ARTICLES_BY_ID_REQUEST,
    ARTICLES_BY_ID_RESOLVE,
    ARTICLES_BY_ID_REJECT,
    INTERACTION_CHECK_REQUEST,
    INTERACTION_CHECK_RESOLVE,
    UPDATE_CREATE_IN_PROGRESS_VALUE_NEW,
    INTERACTION_CHECK_REJECT,
    GENRE_TYPES_REQUEST,
    GENRE_TYPES_RESOLVE,
    GENRE_TYPES_REJECT,
    NEWS_ARTICLE_CONTENT,
    INTERESTED_USER_ID,
    UPDATE_NEWS_LETTER_TEMPLATE_DATA,
    CLEAR_ARTICLE_PAGE_DATA_ON_SUBMIT,
    MAINTAIN_GEN_AI_CHECK,
    UPDATE_IS_EMAIL_DATA,
    GET_USER_ID,
    UPDATE_PAGE_MAP_VALUE,
    UPDATE_ARTICLE_IN_PROGRESS,
    UPDATE_SELECTED_GENRE
  } from '../actionTypes/home.type';
  
  import Api from '../api/home.api';
  
  export const getBreakingNews = (diversity) => async (dispatch) => {
    dispatch({ type: BREAKING_NEWS_REQUEST });
    try {
      const result = await Api.GetBreakingNews(diversity);
      if(result.error !== true)  {
        dispatch({ 
          type: BREAKING_NEWS_RESOLVE,
          payload: {
            list: result?.data?.data || [],
            more_articles:result?.data?.data?.more_articles || false,
          }
        });
        return true;
      }
  
      dispatch({
        type: BREAKING_NEWS_REJECT,
        payload: []
      });
      return false;
  
    } catch (error) {
      dispatch({ 
        type: BREAKING_NEWS_REJECT, 
        payload: []
      });
      return false;
    }
  }

  export const getGenreNews = (genre, page) => async (dispatch) => {
    dispatch({ type: NEWS_BY_GENRE_REQUEST });
    try {
      const result = await Api.GetGenreNews(genre, page);
      if(result.error !== true)  {
        dispatch({ 
          type: NEWS_BY_GENRE_RESOLVE,
          payload: {
            data: result?.data?.articles,
            is_genre: genre === "" ? false: true,
            hasMore: result?.data?.more_articles || false,
            currentPage: page+1
          } || {}
        });
        return true;
      }
  
      dispatch({
        type: NEWS_BY_GENRE_REJECT,
        payload: {
          data: [],
          is_genre: genre === "" ? false: true,
          hasMore: false
        }
      });
      return false;
  
    } catch (error) {
      dispatch({ 
        type: NEWS_BY_GENRE_REJECT, 
        payload: {
          data: [],
          is_genre: genre === "" ? false: true,
          hasMore: false
        }
      });
      return false;
    }
  }
  
  export const createNewArticle = (data) => async (dispatch) => {
    dispatch({ type: NEWS_ARTICLE_REQUEST });
    try {
      const result = await Api.createNewArticleApi(data);
      if(result.error !== true )  {
        dispatch({ 
          type: NEWS_ARTICLE_RESOLVE,
          payload: result?.data || []
        });
        return result?.data || [];
      }
      dispatch({
        type: NEWS_ARTICLE_REJECT,
        payload: []
      });
      return [];
    } catch (error) {
      dispatch({ 
        type: NEWS_ARTICLE_REJECT, 
        payload: []
      });
      return {
        status:false,message:"Not valid information"
      };
    }
  }

  export const getArticleByUser = (userId) => async (dispatch) => {
    dispatch({ type: ARTICLES_BY_USER_REQUEST });
    dispatch({ 
      type: INTERESTED_USER_ID,
      payload: userId
    });
    try {
      const result = await Api.GetArticleByUser(userId);
      if(result.error !== true )  {
        dispatch({ 
          type: ARTICLES_BY_USER_RESOLVE,
          payload: result?.data || []
        });
        return true;
      }
  
      dispatch({
        type: ARTICLES_BY_USER_REJECT,
        payload: []
      });
      return false;
  
    } catch (error) {
      dispatch({ 
        type: ARTICLES_BY_USER_REJECT, 
        payload: []
      });
      return false;
    }
  }

  export const updateDiversitySliderValue = (diversity) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_DIVERSITY_VALUE,
      payload: diversity
    });
  }

  export const storeUserArticleInProgress = (value) => async (dispatch) => {
    dispatch({
      type: UPDATE_ARTICLE_IN_PROGRESS,
      payload: value
    })
  }

  export const storeSelectedGenreValue = (value) => async (dispatch) => {
    dispatch({
      type: UPDATE_SELECTED_GENRE,
      payload: value
    })
  }

  export const updateDiversitySliderValuePersonalized = (diversity) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_DIVERSITY_VALUE_PERSONALIZED,
      payload: diversity
    });
  }


  export const UpdateCreateInProgress = (createInProgress) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_CREATE_IN_PROGRESS_VALUE,
      payload: createInProgress
    });
  }

  export const UpdateCreateInProgressNew = (createInProgressNew) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_CREATE_IN_PROGRESS_VALUE_NEW,
      payload: createInProgressNew
    });
  }

  export const UpdatePageMappingData = (checkBoxValue, sliderValue) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_PAGE_MAP_VALUE,
      payload: {
        checkBoxValue : checkBoxValue,
        sliderValue : sliderValue
      }
    });
  }


  export const getUserId = (id) => async (dispatch) => {
    dispatch({ 
      type: GET_USER_ID,
      payload: id
    });
  }

  export const updateNewsLetterTemplateData = (newsLetterTemplateData) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_NEWS_LETTER_TEMPLATE_DATA,
      payload: newsLetterTemplateData
    });
  }


  export const updateIsEmailValid = (value) => async (dispatch) => {
    dispatch({ 
      type: UPDATE_IS_EMAIL_DATA,
      payload: value
    });
  }

  export const storeNewArticleContent = (data) => async (dispatch) => {
    dispatch({ 
      type: NEWS_ARTICLE_CONTENT,
       payload: data 
    });
  }

  export const clearArticlePageData = () => async (dispatch) => {
    dispatch({ 
      type: CLEAR_ARTICLE_PAGE_DATA_ON_SUBMIT
    });
  }

  export const maintainGenAiCheck = (checkValue) => async(dispatch) =>{
    dispatch({
      type: MAINTAIN_GEN_AI_CHECK,
      payload: checkValue
    })
  }

  

  export const createNewsLetter = (data) => async (dispatch) => {
    try {
      if(data !== true)  {
        dispatch({ 
          type: CREATE_NEWS_LETTER_RESOLVE,
          payload: data || []
        });
        return true;
      }
    } catch (error) {
      dispatch({ 
        type: CREATE_NEWS_LETTER_REJECT, 
        payload: []
      });
      return false;
    }
  }

  export const getGenreTypes = () => async (dispatch) => {
    dispatch({ type: GENRE_TYPES_REQUEST });
    try {
      const result = await Api.GetGenreTypes();
      if(result.error !== true)  {
        dispatch({ 
          type: GENRE_TYPES_RESOLVE,
          payload: result?.data,
        });
        return true;
      }
  
      dispatch({
        type: GENRE_TYPES_REJECT,
        payload: [],
      });
      return false;
  
    } catch (error) {
      dispatch({ 
        type: GENRE_TYPES_REJECT, 
        payload: [],
      });
      return false;
    }
  }

  export const getArticleById = (articleId, clusterId) => async (dispatch) => {
    dispatch({ type: ARTICLES_BY_ID_REQUEST });
    try {
      const result = await Api.GetArticleById(articleId, clusterId);
      if(result.error !== true)  {
        dispatch({ 
          type: ARTICLES_BY_ID_RESOLVE,
          payload: result?.data || {}
        });
        return result?.data || {};
      }
  
      dispatch({
        type: ARTICLES_BY_ID_REJECT,
        payload: {}
      });
      return {};
  
    } catch (error) {
      dispatch({ 
        type: ARTICLES_BY_ID_REJECT, 
        payload: {}
      });
      return {};
    }
  }

  export const interactionCheck = (data) => async (dispatch) => {
    dispatch({ type: INTERACTION_CHECK_REQUEST });
    try {
      const result = await Api.InteractionCheck(data);
      if(result.error !== true)  {
        dispatch({ 
          type: INTERACTION_CHECK_RESOLVE,
          payload: result?.data || []
        });
        return true;
      }
  
      dispatch({
        type: INTERACTION_CHECK_REJECT,
        payload: []
      });
      return false;
  
    } catch (error) {
      dispatch({ 
        type: INTERACTION_CHECK_REJECT, 
        payload: []
      });
      return false;
    }
  }