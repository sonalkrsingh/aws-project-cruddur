import './HomeFeedPage.css';
import React from "react";

import checkAuth from '../lib/CheckAuth';
import DesktopNavigation  from '../components/DesktopNavigation';
import DesktopSidebar     from '../components/DesktopSidebar';
import ActivityFeed from '../components/ActivityFeed';
import ActivityForm from '../components/ActivityForm';
import ReplyForm from '../components/ReplyForm';

//aws-ampilfy
import { getCurrentUser, fetchUserAttributes  } from '@aws-amplify/auth';

export default function HomeFeedPage() {
  const [activities, setActivities] = React.useState([]);
  const [popped, setPopped] = React.useState(false);
  const [poppedReply, setPoppedReply] = React.useState(false);
  const [replyActivity, setReplyActivity] = React.useState({});
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);

  const loadData = async () => {
    try {
      console.log("Access Token in Local Storage:", localStorage.getItem("access_token"));

      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/home`
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
        setActivities(resJson)
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
    checkAuth(setUser);
  }, [])

  return (
    <article>
      <DesktopNavigation user={user} active={'home'} setPopped={setPopped} />
      <div className='content'>
        <ActivityForm  
          user={user}
          popped={popped}
          setPopped={setPopped} 
          setActivities={setActivities} 
        />  
        <ReplyForm 
          activity={replyActivity} 
          popped={poppedReply} 
          setPopped={setPoppedReply} 
          setActivities={setActivities} 
          activities={activities} 
        />
        <ActivityFeed 
          title="Home" 
          setReplyActivity={setReplyActivity} 
          setPopped={setPoppedReply} 
          activities={activities} 
        />
      </div>
      <DesktopSidebar user={user} />
    </article>
  );
}