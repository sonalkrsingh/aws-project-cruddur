import './ActivityFeed.css';
import ActivityItem from './ActivityItem';

export default function ActivityFeed(props) {
  return (
    <div className='activity_feed_collection'>
       {props.activities.map((activity, index) => {
        const key = activity.uuid || `${activity.handle}-${index}`; // fallback for debugging
       return  <ActivityItem
       key={key}
       setReplyActivity={props.setReplyActivity}
       setPopped={props.setPopped}
       activity={activity}
     />
       })}
    </div>
  );
} 