import '../stylesheets/SideMenu.css';
import projectGroups from '../constants/projectGroups.js';
import MapIcon from '../assets/Map Icon.png';
import MoreIcon from '../assets/More Groups Icon.png';

const menuItems = [
  { name: 'Map', icon: MapIcon, color: '#a9167a' },
  ...Object.values(projectGroups).slice(0, 5),
  { name: 'More Groups', icon: MoreIcon, color: '#00a894' },
];

const SideMenu = (props) => {
  const {getGroupProjects, setMenu, menu, loaded, listMode, setListMode, firstOpen, onMapClick} = props;

  const onButtonClick = (name) => {
    if (name == "Map") {
      onMapClick();
      setListMode(false);
    } else {
      setMenu(name);
      setListMode(false);
      if (name != menu && name != "More Groups") {
        getGroupProjects(name.toLowerCase());
      }
    }
  }

  return (
    <nav className={`sideMenu listMode-${listMode} firstOpen-${firstOpen}`}>
      {loaded && menuItems.map(({name, icon, color}) => (
        <button
          className={`sideMenuButton button-${name}`}
          type="button"
          key={name}
          style={{'--side-menu-hover-color': color}}
          onClick={() => onButtonClick(name)}
        >
          <div className="sideMenuButtonRow">
            <img src={icon} />
            <p className="sideMenuButtonText">{name.toUpperCase()}</p>
          </div>
        </button>
      ))}
    </nav>
  );
};

export default SideMenu;