import './ActivityShowPage.css';
import React from "react";
import { useParams, useNavigate } from 'react-router-dom';

import DesktopNavigation  from 'components/DesktopNavigation';
import DesktopSidebar     from 'components/DesktopSidebar';
import ActivityForm from 'components/ActivityForm';
import ReplyForm from 'components/ReplyForm';
import Replies from 'components/Replies';
import ActivityShowItem from 'components/ActivityShowItem'

import checkAuth from 'lib/CheckAuth';

export default function ActivityShowPage() {
  const [activity, setActivity] = React.useState(null);
  const [replies, setReplies] = React.useState([]);
  const [popped, setPopped] = React.useState(false);
  const [poppedReply, setPoppedReply] = React.useState(false);
  const [replyActivity, setReplyActivity] = React.useState({});
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);
  const params = useParams();

  const navigate = useNavigate();
 	const goBack = () => {
 		navigate(-1);
 	}

  const loadData = async () => {
    try {
        console.log("Access Token in Local Storage:", localStorage.getItem("access_token"));
  
        const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/${params.handle}/status/${params.activity_uuid}`
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
        console.log("resJson:", resJson);
        if (res.status === 200) {
          setActivity(resJson.activity || resJson); // Handle both response formats
          setReplies(resJson.replies || []); // Ensure replies is always an array
        } else {
          console.log(res)
        }
      } catch (err) {
        console.log(err);
      }
    };
  
  React.useEffect(()=>{
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth(setUser);
  }, [])

  let el_activity
  if (activity !== null){
    el_activity = (
      <ActivityShowItem  
        setReplyActivity={setReplyActivity}
        setPopped={setPoppedReply}
        activity={activity} 
      />
    )
  }

  return (
    <article>
      <DesktopNavigation user={user} active={'home'} setPopped={setPopped} />
      <div className='content'>
        <ActivityForm  
          popped={popped}
          setPopped={setPopped} 
        />
        <ReplyForm 
          activity={replyActivity} 
          popped={poppedReply} 
          setReplies={setReplies}
          setPopped={setPoppedReply} 
        />
        <div className='activity_feed'>
        <div className='activity_feed_heading flex'>
        <div className="back" onClick={goBack}>&larr;</div>
            <div className='title'>Home</div>
          </div>
          {el_activity}
          <Replies
            setReplyActivity={setReplyActivity} 
            setPopped={setPoppedReply} 
            replies={Array.isArray(replies) ? replies : []} 
          />
        </div>
      </div>
      <DesktopSidebar user={user} />
    </article>
  );
}