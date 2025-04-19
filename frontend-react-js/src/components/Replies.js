import './Replies.css';

import ActivityItem from './ActivityItem';

export default function Replies(props) {
  // Ensure replies is always an array, default to empty array if not
  const replies = Array.isArray(props.replies) ? props.replies : [];
  let content;
  if (replies.length === 0){
    content = <div className='replies_primer'>
      <span>Nothing to see here yet</span>
    </div>
  } else {
    content = <div className='activities_feed_collection'>
      {replies.map(activity => {
      return  <ActivityItem 
          setReplyActivity={props.setReplyActivity}
          setPopped={props.setPopped}
          key={activity.uuid}
          activity={activity} 
        />
      })}
    </div>
  }

  return (<div>
    {content}
  </div>
  );
}