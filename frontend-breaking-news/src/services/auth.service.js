import { store } from "../store.js";
import { login, signUp,updateSessionState , checkResetLinkExpiry, checkEmailExpired,  signUpResendMail, forgotPassword, verifyUser,verifyOtp, resetPassword, logout } from "../actions/Authorization.action.jsx";
import { handleLocalAuthFetch } from "./storage.service.js";

export const handleLogin = async (username, password) => {
  return await store.dispatch(login(username, password));
}

export const handleSignUp = async (username,email, password) => {
  return await store.dispatch(signUp(username,email, password));
}

export const handleSignUpResendMail = async (email) => {
  return await store.dispatch(signUpResendMail(email));
}


export const handleForgotPassword = async (email) => {
  return await store.dispatch(forgotPassword(email));
}

export const handleCheckEmailExpired = async (email) => {
  return await store.dispatch(checkEmailExpired(email));
}

export const handleCheckResetLinkExpiry = async (count, email) => {
  return await store.dispatch(checkResetLinkExpiry(count, email));
}

// verify otp
export const handleVerifyOtp = async (otp) =>{
  return await store.dispatch(verifyOtp(otp));
}

export const handleVerifyUser = async (userName, verificationCode) => {
  return await store.dispatch(verifyUser(userName, verificationCode));
}


export const handleResetPassword = async (data) => {
  return await store.dispatch(resetPassword(data));
}


export const handleAuthCheck = async () => {
  const authCheck = await handleLocalAuthFetch();
  if(authCheck === null){
    return true;
  }
  return false;
}

export const handleRefreshToken = async () => {
  
  await store.dispatch(logout());
  await store.dispatch(updateSessionState(true));
}

export const handleUpdateSessionState = async(result) =>{
  await store.dispatch(updateSessionState(result));
}