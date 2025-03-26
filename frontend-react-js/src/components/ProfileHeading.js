import './ProfileHeading.css';
 import EditProfileButton from '../components/EditProfileButton';
 
 export default function ProfileHeading(props) {
  console.log("Profile Data:", props.profile); // Debugging

  if (!props.profile) {
    return <div>Loading...</div>; // Handle the case where profile is undefined
  }
   const backgroundImage = 'url("/Images/BG.jpg")';
   const styles = {
     backgroundImage: backgroundImage,
     backgroundSize: 'cover',
     backgroundPosition: 'center',
   };
   return (
   <div className='activity_feed_heading profile_heading'>
     <div className='title'>{props.profile.display_name}</div>
     <div className="cruds_count">{props.profile.cruds_count} Cruds</div>
     <div className="banner" style={styles} >
       <div className="avatar">
         <img src="/images/data.jpg"></img>
       </div>
     </div>
     <div className="info">
       <div class='id'>
         <div className="display_name">{props.profile.display_name}</div>
         <div className="handle">@{props.profile.handle}</div>
       </div>
       <EditProfileButton setPopped={props.setPopped} />
     </div>
     <div class="bio">{props.profile.bio}</div>
   </div>
   );
 }