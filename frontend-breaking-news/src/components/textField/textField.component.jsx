import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { checkPasswordValidity } from '../../services/validator.service';
import {validateEmail} from '../../services/validator.service';
import {validateUserName} from '../../services/validator.service';
import { Tooltip, Typography } from '@mui/material';
import { Check, Close, Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

export default function BasicTextFields({ noCopyPaste= null, isParentErrorStatus= null, submitHandler= null, isValidText=null, showConfirmCheck = null, otherPasswordValue= null, showHelper= false, currentValue, width, tag="", fieldType = 'text', handleParentTextChange = null, placeholder = null}) {

  /* use States */
  const [textValue, setTextValue] = useState(currentValue || "");
  const [isError, setIsError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleNoCopyPaste = (event) => {
    event.preventDefault();
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const passwordValidator = (password) => [
    {
      label: "Must have 8 to 16 characters",
      validate: () => (password.length > 7 && password.length < 17),
    },
    {
      label: "Must have at least 1 uppercase character",
      validate: () => password.match(/(?=.*?[A-Z])/),
    },
    {
      label: "Must have at least 1 lowercase character",
      validate: () => password.match(/(?=.*?[a-z])/),
    },
    { label: "Must have at least 1 digit", validate: () => password.match(/(?=.*?[0-9])/) },
    {
      label: "Must have at least 1 special character (( # ? ! @ $ % ^ & * - . _ )",
      validate: () => password.match(/(?=.*?[#?!@$%^&*-._])/),
    }
  ];

  const passwordConfirmValidator = (password) => [
    {
      label: "Must have 8 to 16 characters",
      validate: () => (password.length > 7 && password.length < 17),
    },
    {
      label: "Must have at least 1 uppercase character",
      validate: () => password.match(/(?=.*?[A-Z])/),
    },
    {
      label: "Must have at least 1 lowercase character",
      validate: () => password.match(/(?=.*?[a-z])/),
    },
    { 
      label: "Must have at least 1 digit", 
      validate: () => password.match(/(?=.*?[0-9])/) },
    {
      label: "Must have at least 1 special character (( # ? ! @ $ % ^ & * - . _ )",
      validate: () => password.match(/(?=.*?[#?!@$%^&*-._])/),
    },
    {
      label: "Both Passwords must be Same",
      validate: () => (password === otherPasswordValue && password !== ""),
    }
  ];

  /* Handler functions */
  const handleTextChange = (newValue) =>{

    if(fieldType === "password" && showHelper === true){

      const checkResponse = checkPasswordValidity(newValue);
      if(newValue === ""){
        setIsError(false);

      }else{
        setPasswordErrorMessage(checkResponse == null ? "" : checkResponse)
        setIsError(checkResponse == null ? false : true);

        if(isValidText != null){
          isValidText(checkResponse == null ? true : false);
        }
      }
    }

    if(handleParentTextChange != null){
      handleParentTextChange(newValue,tag);
    }
      
    if(fieldType === "email" && showHelper === true && newValue.includes(" ")){
      setTextValue(newValue.replaceAll(" ", "_"));
    }
    
    if (fieldType === "email" && showHelper === false){
      const checkResponse = validateEmail(newValue);
      setIsError(!checkResponse)
      if(isValidText != null)isValidText(checkResponse);
    }

    if (fieldType === "username"){
      const checkResponse = validateUserName(newValue);
      setIsError(!checkResponse);
      if(isValidText != null)isValidText(checkResponse);
    }
    setTextValue(newValue.replaceAll(" ", "_"));
  }


  return (
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { width: width || '100%'} }}
      onSubmit={(e) => {
        e.preventDefault();
        if(submitHandler){
          submitHandler();
        }
      }}
      className='basicBox'
      noValidate
      autoComplete="off"
    >
      <Tooltip placement="bottom-start" title={
        fieldType === "password" && passwordErrorMessage !== null && showHelper === true
        ? (showConfirmCheck === true ? passwordConfirmValidator(textValue) : passwordValidator(textValue)).map((rule) => {
            const isValid = rule.validate();
            return (
              <div
                key={rule.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                {isValid ? (
                  <Check fontSize="small" htmlColor={isValid && "#00F8AB"} />
                ) : (
                  <Close fontSize="small" htmlColor={"red"} />
                )}

                <Typography fontSize={10}>{rule.label}</Typography>
              </div>
            );
          })
          
        : fieldType === "username" && isError
          ? "no special characters allowed"
          : ""}>
            {
              noCopyPaste === true
              ? <TextField
                  size="small" 
                  onCopy={handleNoCopyPaste}
                  onCut={handleNoCopyPaste}
                  onPaste={handleNoCopyPaste}
                  error={otherPasswordValue!=null && textValue==""? false : isParentErrorStatus !== null ? isParentErrorStatus : isError}
                  id="outlined-basic" 
                  InputProps={{
                    style: {
                      borderRadius: "8px",
                      height:"45px",
                    },
                    endAdornment: fieldType === "password" ?
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                      : null
                  }}
                  type={showPassword === true ? "text" : fieldType} 
                  variant="outlined" 
                  placeholder={placeholder || ""}
                  sx={{ background: '#fff', borderRadius: '12px', width: '100%' }} 
                  value={textValue}
                  onChange={(e) => {
                    handleTextChange(e.target.value)
                  }}
                />
              : <TextField
                  size="small"
                  error={otherPasswordValue!=null && textValue==""? false : isParentErrorStatus !== null ? isParentErrorStatus : isError}
                  id="outlined-basic" 
                  InputProps={{
                    style: {
                      borderRadius: "8px",
                      height:"45px",
                    },
                    endAdornment: fieldType === "password" ?
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                      : null
                  }}
                  type={showPassword === true ? "text" : fieldType} 
                  variant="outlined" 
                  placeholder={placeholder || ""}
                  sx={{ background: '#fff', borderRadius: '12px', width: '100%' }} 
                  value={textValue}
                  onChange={(e) => {
                    handleTextChange(e.target.value)
                  }}
                />
            }
      
      </Tooltip>
    </Box>
  );
}