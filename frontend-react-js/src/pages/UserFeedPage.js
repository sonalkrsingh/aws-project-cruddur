import './UserFeedPage.css';
import React from "react";
import { useParams } from 'react-router-dom';

import DesktopNavigation  from '../components/DesktopNavigation';
import DesktopSidebar     from '../components/DesktopSidebar';
import ActivityFeed from '../components/ActivityFeed';
import ActivityForm from '../components/ActivityForm';
import ProfileHeading from '../components/ProfileHeading';
import ProfileForm from '../components/ProfileForm';
  
//import {checkAuth, getAccessToken} from '../lib/CheckAuth';
import { getCurrentUser, fetchUserAttributes  } from '@aws-amplify/auth';

export default function UserFeedPage() {
  const [activities, setActivities] = React.useState([]);
  const [profile, setProfile] = React.useState([]);
  const [popped, setPopped] = React.useState([]);
  const [poppedProfile, setPoppedProfile] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);

  const params = useParams();

  const loadData = async () => {
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/${params.handle}`
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found! Authentication might have failed.");
        return;
      }

      const res = await fetch(backend_url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        method: "GET"
      });

      let resJson = await res.json();
      if (res.status === 200) {
        setProfile(resJson.profile)
        setActivities(resJson.activities)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  };

  // check if we are authenicated
  const checkAuth = async () => {
    try {
      const cognito_user = await getCurrentUser();
      console.log("Cognito User:", cognito_user);
  
      const userAttributes = await fetchUserAttributes();
      console.log("User Attributes:", userAttributes);
  
      const session = cognito_user?.signInSession;
      console.log("Session:", session);
  
      const accessToken = session?.accessToken?.toString(); // Extract token
      console.log("Access Token:", accessToken);
  
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
  
      setUser({
        uuid: userAttributes.sub,
        display_name: userAttributes.preferred_username || userAttributes.name || cognito_user.signInDetails?.loginId || "My Name",
        handle: userAttributes.preferred_username || cognito_user.username || "handle"
      });
  
    } catch (err) {
      console.log("Error fetching user:", err);
    }
  };

  React.useEffect(()=>{
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth();
  }, [])

  return (
    <article>
      <DesktopNavigation user={user} active={'profile'} setPopped={setPopped} />
      <div className='content'>
        <ActivityForm popped={popped} setActivities={setActivities} />
        <ProfileForm 
           profile={profile}
           popped={poppedProfile} 
           setPopped={setPoppedProfile} 
         />
        <div className='activity_feed'>
           <ProfileHeading setPopped={setPoppedProfile} profile={profile} />
           <ActivityFeed activities={activities} />
         </div>
      </div>
      <DesktopSidebar user={user} />
    </article>
  );
}