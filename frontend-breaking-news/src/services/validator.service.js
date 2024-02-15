import { defaultNotificationPopUp, clearPopUp } from "../actions/Authorization.action";
import { store } from "../store";

export const validateEmail = (email = "") => {
  const isContainsLowercase = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email === ""){
    return true
  }
  else if (!isContainsLowercase.test(email)) {
    return false
  }
  return true
  };

export const validateUserName = (username ="") =>{
  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}[\]|\\:;"'<>,.?/₹]).*$/;
  if(username ===""){
    return true
  }else if (!isContainsSymbol.test(username)){
    return true
  }
  return false
};

export const checkPasswordValidity = (value) => {
  const isNonWhiteSpace = /^\S*$/;

  if (!isNonWhiteSpace.test(value)) {
    return "Password must not contain White Spaces.";
  }

  const isContainsUppercase = /^(?=.*[A-Z]).*$/;
  if (!isContainsUppercase.test(value)) {
    return "Password must have at least one Uppercase Character.";
  }

  const isContainsLowercase = /^(?=.*[a-z]).*$/;
  if (!isContainsLowercase.test(value)) {
    return "Password must have at least one Lowercase Character.";
  }

  const isContainsNumber = /^(?=.*[0-9]).*$/;
  if (!isContainsNumber.test(value)) {
    return "Password must contain at least one Digit.";
  }

  const isContainsSymbol =
    /^(?=.*[~`!@#$%^&*()--+={}[\]|\\:;"'<>,.?/_₹]).*$/;
  if (!isContainsSymbol.test(value)) {
    return "Password must contain at least one Special Symbol.";
  }

  const isValidLength = /^.{8,16}$/;
  if (!isValidLength.test(value)) {
    return "Password must be 10-16 Characters Long.";
  }
  return null;
}

export const handleDefaultNotificationPopUp = async (priority, message) => {
  return await store.dispatch(defaultNotificationPopUp(priority, message));
}

export const handleClearPopUp = async () => {
  await store.dispatch(clearPopUp());
}