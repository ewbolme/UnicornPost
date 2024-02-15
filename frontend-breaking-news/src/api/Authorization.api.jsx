import axios from 'axios';
import * as urls from './_config';

class AuthApi {
  constructor() {

    this.Login = async (userName, password) => {
      const result = await axios.post(`${urls.BASE_URL}/login`, 
      {
        "user_email": userName,
        "user_password": password
      });
      return result;
    };

    this.SignUp = async (userName, email, password) => {
      const result = await axios.post(`${urls.BASE_URL}/create-user`, 
      {
        "user_name": userName,
        "user_email": email,
        "user_password": password
      });
      return result;
    };

    this.ForgotPassword = async (email) => {
      const result = await axios.post(`${urls.BASE_URL}/forgot-password`, 
      {
        "user_email": email
      });
      return result;
    };

    this.VerifyUser = async (userName, code) => {
      const result = await axios.post(`${urls.BASE_URL}/verify-user`, 
      {
        "user_name": userName,
        "verification_code": code
      });
      return result;
    };


    this.CheckEmailExpired = async (email) => {
      const result = await axios.post(`${urls.BASE_URL}/is-reset-password`, 
      {
        "user_email": email
    });
      return result;
    }

    this.CheckResetLinkExpired = async (code, email) => {
      const result = await axios.post(`${urls.BASE_URL}/verify-reset-password-count`, 
      {
        "user_email": email,
        "reset_password_count": code
      });
      return result;
    }

    this.SignUpResendMail = async (email) => {
      const result = await axios.post(`${urls.BASE_URL}/resend-verification-mail`, 
      {
        "user_email": email
      });
      return result;
    }

    this.VerifyOtp = async (otp) => {
      //change name of endpoint
      const result = await axios.post(`${urls.BASE_URL}/verify-user`, 
      {
        "otp": otp
      });
      return result;
    };

    this.ResetPassword = async (data) => {
      const result = await axios.post(`${urls.BASE_URL}/reset-password`, 
      data);
      return result;
    };
  }
}

const Api = new AuthApi();
export default Api;
