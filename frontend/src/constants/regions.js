import BeachWest from "../assets/Palm Tree Paradise West.png";
import BeachEast from "../assets/Palm Tree Paradise East.png";

const regions = [
  {
    name: "Palm Tree Paradise",
    code: "beach",
    position: [30, 30],
    arrow: [70, "down"],
    divisions: [
      {
        name: "West",
        code: "west",
        position: [25, 50],
        arrow: [50, "down"],
        image: BeachWest,
        direction: [-25, 0],
      },
      {
        name: "East",
        code: "east",
        position: [75, 50],
        arrow: [50, "down"],
        image: BeachEast,
        direction: [25, 0],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "Commute City",
    code: "city",
    position: [50, 60],
    arrow: [50, "up"],
    divisions: [
      {
        name: "Downtown",
        code: "downtown",
        position: [40, 75],
        arrow: [50, "down"],
        direction: [-20, 30],
      },
      {
        name: "Uptown",
        code: "uptown",
        position: [60, 25],
        arrow: [50, "down"],
        direction: [20, -30],
      }
    ],
    holdsProjects: true,
  },
  {
    name: "The Rage Room",
    code: "club",
    position: [70, 30],
    arrow: [30, "down"],
    divisions: [
      {
        name: "Lower Level",
        code: "lower",
        position: [25, 60],
        arrow: [50, "down"],
        direction: [-30, 20],
      },
      {
        name: "Upper Level",
        code: "upper",
        position: [75, 40],
        arrow: [50, "down"],
        direction: [30, -20],
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