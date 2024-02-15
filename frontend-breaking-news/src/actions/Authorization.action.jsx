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
  RESEND_VERIFICATION_MAIL_REQUEST,
  RESEND_VERIFICATION_MAIL_RESOLVE,
  RESEND_VERIFICATION_MAIL_REJECT,
  CHECK_EMAIL_VERIFIED_REQUEST,
  CHECK_EMAIL_VERIFIED_RESOLVE,
  CHECK_EMAIL_VERIFIED_REJECT,
  CHECK_LINK_VERIFIED_REQUEST,
  CHECK_LINK_VERIFIED_RESOLVE,
  CHECK_LINK_VERIFIED_REJECT
} from '../actionTypes/Auth.type';

import Api from '../api/Authorization.api';
import { handleLocalAuthClear, handleLocalAuthStore } from '../services/storage.service';

export const login = (username = "", password = "") => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const result = await Api.Login(username, password);
    if(result?.status === 200){
      dispatch({ 
        type: LOGIN_RESOLVE,
        payload: result?.data
      });
      await handleLocalAuthStore(result?.data?.data, "token");
      await handleLocalAuthStore(result?.data?.user_email, "user_email");
      await handleLocalAuthStore(
        {
        "user_id": result?.data?.user_id,
        "user_name": result?.data?.user_name
      }
      , "user_data");
      return {
        status:true,message:""
      };
    }
    dispatch({
      type: LOGIN_REJECT,
      payload: {}
    });
    return {
      status:false,message:""
    };

  } catch (error) {
    dispatch({ 
      type: LOGIN_REJECT, 
      payload: {}
    });
    return {
      status:false,message:error.response.data.message 
    };
  }
}

export const signUp = (username = "",email = "", password = "") => async (dispatch) => {
  dispatch({ type: SIGN_UP_REQUEST });
  try {
    const result = await Api.SignUp(username,email, password);
    if(result.status === 200)  {
      dispatch({ 
        type: SIGN_UP_RESOLVE,
        payload: {}
      });
      return {
        status:true,message:""
      };
    }

    dispatch({
      type: SIGN_UP_REJECT,
      payload: {}
    });
    return {
      status:false,message:""
    };

  } catch (error) {
    dispatch({ 
      type: SIGN_UP_REJECT, 
      payload: {}
    });
    return {
      status:false,message:error.response.data.message
    };
  }
}

export const forgotPassword = (email = "") => async (dispatch) => {
  dispatch({ type: FORGOT_PASSWORD_REQUEST });
  try {
    const result = await Api.ForgotPassword(email);
    if(result.status === 200)  {
      dispatch({ 
        type: FORGOT_PASSWORD_RESOLVE,
        payload: {}
      });
      return {
        status:true,message:""
      };
    }

    dispatch({
      type: FORGOT_PASSWORD_REJECT,
      payload: {}
    });
    return {
      status:false,message:""
    };

  } catch (error) {
    dispatch({ 
      type: FORGOT_PASSWORD_REJECT, 
      payload: {}
    });
    return {
      status:false,message:error.response.data.message
    };
  }
}

export const verifyOtp = (otp = "") => async (dispatch) => {
  dispatch({ type: VERIFY_OTP_REQUEST });
  try {
    const result = await Api.VerifyOtp(otp);
    if(result.status === 200)  {
      dispatch({ 
        type: VERIFY_OTP_RESOLVE,
        payload: {}
      });
      return true;
    }

    dispatch({
      type: VERIFY_OTP_REJECT,
      payload: {}
    });
    return false;

  } catch (error) {
    dispatch({ 
      type: VERIFY_USER_REJECT, 
      payload: {}
    });
    return false;
  }
}

export const verifyUser = (userName = "", verificationCode = "") => async (dispatch) => {
  dispatch({ type: VERIFY_USER_REQUEST });
  try {
    const result = await Api.VerifyUser(userName, verificationCode);
    if(result.status === 200)  {
      dispatch({ 
        type: VERIFY_USER_RESOLVE,
        payload: {}
      });
      return true;
    }

    dispatch({
      type: VERIFY_USER_REJECT,
      payload: {}
    });
    return false;

  } catch (error) {
    dispatch({ 
      type: VERIFY_USER_REJECT, 
      payload: {}
    });
    return false;
  }
}

export const checkEmailExpired = (email = "") => async (dispatch) => {
  dispatch({ type: CHECK_EMAIL_VERIFIED_REQUEST });
  try {
    const result = await Api.CheckEmailExpired(email);
    if(result.status === 200)  {
      dispatch({ 
        type: CHECK_EMAIL_VERIFIED_RESOLVE,
        payload: {}
      });
      return result?.data?.data?.is_reset;
    }

  } catch (error) {
    dispatch({ 
      type: CHECK_EMAIL_VERIFIED_REJECT, 
      payload: {}
    });
    return false;
  }
}

export const checkResetLinkExpiry = (code = "", email = "") => async (dispatch) => {
  dispatch({ type: CHECK_LINK_VERIFIED_REQUEST });
  try {
    const result = await Api.CheckResetLinkExpired(code, email);
    if(result.status === 200 && result?.data?.error === false && result?.data?.data?.to_reset_password === true)  {
      dispatch({ 
        type: CHECK_LINK_VERIFIED_RESOLVE
      });
      return true;
    }else{
      dispatch({ 
        type: CHECK_LINK_VERIFIED_RESOLVE
      });
      return false;
    }

  } catch (error) {
    dispatch({ 
      type: CHECK_LINK_VERIFIED_REJECT
    });
    return false;
  }
}

export const signUpResendMail = (email= "") => async (dispatch) => {
  dispatch({ type: RESEND_VERIFICATION_MAIL_REQUEST });
  try {
    const result = await Api.SignUpResendMail(email);
    if(result.status === 200)  {
      dispatch({ 
        type: RESEND_VERIFICATION_MAIL_RESOLVE,
        payload: {}
      });
      return {
        status:true,
        //TODO: change this message to read the actual message
        message:"Success Verification Mail Resent"
      };
    }
  } catch (error) {
    dispatch({ 
      type: RESEND_VERIFICATION_MAIL_REJECT, 
      payload: {}
    });
    return {
      status:false,
      message:error.response.data.message
    };
  }
}

export const resetPassword = (data) => async (dispatch) => {
  dispatch({ type: RESET_PASSWORD_REQUEST });
  try {
    const result = await Api.ResetPassword(data);
    if(result.status === 200)  {
      dispatch({ 
        type: RESET_PASSWORD_RESOLVE,
        payload: {}
      });
      return {
        status:true,message:""
      };
    }
    dispatch({
      type: RESET_PASSWORD_REJECT,
      payload: {}
    });
    return {
      status:false,message:""
    };
  } catch (error) {
    dispatch({ 
      type: RESET_PASSWORD_REJECT, 
      payload: {}
    });
    return {
      status:false,message:error.response.data.message
    };
  }
}

export const logout = () => async (dispatch) => {
  await handleLocalAuthClear();
  dispatch({ type: LOGOUT });
}

export const defaultNotificationPopUp = (pr, msg) => async (dispatch) => {
  dispatch({ 
    type: NOTIFICATION_POP,
    payload: {
      message: msg,
      priority: pr
    }
   });
}

export const clearPopUp = () => async (dispatch) => {
  dispatch({ 
    type: NOTIFICATION_POP,
    payload: null
   });
}

export const updateSessionState = (result) =>async(dispatch) =>{
  await handleLocalAuthStore(result, "session_timeout");
  dispatch({
    type:SESSION_TIMEOUT,
    payload: result
  })
}

