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
  GET_USER_ID,
  UPDATE_DIVERSITY_VALUE_PERSONALIZED,
  UPDATE_CREATE_IN_PROGRESS_VALUE,
  UPDATE_CREATE_IN_PROGRESS_VALUE_NEW,
  CREATE_NEWS_LETTER_REQUEST,
  CREATE_NEWS_LETTER_RESOLVE,
  CREATE_NEWS_LETTER_REJECT,
  ARTICLES_BY_ID_REQUEST,
  ARTICLES_BY_ID_RESOLVE,
  ARTICLES_BY_ID_REJECT,
  INTERACTION_CHECK_REQUEST,
  INTERACTION_CHECK_RESOLVE,
  INTERACTION_CHECK_REJECT,
  UPDATE_USER_ID,
  GENRE_TYPES_REQUEST,
  GENRE_TYPES_RESOLVE,
  GENRE_TYPES_REJECT,
  NEWS_ARTICLE_CONTENT,
  INTERESTED_USER_ID,
  CLEAR_ARTICLE_PAGE_DATA_ON_SUBMIT,
  MAINTAIN_GEN_AI_CHECK,
  UPDATE_NEWS_LETTER_TEMPLATE_DATA,
  UPDATE_IS_EMAIL_DATA,
  UPDATE_PAGE_MAP_VALUE,
  UPDATE_ARTICLE_IN_PROGRESS,
  UPDATE_SELECTED_GENRE
} from "../actionTypes/home.type";

export const initialState = {
  isAuth: false
}

export default function homeReducer(
  state = initialState,
  action
) {
  const { type, payload } = action;
  
  switch (type) {

    case BREAKING_NEWS_REQUEST:
      return {
        ...state,
      };
    case BREAKING_NEWS_RESOLVE:
      return {
        ...state,
        breaking_list: payload.list || [],
        has_more_data: payload?.more_articles,
        next_page: Math.ceil(payload?.list.length/20) + 1
      };
    case BREAKING_NEWS_REJECT:
      return {
        ...state,
        breaking_list: payload
      };

    case NEWS_BY_GENRE_REQUEST:
      return {
        ...state,
      };
    case NEWS_BY_GENRE_RESOLVE:
      if(payload.is_genre === false){
        return {
          ...state,
          no_genre_list: payload?.data,
          has_more_no_genre_data: payload?.hasMore,
          no_genre_page: payload?.currentPage
        };
      }else{
        return {
          ...state,
          genre_list: payload?.data,
          has_more_genre_data: payload?.hasMore,
          genre_page: payload?.currentPage
        };
      }
    case NEWS_BY_GENRE_REJECT:
      if(payload.is_genre === false){
        return {
          ...state,
          no_genre_list: payload
        };
      }else{
        return {
          ...state,
          genre_list: payload
        };
      }

      case NEWS_ARTICLE_REQUEST:
        return {
          ...state,
        };
      case NEWS_ARTICLE_RESOLVE:
        return {
          ...state,
          article_create_response: payload
        };
      case  NEWS_ARTICLE_REJECT:
        return {
          ...state,
          article_create_response: payload
        };

    case ARTICLES_BY_USER_REQUEST:
      return {
        ...state,
      };
    case ARTICLES_BY_USER_RESOLVE:
      return {
        ...state,
        articles_by_user_list: payload
      };
    case ARTICLES_BY_USER_REJECT:
      return {
        ...state,
      };

    case UPDATE_DIVERSITY_VALUE:
      return {
        ...state,
        diversity_state: payload
      }

    case GET_USER_ID:
      return{
        ...state,
        user_id:payload
      }

    case UPDATE_DIVERSITY_VALUE_PERSONALIZED:
      return {
        ...state,
        diversity_state_personalized: payload
      }

    case UPDATE_CREATE_IN_PROGRESS_VALUE:
      return {
        ...state,
        create_in_progress:payload
      }

      case UPDATE_CREATE_IN_PROGRESS_VALUE_NEW:
        return {
          ...state,
          create_in_progress_new:payload
        }

    case UPDATE_NEWS_LETTER_TEMPLATE_DATA:
      return{
        ...state,
        news_letter_template_data:payload
      }
    
    case UPDATE_USER_ID:
      return {
        ...state,
        user_id_synced: payload,
      }

    case NEWS_ARTICLE_CONTENT:
      return {
        ...state,
        new_article_create_content: payload,
      }

    case INTERESTED_USER_ID:
      return {
        ...state,
        current_user_selection: payload
      }

    case CLEAR_ARTICLE_PAGE_DATA_ON_SUBMIT:
      return {
        ...state,
        current_user_selection: null,
        article_create_response: null,
        articles_by_user_list: [],
      }

    case MAINTAIN_GEN_AI_CHECK:
      return {
        ...state,
        gen_ai_enabled: payload
      }

    case UPDATE_IS_EMAIL_DATA:
      return {
        ...state,
        is_current_email_valid: payload
      }

    case UPDATE_PAGE_MAP_VALUE:
      return {
        ...state,
        current_personal_page_data: payload
      }

    case UPDATE_ARTICLE_IN_PROGRESS:
      return {
        ...state,
        getting_new_article_for_user: payload
      }

    case UPDATE_SELECTED_GENRE:
      return {
        ...state,
        current_selected_genre: payload
      }

    case CREATE_NEWS_LETTER_REQUEST:
      return {
        ...state,
        new_article_response: null      
      };
    case CREATE_NEWS_LETTER_RESOLVE:
      return {
        ...state,
        new_article_response: payload
      };
    case CREATE_NEWS_LETTER_REJECT:
      return {
        ...state,
        new_article_response: payload
      };
    case ARTICLES_BY_ID_REQUEST:
      return {
        ...state,
      };
    case ARTICLES_BY_ID_RESOLVE:
      return {
        ...state,
        article_details: payload,
        is_linked: true
      };
    case  ARTICLES_BY_ID_REJECT:
      return {
        ...state,
        article_details: payload,
        is_linked: true
      };

    case INTERACTION_CHECK_REQUEST:
      return {
        ...state,
      };
    case INTERACTION_CHECK_RESOLVE:
      return {
        ...state,
      };
    case INTERACTION_CHECK_REJECT:
      return {
        ...state,
      };

    case GENRE_TYPES_REQUEST:
      return {
        ...state,
      };
    case GENRE_TYPES_RESOLVE:
      return {
        ...state,
        genres_types: payload
      };
    case GENRE_TYPES_REJECT:
      return {
        ...state,
        genres_types: payload
      };

    default:
      return state;
  }
}