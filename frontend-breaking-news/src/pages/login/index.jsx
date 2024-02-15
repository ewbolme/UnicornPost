import React, { useEffect, useState } from 'react';

import { Typography, CircularProgress} from "@mui/material";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpTwoToneIcon from '@mui/icons-material/ThumbUpTwoTone';

import './login.css'

import RowContainer from '../../components/rowContainer/rowContainer.container.jsx';
import BasicTextFields from '../../components/textField/textField.component.jsx';
import LoginImage from "../../static/images/log-in-image.svg";
import Tick from "../../static/images/tick.svg"
import UnicornLogo from "../../static/images/unicorn-logo-faint.svg";
import { useSearchParams } from 'react-router-dom';
import { handleCheckEmailExpired, handleCheckResetLinkExpiry, handleUpdateSessionState } from '../../services/auth.service';

import { handleForgotPassword, handleLogin as handleLoginApi, handleResetPassword } from '../../services/auth.service.js';
import { useSelector } from 'react-redux';
import { handleDefaultNotificationPopUp } from '../../services/validator.service.js';
import { handleLocalAuthFetch } from '../../services/storage.service.js';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius:'16px',
  p: 4,
  outline:'none',
  padding:'5px 15px 50px 15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minWidth: '40%',
  width: 'max-content'
};

const modalStyleFinalSuccess = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius:'16px',
  p: 4,
  outline:'none',
  padding:'5px 15px 50px 15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minWidth: '40%',
  width: 'max-content'
}

const modalStyleSuccess = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  outline:'none',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius:'16px',
  p: 4,
  display: 'flex',
  padding:'5px 15px 50px 15px',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minWidth: '40%',
  width: 'max-content'
};


const modalStyleResetLast = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius:'16px',
  p: 4,
  outline:'none',
  padding:'5px 15px 50px 15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minWidth: '40%',
  width: 'max-content'
};

export default function Login() {

  const [searchParams, setSearchParams]  = useSearchParams();


  /* use States */
  const [open, setOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [forgotMailSuccessModalOpen, setForgotMailSuccessModalOpen] = useState(false);
  const [passwordChangeConfirmModalOpen, setPasswordChangeConfirmModalOpen] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isResendInProgress, setIsResendInProgress] = useState(false);
  const [textFields, setTextFields] = useState({
    userName: "",
    password: "",
    forgotPasswordEmail: "",
    newPassword: "",
    confirmPassword: "",
    confirmationCode: ""
  });

  const [loginInProgress, setLoginInProgress] = useState(false);
  const [forgotPasswordProgress, setForgotPasswordProgress] = useState(false);
  const [resetPasswordProgress, setResetPasswordProgress] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordSame, setPasswordSame] = useState(false);
  const[resendSuccess,setResendSuccess]=useState(false);

  const { authData } = useSelector((state) => ({
    authData: state.auth,
  }));


  useEffect(() => {
    if(authData?.IsAuth !== null && authData?.IsAuth === true) {
      window.location.href = "/home";
    }else if(authData?.isConfirmedUser !== null){
        if(authData?.isConfirmedUser === false){
          handleDefaultNotificationPopUp("warning","You are not verified, please check your mail to verify.");

        }
    }
  },[authData]);

  useEffect(()=>{
    handleWasSessionTimeout();
    handleEmailVerifyAndResetModal();
  },[])
 
  /* Handler Functions */

  const handleWasSessionTimeout = async () => {
    const AuthValue = await handleLocalAuthFetch("session_timeout");
    const SessionValue = JSON.parse(AuthValue);
    if(SessionValue?.data !== null && SessionValue?.data === true){

      handleDefaultNotificationPopUp("error","Invalid Session. Please Login again.");
      await handleUpdateSessionState(false);
    }
  }

  const handleEmailVerifyAndResetModal = async () => {
    const paramReset = searchParams.get('is_reset');
    const paramCode = searchParams.get('code');
    const paramEmail = searchParams.get('email');
    const paramResetCounter = searchParams.get('resetPasswordCount');
    
    if(paramResetCounter && paramResetCounter !== "" && paramEmail && paramEmail !== ""){
      const isLinkValid = await handleCheckResetLinkExpiry(paramResetCounter,paramEmail);
      
      if(isLinkValid === false){
  
        setResetModalOpen(false);
        handleDefaultNotificationPopUp("warning","Link expired");

        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }else{
        if(paramReset && paramReset === 'true' && paramCode && paramCode !== "" && paramEmail && paramEmail !== ""){
          setTextFields({
            ...textFields,
            confirmationCode: paramCode,
            forgotPasswordEmail: paramEmail
          });
    
          const isResetSessionExpired = await handleCheckEmailExpired(paramEmail);
          if(isResetSessionExpired === false){
            handleDefaultNotificationPopUp("warning","Link expired");
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }else{
            setResetModalOpen(true);
    
          }
        }else{
          setResetModalOpen(false)
        }
      
      }
    }

  }


  const handleForgotPasswordApiCall = async () => {
    if(textFields?.forgotPasswordEmail === ""|| isEmailValid === false){
      handleDefaultNotificationPopUp("warning","Please provide valid email.");

    }else if(textFields?.forgotPasswordEmail !== null && textFields?.forgotPasswordEmail !== ""){
      setForgotPasswordProgress(true);

      const apiCallForgotPassword = await handleForgotPassword(textFields?.forgotPasswordEmail);
      if(apiCallForgotPassword.status === true){
        setForgotMailSuccessModalOpen(true); 
        setOpen(false);

      }else{
        const text =apiCallForgotPassword.message.split(" ");
        const[,...rest]=text;
        const correctVal = (" "+rest+" ").replaceAll(","," ");

        handleDefaultNotificationPopUp("warning",correctVal);
      }
      setForgotPasswordProgress(false);
    }else{

      handleDefaultNotificationPopUp("warning","Please provide valid email.");
    }
  };

  const handleForgotPasswordApiCallResend = async () => {
    
    setResendSuccess(false)
    setIsResendInProgress(true)

    if(textFields?.forgotPasswordEmail === ""|| isEmailValid === false){
      setIsResendInProgress(false)
      handleDefaultNotificationPopUp("warning","Please provide valid email.");
    }
    else if(textFields?.forgotPasswordEmail !== null && textFields?.forgotPasswordEmail !== ""){
      setIsResendInProgress(true)
      setForgotPasswordProgress(true);

      const apiCallForgotPassword = await handleForgotPassword(textFields?.forgotPasswordEmail);

      if(apiCallForgotPassword.status === true){
        setIsResendInProgress(false)
        setResendSuccess(true);

      }else{
        setIsResendInProgress(false)
        const text =apiCallForgotPassword.message.split(" ");
        const[,...rest]=text;
        const correctVal = (" "+rest+" ").replaceAll(","," ");
        handleDefaultNotificationPopUp("warning",correctVal);
      }
      setForgotPasswordProgress(false);
      setOpen(false);
    }else{
      setIsResendInProgress(false)
      handleDefaultNotificationPopUp("warning","Please provide valid email.");
    }
  };


  const handleLogin = async () =>{
    if(textFields?.userName === ""|| isEmailValid === false){
      await handleDefaultNotificationPopUp("warning","Please provide valid email.");

    }else if(textFields?.password === ""){
      handleDefaultNotificationPopUp("warning","Please provide valid password.");

    }else{
      setLoginInProgress(true);
      const isLoginSuccess = await handleLoginApi(textFields?.userName, textFields?.password);
      if(!isLoginSuccess.status && isLoginSuccess.message!== ""){
        
        const text =isLoginSuccess.message.split(" ");
        const[,...rest]=text;
        const correctVal = (" "+rest+" ").replaceAll(","," ");

        handleDefaultNotificationPopUp("warning",correctVal);

      }
      setLoginInProgress(false);
    }
  }

  const handleResetApiCall = async () => {
    if(textFields?.newPassword !== textFields?.confirmPassword){
      setIsPasswordValid(false)

      handleDefaultNotificationPopUp("warning","New Password and Confirm Password do not match");

    }else if (isPasswordValid === false){
      handleDefaultNotificationPopUp("warning","Please provide a valid Password.");

    }else {
    setResetPasswordProgress(true);
    const apiCallResetPassword = await handleResetPassword({
      user_email: textFields?.forgotPasswordEmail,
      confirmation_code: textFields?.confirmationCode,
      user_password: textFields?.newPassword
    });
    if(apiCallResetPassword?.status === true){
     setPasswordChangeConfirmModalOpen(true);
     setResetModalOpen(false);
    //  window.location.href = '/';
    }else{
      const text =apiCallResetPassword.message.split(" ");
      const[,...rest]=text;
      const correctVal = (" "+rest+" ").replaceAll(","," ");

      handleDefaultNotificationPopUp("warning",correctVal);

    }
    setResetPasswordProgress(false);
    setOpen(false);
  }
  }


  const goToSignUp = async () =>{
    window.location.href = "/sign-up";
  }

  const handleSetFieldValues = (value,tag) =>{

    if(tag === "login-username"){
      setTextFields({
        ...textFields,
        userName: value
      });
    }else if(tag === "login-password"){
      setTextFields({
        ...textFields,
        password: value
      });
    }else if(tag === "forgot-password") {
      setTextFields({
        ...textFields,
        forgotPasswordEmail: value
      });
    }
  }

  const handleSetFieldValuesReset = (value,tag) =>{
    if(tag === "reset-code"){
      setTextFields({
        ...textFields,
        confirmationCode: value
      });
    }else if(tag === "reset-new-pass"){
      setPasswordSame(value !== textFields?.confirmPassword);
      setTextFields({
        ...textFields,
        newPassword: value
      });
    }else if(tag === "reset-confirm-pass") {
      setPasswordSame(value !== textFields?.newPassword);
      setTextFields({
        ...textFields,
        confirmPassword: value
      });
    }
  }


  const handleParentIsValid = (value) => {
    if(textFields?.confirmPassword===""){
      console.debug("entered")

    }else{
    setIsPasswordValid(value);
  }
}

  const handleForgotModalClose = () => {
    setOpen(false);
  }

  const handleEmailParentIsValid = (value) => {
    setIsEmailValid(value);
  }

  const handleForgotMailSuccessModal = () =>{
    setIsResendInProgress(false);
    setResendSuccess(false);
    setForgotMailSuccessModalOpen(false);
  }

  const handlePasswordChangeConfirmationModalClose = () => {
    setPasswordChangeConfirmModalOpen(false);
  }

  const handleResetModalClose = () => {
    setResetModalOpen(false);
    window.location.href = '/';
  }

  const handleForgotPasswordModalOpen = ()=>{
    setTextFields({
      ...textFields,
      forgotPasswordEmail: ""
    });
    setOpen(true);
  }

  const handleSubmit = (e) => {
    if(e){
      e.preventDefault();
    }
    handleLogin()
  };


  return (
    <RowContainer className="outer-row-container" padding={'0 40px 0 40px'} gap={'100px'} align={'center'}>
      <div className="login-image-div">
        <img src={LoginImage} className="login-image" alt="login" />
      </div>
      
      {/* Login Body Section */}
      <div className='login-form-div'>
        <div className='login-form-align-div'>
          <div className='header-login' >
            <img src={UnicornLogo} className="unicorn-img" alt="unicorn" />
            <p className='header-text-log-in'>Login</p>
            <p className='header-text-small'>Welcome back, please Login to your account </p>
          </div>

          <div>
         
            <div className='email-div' >
              <p className='field-area-text'>Email</p>
              <BasicTextFields submitHandler={handleSubmit} id="login-email" isValidText={handleEmailParentIsValid} currentValue={textFields.userName} handleParentTextChange={handleSetFieldValues} width="30rem" tag="login-username" fieldType={"email"} placeholder="Enter Email"/>
            </div>
           
            

          
            <div className='email-div' >
              <p className='field-area-text'>Password</p>
              <BasicTextFields submitHandler={handleSubmit} currentValue={textFields.password} handleParentTextChange={handleSetFieldValues} width="30rem" tag="login-password" fieldType='password' placeholder="Enter Password"/>
            </div>


            <div className='forgot-password-div'>
              <p  onClick={handleForgotPasswordModalOpen} className='forgot-pass-link-text' style={{ cursor: 'pointer', color: '#075b8f' }}>Forgot Password?</p>
            </div>
          
          </div>

          <div>
            <Button
              sx={{ borderRadius: "30px",  '&:hover': {backgroundColor: '#0E3B53'},height: "55px", background: "#04273A", margin: "40px 0 0 0", display: "flex", width: "30rem" }}
              className='button-common'
              id='loginButton'
              type='submit'
              variant="contained" onClick={handleSubmit}>
              <p style={{fontSize: '18px'}}>
                {
                    loginInProgress === true
                    ? <CircularProgress
                        size={20}
                        sx={{
                          marginTop:'10px',
                          color: 'white',
                        }}
                        />
                    : <p style={{textTransform: 'none', fontSize: '22px',fontWeight: 'bold'}}>Login</p>
                }</p>
            </Button>



            <div className='new-user-div' >
              <p className='field-area-normal-text'>New user?</p>
              <p className='login-text' style={{ cursor:'pointer' }} onClick={goToSignUp}>SignUp</p> 
            </div>
          </div>
        </div>

      </div>


      {/* Forgot Password Modal(1st modal) */}
      <Modal 
          open={open}
          onClose={handleForgotModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          sx={{outline: 'none'}}
      >
          <Box sx={modalStyle}>

            <div className="close-icon" >
              <CloseIcon
                  onClick={handleForgotModalClose}
                  sx={{
                  cursor:'pointer',
                  marginLeft: '95%',
                  color:'#414D5C'
                  }}>
              </CloseIcon>
            </div>

            <div className='main-forgot-pass-div' >
                <Typography id="modal-modal-title" variant="h4" component="h2" sx={{fontWeight:'bold'}}>
                  Forgot Password
                </Typography>
                <Typography id="modal-modal-description" sx={{ fontSize:'18px', color: '#000000AB', margin:'20px 0 0 -15px' }}>
                  Insert your email address to reset your password
                </Typography>
                <div style={{marginTop: "40px", width: '100%' }}>
                  <p className='field-area-text-modal'>Email</p>
                  <BasicTextFields submitHandler={handleForgotPasswordApiCall} isValidText={handleEmailParentIsValid} currentValue={textFields.forgotPasswordEmail} placeholder="Enter Email" handleParentTextChange={handleSetFieldValues} width="100%" tag="forgot-password" fieldType={"email"}/>
                </div>

                <Button
                  sx={{ borderRadius: "30px",  '&:hover': {backgroundColor: '#0E3B53'}, height: "45px", background: "#04273A", margin: "60px 0 0 0", display: "flex", width: "100%" }}
                  variant="contained" onClick={handleForgotPasswordApiCall}>
                    <p style={{display: 'contents'}}>
                    {
                        forgotPasswordProgress === true
                        ? <CircularProgress
                            size={20}
                            sx={{
                              color: 'white',
                            }}
                            />
                        : <p style={{textTransform: 'none', fontSize: '20px'}}>Reset</p>
                    }</p>
                </Button>
            </div>
          </Box>
      </Modal>


      {/* Success Forgot Password Modal */}
      <Modal
        open={forgotMailSuccessModalOpen}
        onClose={handleForgotMailSuccessModal}
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
      >
        <Box sx={modalStyleSuccess}>
          <div className="close-icon" >
            <CloseIcon
                  onClick={handleForgotMailSuccessModal}
                  sx={{
                  cursor:'pointer',
                  marginLeft: '95%',
                  color:'#414D5C'
                  }}>
            </CloseIcon>
          </div>

          <div className='content-main-div'>  
              <img src={Tick} className="tick-img" alt="tick" /></div>
          
              <Typography id="modal-modal-title" variant="h4" component="h2" sx={{fontWeight:'bold', marginTop: '30px' }}>
                Email Sent
              </Typography>

              <Typography id="modal-modal-description" sx={{ display: 'flex', width:'75%', fontSize:'20px', marginTop: '20px', textAlign: 'center' }}>
                {`Instructions for resetting your password have been sent to the email address you submitted`}
              </Typography>
                
              <div className='reset-pass-not-receive-section-div' >
                {
                  resendSuccess ===false 
                  ? <p className='field-area-text'>Not received? </p>
                  : null
                }
                
                {
                  isResendInProgress === true 
                  ? <div className='keep-center'> 
                      <CircularProgress thickness={8} size="1.2rem" style={{ marginTop: '15px' }}/>
                    </div>
                  : resendSuccess ===true 
                    ?<div className='tick-container' style={{ margin: '2rem 0' }}> 
                      <div  className='keep-center' style={{  marginTop: '15px',color:"green", fontWeight: 'bold'}}>Sent again, Please check inbox</div> 
                      <ThumbUpTwoToneIcon style={{ marginTop: '10px', color: 'green' }}/> 
                    </div>
                    : <div onClick={handleForgotPasswordApiCallResend} style={{ marginTop: '15px' }} className='send-text-button-o' >Send again</div>
                }
              </div>
              </Box>
      </Modal>


      {/* Password change confirmation */}
      <Modal
        open={passwordChangeConfirmModalOpen}
        onClose={handlePasswordChangeConfirmationModalClose}
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
      >
        <Box sx={modalStyleFinalSuccess}>
        <div className="close-icon" >
        <CloseIcon
              onClick={handlePasswordChangeConfirmationModalClose}
              sx={{
              cursor:'pointer',
              marginLeft: '95%',
              color:'#414D5C'
              }}>
        </CloseIcon>
      </div>
            <div className='image-confirmation-reset-password'>  
              <img src={Tick} className="tick-img" alt="tick" />
            </div>
            <Typography id="modal-modal-title" variant="h5" sx={{fontWeight:'bold', margin:'20px 0 0 4px'}}>
            Password changed !
            </Typography> 
        </Box>
      </Modal>


      {/* reset password with confirmation modal */}
      <Modal
          open={resetModalOpen}
          onClose={handleResetModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
      >
          <Box sx={modalStyleResetLast} >
          <div className="close-icon-reset" >
            <CloseIcon
                  onClick={handleResetModalClose}
                  sx={{
                  cursor:'pointer',
                  marginLeft: '95%',
                  color:'#414D5C'
                  }}>
            </CloseIcon>
          </div>
          <div className='reset-pass-field-modal-div' >
            <div style={{display: 'flex', flexDirection: 'column', marginBottom: '4rem', justifyContent: 'center', alignItems: 'center',  gap: '10px', width: '100%'}}>
              <Typography id="modal-modal-title" variant="h4" sx={{ fontWeight:'bold'}}>
                         Reset Password
              </Typography>
              <Typography id="modal-modal-title" variant="h6" sx={{ size:'20px', color:'#505051', fontWeight:'400'}}>
                         Please enter your new password
              </Typography>
            </div>

            <div style={{marginTop: "10px"}}>
              <p className='field-area-text-modal'>New password</p>
              <BasicTextFields noCopyPaste={true} submitHandler={handleResetApiCall}  isValidText={handleParentIsValid} showHelper={true} currentValue={textFields.newPassword} handleParentTextChange={handleSetFieldValuesReset} width="100%" placeholder="Enter New Password" tag="reset-new-pass" fieldType={"password"}/>
            </div>
              
            <div style={{marginTop: "10px"}}>
              <p className='field-area-text-modal'>Confirm new password</p>
              <BasicTextFields noCopyPaste={true} isParentErrorStatus={passwordSame} submitHandler={handleResetApiCall} showConfirmCheck={true} otherPasswordValue={textFields.newPassword} isValidText={handleParentIsValid} showHelper={true} currentValue={textFields.confirmPassword} handleParentTextChange={handleSetFieldValuesReset} width="100%" placeholder="Confirm New Password" tag="reset-confirm-pass" fieldType={"password"}/>
            </div>
          
            <div style={{ display: 'flex', justifyContent: 'center'}}>
                  <Button
                    sx={{ borderRadius: "30px",'&:hover': {backgroundColor: '#0E3B53'}, height: "45px", background: "#04273A", margin: "50px 0 0 0", width: "100%" }}
                    variant="contained" onClick={handleResetApiCall}>
                      <p style={{display: 'contents'}}>
                      {
                          resetPasswordProgress === true
                          ? <CircularProgress
                              size={20}
                              sx={{
                                color: 'white',
                              }}
                              />
                          : <p style={{textTransform: 'none', fontSize: '18px'}}>Reset</p>
                      }</p>
                  </Button>
            </div> 
          </div>
        </Box>
      </Modal>

    </RowContainer>
  );
}

