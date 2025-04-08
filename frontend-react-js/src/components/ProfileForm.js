import './ProfileForm.css';
import React from "react";
import process from 'process';
//import {getAccessToken} from 'lib/CheckAuth';

export default function ProfileForm(props) {
  const [bio, setBio] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');

  React.useEffect(()=>{
    setBio(props.profile.bio || '');
    setDisplayName(props.profile.display_name); 
  }, [props.profile])

  const s3uploadkey = async (extension)=> {
    console.log('Getting upload key for extension:',extension)
    try {
      const gateway_url = `${process.env.REACT_APP_API_GATEWAY_ENDPOINT_URL}/avatars/key_upload`;
      console.log('Using gateway URL:', gateway_url);
      const access_token = localStorage.getItem("access_token")
      if (!access_token) {
        throw new Error('No access token found');
      }

      const json = {
        extension: extension
      }

      const res = await fetch(gateway_url, {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
          'Origin': process.env.REACT_APP_FRONTEND_URL,
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Response status:', res.status);

      if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response text:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      throw new Error(errorData.error || 'Failed to get upload URL');
    } 
      
      const data = await res.json();
      console.log('Success response:', data);
      return data.url;
    } catch (err) {
      console.error('s3uploadkey error:', err);
      throw err;
    }
  }
  
  const s3upload = async (event)=> {
    try {
      console.log('event', event)
      const file = event.target.files[0];
      if (!file) return;
      
      const filename = file.name;
      const size = file.size;
      const type = file.type;
      console.log(filename, size, type);
      
      const fileparts = filename.split('.');
      const extension = fileparts[fileparts.length-1].toLowerCase();
      
      // Get presigned URL
      const presignedUrl = await s3uploadkey(extension);
      if (!presignedUrl) {
        throw new Error('No presigned URL returned');
      }
      
      console.log('Presigned URL:', presignedUrl);
  
      // Upload file to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': type
        }
      });
  
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
  
      // Return the S3 object URL (without query parameters)
      const s3ObjectUrl = presignedUrl.split('?')[0];
      console.log('Upload successful:', s3ObjectUrl);
      return s3ObjectUrl;
    } catch (err) {
      console.error('s3upload error:', err);
      throw err;
    }
  }

  const onsubmit = async (event) => {
    event.preventDefault();
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/profile/update`
      //await getAccessToken()
      const access_token = localStorage.getItem("access_token")
      const res = await fetch(backend_url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio: bio,
          display_name: displayName
        }),
      });
      let data = await res.json();
      if (res.status === 200) {
        setBio(null)
        setDisplayName(null)
        props.setPopped(false)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const bio_onchange = (event) => {
    setBio(event.target.value);
  }

  const display_name_onchange = (event) => {
    setDisplayName(event.target.value);
  }

  const close = (event)=> {
    if (event.target.classList.contains("profile_popup")) {
      props.setPopped(false)
    }
  }

  if (props.popped === true) {
    return (
      <div className="popup_form_wrap profile_popup" onClick={close}>
        <form 
          className='profile_form popup_form'
          onSubmit={onsubmit}
        >
          <div className="popup_heading">
            <div className="popup_title">Edit Profile</div>
            <div className='submit'>
              <button type='submit'>Save</button>
            </div>
          </div>
          <div className="popup_content">
            
          <input type="file" name="avatarupload" onChange={s3upload} />

            <div className="field display_name">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={display_name_onchange} 
              />
            </div>
            <div className="field bio">
              <label>Bio</label>
              <textarea
                placeholder="Bio"
                value={bio}
                onChange={bio_onchange} 
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}