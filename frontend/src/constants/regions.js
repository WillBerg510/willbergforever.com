import BeachWest from "../assets/Palm Tree Paradise West.jpg";
import BeachEast from "../assets/Palm Tree Paradise East.jpg";
import CityDowntown from "../assets/Commute City Downtown.jpg";
import CityUptown from "../assets/Commute City Uptown.jpg";
import ClubLower from "../assets/The Rage Room Lower Level.jpg";
import ClubUpper from "../assets/The Rage Room Upper Level.jpg";
import BeachIcon from "../assets/Palm Tree Paradise Icon.png";
import CityIcon from "../assets/Commute City Icon.png";
import ClubIcon from "../assets/The Rage Room Icon.png";

const regions = [
  {
    name: "Palm Tree Paradise",
    code: "beach",
    position: [23, 20.5],
    zoom: [3, 22.5, 19],
    arrow: [70, "down"],
    color: "#b3e89f",
    icon: BeachIcon,
    divisions: [
      {
        name: "West",
        code: "west",
        position: [-30, -24.5],
        arrow: [65, "down"],
        image: BeachWest,
        direction: [-40, 0],
        exit: [87, 40],
      },
      {
        name: "East",
        code: "east",
        position: [-12.5, -4.5],
        arrow: [25, "up"],
        image: BeachEast,
        direction: [40, 0],
        exit: [17, 41],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "Commute City",
    code: "city",
    position: [47.5, 62],
    zoom: [2.5, 0, 2],
    arrow: [50, "up"],
    color: "#adcaf5",
    icon: CityIcon,
    divisions: [
      {
        name: "Downtown",
        code: "downtown",
        position: [42.5, 69],
        arrow: [65, "up"],
        image: CityDowntown,
        direction: [-30, 45],
        exit: [42, 14],
      },
      {
        name: "Uptown",
        code: "uptown",
        position: [55.5, 17.5],
        arrow: [30, "down"],
        image: CityUptown,
        direction: [30, -45],
        exit: [19, 78],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "The Rage Room",
    code: "club",
    position: [73.3, 20],
    zoom: [3, -20, 16.5],
    arrow: [30, "down"],
    color: "#ede096",
    icon: ClubIcon,
    divisions: [
      {
        name: "Lower Level",
        code: "lower",
        position: [104.5, 4],
        arrow: [65, "up"],
        image: ClubLower,
        direction: [-40, 15],
        exit: [80, 69],
      },
      {
        name: "Upper Level",
        code: "upper",
        position: [123, -20.5],
        arrow: [27, "down"],
        image: ClubUpper,
        direction: [40, -15],
        exit: [42, 72],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "Updates from Will",
    code: "updates",
    position: [50.075, 6.75],
    arrow: [50, "down"],
    holdsProjects: false,
  },
  /*{
    name: "Ryan's Factory",
    code: "factory",
    position: [28, 84],
    arrow: [70, "up"],
    holdsProjects: false,
  },
  {
    name: "Bob's Daily Races",
    code: "races",
    position: [68.5, 81.5],
    arrow: [30, "up"],
    holdsProjects: false,
  }*/
]

export default regions;