import './ProfileInfo.css';
import {ReactComponent as ElipsesIcon} from './svg/elipses.svg';
import ProfileAvatar from 'components/ProfileAvatar'
import React from "react";

// [TODO] Authenication
import { signOut } from 'aws-amplify/auth';

export default function ProfileInfo(props) {
  console.log("Profile Data:", props.user); // Debugging
  const [popped, setPopped] = React.useState(false);

  const click_pop = (event) => {
    setPopped(!popped)
  }

  const handleSignOut = async () => {
    try {
      await signOut(); 
      window.location.href = "/";
      //localStorage.removeItem("access_token");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const classes = () => {
    let classes = ["profile-info-wrapper"];
    if (popped === true){
      classes.push('popped');
    }
    return classes.join(' ');
  }

  const backgroundImage = `url("https://d2j1y2zruzhz3t.cloudfront.net/avatars/processed/${props.id}.jpg")`;
  //const backgroundImage = 'url("/Images/BG.jpg")';
  const styles = {
    backgroxundImage: backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className={classes()}>
      <div className="profile-dialog">
        <button onClick={handleSignOut}>Sign Out</button> 
      </div>
      <div className="profile-info" onClick={click_pop}>
      <ProfileAvatar id={props.user?.uuid || "default-id"} size="small" />
        <div className="profile-desc">
          <div className="profile-display-name">{props.user.display_name || "My Name" }</div>
          <div className="profile-username">@{props.user.handle || "handle"}</div>
        </div>
        <ElipsesIcon className='icon' />
      </div>
    </div>
  )
}