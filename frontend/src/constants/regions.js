import BeachWest from "../assets/Palm Tree Paradise West.jpg";
import BeachEast from "../assets/Palm Tree Paradise East.jpg";
import CityDowntown from "../assets/Commute City Downtown.jpg";
import CityUptown from "../assets/Commute City Uptown.jpg";

const regions = [
  {
    name: "Palm Tree Paradise",
    code: "beach",
    position: [30, 30],
    arrow: [70, "down"],
    color: "#b3e89f",
    divisions: [
      {
        name: "West",
        code: "west",
        position: [25, 50],
        arrow: [50, "down"],
        image: BeachWest,
        direction: [-25, 0],
        exit: [87, 40],
      },
      {
        name: "East",
        code: "east",
        position: [75, 50],
        arrow: [50, "down"],
        image: BeachEast,
        direction: [25, 0],
        exit: [19, 41],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "Commute City",
    code: "city",
    position: [50, 60],
    arrow: [50, "up"],
    color: "#adcaf5",
    divisions: [
      {
        name: "Downtown",
        code: "downtown",
        position: [40, 75],
        arrow: [50, "down"],
        image: CityDowntown,
        direction: [-20, 30],
        exit: [42, 14],
      },
      {
        name: "Uptown",
        code: "uptown",
        position: [60, 25],
        arrow: [50, "down"],
        image: CityUptown,
        direction: [20, -30],
        exit: [19, 78],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "The Rage Room",
    code: "club",
    position: [70, 30],
    arrow: [30, "down"],
    color: "#ede096",
    divisions: [
      {
        name: "Lower Level",
        code: "lower",
        position: [25, 60],
        arrow: [50, "down"],
        direction: [-30, 20],
        exit: [70, 20],
      },
      {
        name: "Upper Level",
        code: "upper",
        position: [75, 40],
        arrow: [50, "down"],
        direction: [30, -20],
        exit: [30, 70],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "The Factory",
    code: "factory",
    position: [35, 85],
    arrow: [70, "up"],
    holdsProjects: false,
  },
]

export default regions;