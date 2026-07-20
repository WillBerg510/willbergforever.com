import YouTubeIcon from "../assets/YouTube.svg";
import SpotifyIcon from "../assets/Spotify.svg";
import GlobeIcon from "../assets/Globe.svg";
import ViewIcon from "../assets/View.svg";
import MusicIcon from '../assets/Music Map Icon.png';
import InteractiveIcon from '../assets/Interactive Map Icon.png';
import VideoIcon from '../assets/Video Map Icon.png';
import ArtIcon from '../assets/Art Map Icon.png';
import PhotosIcon from '../assets/Photos Map Icon.png';
import ExitArrow from '../assets/Exit Icon.png';
import HomeIcon from '../assets/Home Icon.png';
import regions from '../constants/regions.js';
import projectGroups from '../constants/projectGroups.js';
import PlayIcon from "../assets/Play.svg";
import PauseIcon from "../assets/Pause.svg";
import RewindIcon from "../assets/Rewind.svg";
import LoopIcon from "../assets/Loop.svg";
import FullscreenIcon from "../assets/Fullscreen.svg";
import ExitFullscreenIcon from "../assets/Exit Fullscreen.svg";
import BackIcon from "../assets/Back.svg";

const imagesToLoad = [
  ...regions.flatMap(region => region.holdsProjects ? region.divisions?.map(division => division?.image).filter(Boolean) ?? [] : []),
  ...Object.values(projectGroups).map(group => group.icon),
  MusicIcon,
  InteractiveIcon,
  VideoIcon,
  ArtIcon,
  PhotosIcon,
  ExitArrow,
  HomeIcon,
  YouTubeIcon,
  SpotifyIcon,
  GlobeIcon,
  ViewIcon,
  PlayIcon,
  PauseIcon,
  RewindIcon,
  LoopIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
  BackIcon,
];

export default imagesToLoad;