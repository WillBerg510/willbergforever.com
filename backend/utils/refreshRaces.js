const Project = require("../models/Project.js");
const Race = require("../models/Race.js");
const lodash = require("lodash");

// Ensure that all races are refreshed for the current day
const refreshRaces = async (req, res, next) => {
  try {
    const today = new Date((new Date()).getTime() - (7 * 60 * 60 * 1000));
    const todayDate = today.toISOString().split('T')[0];
    const races = await Race.find();
    for (const race of races) {
      if (race.date.toISOString().split('T')[0] != todayDate) {
        const projects = await Project.find({visible: {$ne: false}}).select(["_id", "name"]);
        const usedProjectIds = (await Race.find()).filter(otherRace => otherRace.date.toISOString().split('T')[0] == todayDate)
          .flatMap(otherRace => otherRace.projects);
        const selection = lodash.sampleSize(projects.filter(project => !usedProjectIds.includes(project._id.toString())), race.level);
        const selectionIds = selection.map(project => project._id);
        race.date = today;
        race.projects = selectionIds;
        race.times = {};
        race.codes = {};
        await race.save();
      }
    }
    next();
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}

module.exports = refreshRaces;