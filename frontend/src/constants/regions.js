import BeachWest from "../assets/Palm Tree Paradise West.jpg";
import BeachEast from "../assets/Palm Tree Paradise East.jpg";
import CityDowntown from "../assets/Commute City Downtown.jpg";
import CityUptown from "../assets/Commute City Uptown.jpg";
import ClubLower from "../assets/The Rage Room Lower Level.jpg";

const regions = [
  {
    name: "Palm Tree Paradise",
    code: "beach",
    position: [23, 21],
    zoom: [6, 280, 175],
    arrow: [80, "down"],
    color: "#b3e89f",
    divisions: [
      {
        name: "West",
        code: "west",
        position: [-108, -87],
        arrow: [50, "down"],
        image: BeachWest,
        direction: [-40, 0],
        exit: [87, 40],
      },
      {
        name: "East",
        code: "east",
        position: [-77, -89],
        arrow: [50, "down"],
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
    position: [50, 61],
    zoom: [4, 0, 33],
    arrow: [50, "up"],
    color: "#adcaf5",
    divisions: [
      {
        name: "Downtown",
        code: "downtown",
        position: [45, 50],
        arrow: [50, "down"],
        image: CityDowntown,
        direction: [-30, 45],
        exit: [42, 14],
      },
      {
        name: "Uptown",
        code: "uptown",
        position: [54, 12],
        arrow: [50, "down"],
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
    position: [76, 19],
    zoom: [5, -225, 170],
    arrow: [20, "down"],
    color: "#ede096",
    divisions: [
      {
        name: "Lower Level",
        code: "lower",
        position: [140, -48],
        arrow: [50, "down"],
        image: ClubLower,
        direction: [-25, 10],
        exit: [81, 69],
      },
      {
        name: "Upper Level",
        code: "upper",
        position: [160, -72],
        arrow: [50, "down"],
        direction: [25, -10],
        exit: [30, 70],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "Ryan's Factory",
    code: "factory",
    position: [28, 85],
    arrow: [70, "up"],
    holdsProjects: false,
  },
  {
    name: "Updates from Will",
    code: "updates",
    position: [50.5, 5],
    arrow: [50, "down"],
    holdsProjects: false,
  },
  {
    name: "Bob's Daily Races",
    code: "races",
    position: [69, 83],
    arrow: [30, "up"],
    holdsProjects: false,
  }
]

export default regions;