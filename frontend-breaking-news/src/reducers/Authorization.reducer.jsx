import {
  LOGIN_REQUEST,
  LOGIN_RESOLVE,
  LOGIN_REJECT,
  LOGOUT,
  SIGN_UP_REQUEST,
  SIGN_UP_RESOLVE,
  SIGN_UP_REJECT,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_RESOLVE,
  FORGOT_PASSWORD_REJECT,
  VERIFY_USER_REQUEST,
  VERIFY_USER_RESOLVE,
  VERIFY_USER_REJECT,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_RESOLVE,
  VERIFY_OTP_REJECT,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_RESOLVE,
  RESET_PASSWORD_REJECT,
  NOTIFICATION_POP,
  SESSION_TIMEOUT,
} from "../actionTypes/Auth.type";

export const initialState = {
  AccessToken: null,
  RefreshToken: null,
  IdToken: null,
  ExpiresIn: null,
  TokenType: null,
  IsAuth: false,
  IsSessionTimeout:false
}

export default function authReducer(
  state = initialState,
  action
) {
  const { type, payload } = action;
  switch (type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        IsAuth: false
      };
    case LOGIN_RESOLVE:
      return {
        ...state,
        AccessToken: payload?.data?.access_token,
        RefreshToken: payload?.data?.refresh_token,
        IdToken: payload?.data?.id_token,
        ExpiresIn: payload?.data?.expires_in,
        TokenType: payload?.data?.token_type,
        IsAuth: true,
        UserEmail: payload?.user_email,
        UserId: payload?.user_id,
        UserName: payload?.user_name,
        isConfirmedUser: payload?.is_confirmed
      };
    case LOGIN_REJECT:
      return {
        ...state,
        IsAuth: false,
      };
    case LOGOUT:
      return {
        ...state,
        AccessToken: null,
        RefreshToken: null,
        IdToken: null,
        ExpiresIn: null,
        TokenType: null,
        IsAuth: false,
      };
    
    case SIGN_UP_REQUEST:
      return {
        ...state,
      };
    case SIGN_UP_RESOLVE:
      return {
        ...state,
      };
    case SIGN_UP_REJECT:
      return {
        ...state,
      };
    
      case FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
      };
    case FORGOT_PASSWORD_RESOLVE:
      return {
        ...state,
      };
    case FORGOT_PASSWORD_REJECT:
      return {
        ...state,
      };

    case VERIFY_USER_REQUEST:
      return {
        ...state,
      };
    case VERIFY_USER_RESOLVE:
      return {
        ...state,
      };
    case VERIFY_USER_REJECT:
      return {
        ...state,
      };

      case VERIFY_OTP_REQUEST:
        return {
          ...state,
        };
      case VERIFY_OTP_RESOLVE:
        return {
          ...state,
        };
      case VERIFY_OTP_REJECT:
        return {
          ...state,
        };
  
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
      };
    case RESET_PASSWORD_RESOLVE:
      return {
        ...state,
      };
    case RESET_PASSWORD_REJECT:
      return {
        ...state,
      };

    case NOTIFICATION_POP:
      return {
        ...state,
        pop_up: payload
      }
    case SESSION_TIMEOUT:
      return {
        ...state,
        IsSessionTimeout: payload
      };
  
    default:
      return state;
  }
}