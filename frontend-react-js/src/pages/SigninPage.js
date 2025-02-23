import './SigninPage.css';
import React from "react";
import {ReactComponent as Logo} from '../components/svg/logo.svg';
import { Link } from "react-router-dom";

// [TODO] Authenication
import { signIn, signOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';


export default function SigninPage() {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState('');
  const [cognitoErrors, setCognitoErrors] = React.useState('');
 

  const onsubmit = async (event) => { 
    setErrors('');
    event.preventDefault();
  
    try {
      console.log("Signing in user...");
  
      //  Sign in with forced USER_PASSWORD_AUTH
      const user = await signIn({
        username: email,
        password,
        options: { authFlowType: "USER_PASSWORD_AUTH" }
      });
  
      console.log("User Signed In:", user);
  
      //  Explicitly fetch session details after signing in
      const session = await fetchAuthSession();
      
      console.log("Session Retrieved:", session);

      const userInfo = await getCurrentUser();
    
      console.log("User Info:", userInfo);
  
      // Extract username or preferred username
      const username = userInfo.signInDetails?.loginId || 
                       userInfo.attributes?.preferred_username || 
                       userInfo.attributes?.name || 
                       userInfo.username;
    // Store in localStorage
      localStorage.setItem("username", username);  
      if (session?.tokens?.idToken) {
        localStorage.setItem("access_token", session.tokens.idToken);
        window.location.href = "/";
      } else {
        throw new Error("No session token found after sign-in.");
      }
  
    } catch (error) {
      console.error("Sign-in Error:", error);
      if (error.name === 'UserNotConfirmedException') {
        window.location.href = "/confirm";
      }
      setErrors(error.message);
    }
  };
  
  
  const email_onchange = (event) => {
    setEmail(event.target.value);
  }
  const password_onchange = (event) => {
    setPassword(event.target.value);
  }

  let el_errors;
  if (errors){
    el_errors = <div className='errors'>{errors}</div>;
  }

  return (
    <article className="signin-article">
      <div className='signin-info'>
        <Logo className='logo' />
      </div>
      <div className='signin-wrapper'>
        <form 
          className='signin_form'
          onSubmit={onsubmit}
        >
          <h2>Sign into your Cruddur account</h2>
          <div className='fields'>
            <div className='field text_field username'>
              <label>Email</label>
              <input
                type="text"
                value={email}
                onChange={email_onchange} 
              />
            </div>
            <div className='field text_field password'>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={password_onchange} 
              />
            </div>
          </div>
          {el_errors}
          <div className='submit'>
            <Link to="/forgot" className="forgot-link">Forgot Password?</Link>
            <button type='submit'>Sign In</button>
          </div>

        </form>
        <div className="dont-have-an-account">
          <span>
            Don't have an account?
          </span>
          <Link to="/signup">Sign up!</Link>
        </div>
      </div>

    </article>
  );
}