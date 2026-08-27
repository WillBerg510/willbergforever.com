import BeachWest from "../assets/Palm Tree Paradise West.jpg";
import BeachEast from "../assets/Palm Tree Paradise East.jpg";
import CityDowntown from "../assets/Commute City Downtown.jpg";
import CityUptown from "../assets/Commute City Uptown.jpg";
import ClubLower from "../assets/The Rage Room Lower Level.jpg";
import ClubUpper from "../assets/The Rage Room Upper Level.jpg";

const regions = [
  {
    name: "Palm Tree Paradise",
    code: "beach",
    position: [23, 21],
    zoom: [3, 23, 19],
    arrow: [80, "down"],
    color: "#b3e89f",
    divisions: [
      {
        name: "West",
        code: "west",
        position: [-32, -25],
        arrow: [80, "down"],
        image: BeachWest,
        direction: [-40, 0],
        exit: [87, 40],
      },
      {
        name: "East",
        code: "east",
        position: [-12, -4],
        arrow: [20, "up"],
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
    zoom: [3, 0, 4],
    arrow: [50, "up"],
    color: "#adcaf5",
    divisions: [
      {
        name: "Downtown",
        code: "downtown",
        position: [41, 48],
        arrow: [80, "down"],
        image: CityDowntown,
        direction: [-30, 45],
        exit: [42, 14],
      },
      {
        name: "Uptown",
        code: "uptown",
        position: [58, 16],
        arrow: [20, "down"],
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
    zoom: [3, -18, 15],
    arrow: [20, "down"],
    color: "#ede096",
    divisions: [
      {
        name: "Lower Level",
        code: "lower",
        position: [97, 7],
        arrow: [80, "up"],
        image: ClubLower,
        direction: [-40, 15],
        exit: [80, 69],
      },
      {
        name: "Upper Level",
        code: "upper",
        position: [123, -15],
        arrow: [20, "down"],
        image: ClubUpper,
        direction: [40, -15],
        exit: [42, 72],
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