import './ProfileAvatar.css';

export default function ProfileAvatar(props) {
  const { id, size = 'medium' } = props; // Properly destructure props
  const backgroundImage = `url("https://d2j1y2zruzhz3t.cloudfront.net/avatars/processed/${props.id}.jpg")`;
  const sizeClass = `profile-avatar-${size}`;

  return (
    <div 
      className={`profile-avatar ${sizeClass}`}
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    ></div>
  );
}