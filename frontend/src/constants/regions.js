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
      },
      {
        name: "East",
        code: "east",
        position: [75, 50],
        arrow: [50, "down"],
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
      },
      {
        name: "Uptown",
        code: "uptown",
        position: [60, 25],
        arrow: [50, "down"],
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
      },
      {
        name: "Upper Level",
        code: "upper",
        position: [75, 40],
        arrow: [50, "down"],
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