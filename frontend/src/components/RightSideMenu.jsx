import SpotifyIcon from "../assets/Spotify.svg";
import LinkedInIcon from "../assets/LinkedIn.svg";
import YouTubeIcon from "../assets/YouTube.svg";
import GitHubIcon from "../assets/GitHub.svg";
import AppleMusicIcon from "../assets/Apple Music.svg";
import InstagramIcon from "../assets/Instagram.svg";

const externals = [
  {icon: YouTubeIcon, link: "https://www.youtube.com/WillBergYT"},
  {icon: SpotifyIcon, link: "https://open.spotify.com/artist/2RjoYVcAJfOPgRCIvJlAcx?si=yntsPQjPS4GkS-mQqZ4kAg"},
  {icon: LinkedInIcon, link: "https://www.linkedin.com/in/bergwill/"},
  {icon: InstagramIcon, link: "https://www.instagram.com/the.fanciest.one/"},
  {icon: AppleMusicIcon, link: "https://music.apple.com/us/artist/will-berg/1728358338"},
  {icon: GitHubIcon, link: "https://github.com/WillBerg510"},
];

const RightSideMenu = (props) => {
  const onButtonClick = (link) => {
    window.open(link, "_blank");
  }

  return (
    <div className="rightSideMenu">
      {externals.map(external =>
        <img className="rightSideLink" src={external.icon} onClick={() => onButtonClick(external.link)} />
      )}
    </div>
  );
};

export default RightSideMenu;