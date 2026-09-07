import '../stylesheets/SideMenu.css';
import projectGroups from '../constants/projectGroups.js';
import MapIcon from '../assets/Map Icon.png';
import MoreIcon from '../assets/More Groups Icon.png';
import WillBergLogo from '../assets/WillBergLogo.png';

const menuItems = [
  { name: 'Map', icon: MapIcon, color: '#a9167a' },
  ...Object.values(projectGroups).slice(0, 5),
  { name: 'More Groups', icon: MoreIcon, color: '#00a894' },
];

const SideMenu = (props) => {
  const {getGroupProjects, setMenu, menu} = props;

  const onButtonClick = (name) => {
    if (menu == name) return;
    setMenu(name);
    if (name != "Map" && name != "More Groups") {
      getGroupProjects(name.toLowerCase());
    }
  }

  return (
    <nav className="sideMenu">
      <img className="mainHeading" src={WillBergLogo}/>
      {menuItems.map(({name, icon, color}) => (
        <button
          className="sideMenuButton"
          type="button"
          key={name}
          style={{'--side-menu-hover-color': color}}
          onClick={() => onButtonClick(name)}
        >
          <div className="sideMenuButtonColumn">
            <img src={icon} />
            <p className="sideMenuButtonText">{name.toUpperCase()}</p>
          </div>
        </button>
      ))}
    </nav>
  );
};

export default SideMenu;