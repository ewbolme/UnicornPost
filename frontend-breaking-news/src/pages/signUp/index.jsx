import React, { useState } from 'react'; 
import { Typography, CircularProgress } from "@mui/material";
import RowContainer from '../../components/rowContainer/rowContainer.container.jsx';
import BasicTextFields from '../../components/textField/textField.component.jsx';
import BottomBar from '../../components/bottomBar/bottomBar.component.jsx';
import signUpImage from "../../static/images/sign-up-image.svg";
import UnicornLogo from "../../static/images/unicorn-logo-faint.svg";
import './signUp.css'
import Button from '@mui/material/Button';
import { handleSignUp, handleSignUpResendMail } from '../../services/auth.service.js';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Tick from "../../static/images/tick.svg"
import CloseIcon from '@mui/icons-material/Close';
import { handleDefaultNotificationPopUp } from '../../services/validator.service.js';
import ThumbUpTwoToneIcon from '@mui/icons-material/ThumbUpTwoTone';

const handleLogin = async () =>{
  window.location.href = "/";
}




export default function SignUp() {

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
    textAlign: 'center'
  }

  const [textFields, setTextFields] = useState({
    userName: "",
    email: "",
    password: ""
  });
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [signUpInProgress, setSignUpInProgress] = useState(false);
  const [passwordChangeConfirmModalOpen, setPasswordChangeConfirmModalOpen] = useState(false);
  const [showNotVerifiedModal, setShowNotVerifiedModal] = useState(false);
  const [isResendInProgress, setIsResendInProgress] = useState(false);
  const[resendSuccess,setResendSuccess]=useState(false);

  const handleSetFieldValues = (value,tag) =>{
    if(tag === "login-username"){
      setTextFields({
        ...textFields,
        userName: value
      });
    }else if(tag === "login-email"){
      setTextFields({
        ...textFields,
        email: value
      });
    }else if(tag === "login-password"){
      setTextFields({
        ...textFields,
        password: value
      });
    }
  }

  const handleModalClose= () => {
    setResendSuccess(true);
    setIsResendInProgress(false);
    setPasswordChangeConfirmModalOpen(false);
    window.location.href = "/sign-up";
  }

  const handleResendModalClose= () => {
    setShowNotVerifiedModal(false);
    window.location.href = "/sign-up";
  }

  const handleParentIsValid = (value) => {
    setIsPasswordValid(value);
  }

  const handleEmailParentIsValid = (value) => {
    setIsEmailValid(value);
  }


  const handleUserNameIsValid = (value) =>{
    setIsUsernameValid(value);
  }


  const handleSignUpApiCall = async () =>{

    if(textFields?.userName === "" || isUsernameValid === false){
      handleDefaultNotificationPopUp("warning","Please provide valid Username.");

    }else if ( textFields?.email === "" || isEmailValid === false){
      handleDefaultNotificationPopUp("warning","Please provide valid Email.");

    }else if (textFields?.password === "" || isPasswordValid === false){
      handleDefaultNotificationPopUp("warning","Please provide valid Password.");

    }else{
      setSignUpInProgress(true);
      const isSignUpSuccess = await handleSignUp(textFields?.userName,textFields?.email, textFields?.password);

      if(isSignUpSuccess.status){

        setPasswordChangeConfirmModalOpen(true);
      }else if (!isSignUpSuccess.status){

        const text =isSignUpSuccess.message.split(" ");

        if(text[0].includes("UserNotConfirmedException")){

          setShowNotVerifiedModal(true);
        }else{

          const[,...rest]=text;
          const correctVal = (" "+rest+" ").replaceAll(","," ");
  
          handleDefaultNotificationPopUp("warning",correctVal);
  
        }

      }else{
        handleDefaultNotificationPopUp("warning","Something went wrong. We are looking into it!");
      }
      setSignUpInProgress(false);
    }
  }

  const handleResendSignUpVerificationMailApi = async () => {
    
    setIsResendInProgress(true);

    const isResendSuccess= await handleSignUpResendMail(textFields?.email);

    if(isResendSuccess.status===false){
      setResendSuccess(false);

      const text =isResendSuccess.message.split(" ");
      setIsResendInProgress(false);
      const[,...rest]=text;
      const correctVal = (" "+rest+" ").replaceAll(","," ");
      handleDefaultNotificationPopUp("warning",correctVal);
    }else{

      setResendSuccess(true);
      setIsResendInProgress(false);
    }
  }


  return (
    <RowContainer  className="outer-row-container" padding={'0 40px 0 40px'} gap={'100px'} align={'center'}>

      <div className="sign-up-image-div">
        <img src={signUpImage} className="sign-up-image" alt="sign-up" />
      </div>
      
      <div className='sign-up-form-div'>
        <div className='header-sign-up' >
          <img src={UnicornLogo} className="unicorn-img" alt="unicorn" />
          <p className='header-text-sign-up'>SignUp</p>
          <p className='header-text-small'>Enter your details below to create your account and get started.</p>
        </div>

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', maxWidth: '30rem' }}>
            <p className='field-area-text'>User name</p>
              <BasicTextFields submitHandler={handleSignUpApiCall} isValidText={handleUserNameIsValid} showHelper={true} currentValue={textFields.userName} handleParentTextChange={handleSetFieldValues} width="30rem" tag="login-username" fieldType={"username"} placeholder="Enter Username"/>
          </div>
        
          <div style={{  display: 'flex', flexDirection: 'column', justifyContent: 'space-around', maxWidth: '30rem' }}>
            <p className='field-area-text'>Email</p>
              <BasicTextFields submitHandler={handleSignUpApiCall} isValidText={handleEmailParentIsValid} currentValue={textFields.email} handleParentTextChange={handleSetFieldValues} width="30rem" tag="login-email" fieldType={"email"} placeholder="Enter Email"/>
          </div>
        
          <div style={{  display: 'flex', flexDirection: 'column', justifyContent: 'space-around', maxWidth: '30rem' }}>
            <RowContainer>
              <p className='field-area-text'>Password</p>
            </RowContainer>
              <BasicTextFields submitHandler={handleSignUpApiCall} showHelper={true} isValidText={handleParentIsValid} currentValue={textFields.password} handleParentTextChange={handleSetFieldValues} width="30rem" tag="login-password" fieldType={"password"} placeholder="Enter Password"/>
          </div>
        </div>

        <div>
          <Button
            className='button-common'
            sx={{ borderRadius: "30px", '&:hover': {backgroundColor: '#0E3B53'},height: "55px", background: "#04273A", margin: "60px 0 0 0", display: "flex", width: "30rem" }}
            variant="contained" onClick={handleSignUpApiCall}>
            <p style={{fontSize: '18px'}}>
            {
                  signUpInProgress === true
                  ? <CircularProgress
                      size={20}
                      sx={{
                        color: 'white',
                        marginTop:'10px',
                      }}
                      />
                  : <p style={{textTransform: 'none', fontSize:'22px', fontWeight:'bold'}}>SignUp</p>
              }
            </p>
          </Button>

          <div  style={{ display: 'flex', width: '100%', marginTop: '10%' }}>
            <p className='field-area-normal-text'>Already have account? </p>
            <p className='login-text' style={{cursor: 'pointer'}} onClick={handleLogin}>Login </p> 
            <BottomBar></BottomBar>
          </div>
        </div>

      </div>

      <Modal
        open={passwordChangeConfirmModalOpen}
        onClose={handleModalClose}
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
      >
        <Box sx={modalStyleFinalSuccess}>
        <div className="close-icon" style={{
                        padding: '10px 20px 10px 20px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        color: '#9BA7B6',
                        fontSize: '16px',
                        marginLeft: '2vw'
                    }}>
        <CloseIcon
              onClick={handleModalClose}
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
            A verification link has been sent to your email account
            </Typography>
            <Typography id="modal-modal-title" variant="h7" sx={{margin:'20px 0 0 4px'}}>
            Please click on the link that has just been sent to your email account to verify your email and log in to your account.
            </Typography>

            <div  style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', justifyContent: 'center'}}>
                  
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
                      ?<div className='tick-container'> 
                        <div  className='keep-center' style={{ marginTop: '15px',color:"green", fontWeight: 'bold'}}>Sent again, Please check inbox</div> 
                        <ThumbUpTwoToneIcon style={{ marginTop: '10px', color: 'green' }}/> 
                      </div>
                      : <div onClick={handleResendSignUpVerificationMailApi} style={{ marginTop: '15px' }} className='send-text-button-o' >Send again</div>
                  }
            </div>
            
        </Box>
      </Modal>

      <Modal
        open={showNotVerifiedModal}
        onClose={handleResendModalClose}
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
      >
        <Box sx={modalStyleFinalSuccess}>
          <div className="close-icon" style={{
                padding: '10px 20px 10px 20px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                color: '#9BA7B6',
                fontSize: '16px',
                marginLeft: '47rem'
            }}>
            <CloseIcon
                  onClick={handleResendModalClose}
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
            A verification link was already sent to your email account
          </Typography>
          <Typography id="modal-modal-title" variant="h7" sx={{margin:'20px 0 0 4px'}}>
            Please check you inbox for the email and click on the attached link to verify your email.
          </Typography>
          <Typography id="modal-modal-title" variant="h7" sx={{margin:'20px 0 0 4px'}}>
            You can then continue to login into your account.
          </Typography>

          <div  style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', justifyContent: 'center'}}>
                
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
                      ?<div className='tick-container'> 
                        <div  className='keep-center' style={{ marginTop: '15px',color:"green", fontWeight: 'bold'}}>Sent again, Please check inbox</div> 
                        <ThumbUpTwoToneIcon style={{ marginTop: '10px', color: 'green' }}/> 
                      </div>
                      : <div onClick={handleResendSignUpVerificationMailApi} style={{ marginTop: '15px' }} className='send-text-button-o' >Send again</div>
                  }
          </div>
            
        </Box>
      </Modal>

    </RowContainer>
  );
}

