const Project = require("../models/Project.js");

const projectIdsFromNames = async (projectNames) => {
  if (!Array.isArray(projectNames)) {
    const error = new Error("Projects must be an array of names");
    error.status = 400;
    throw error;
  }
  const projects = await Project.find({name: {$in: projectNames}}).select("_id name").lean();
  const projectsByName = new Map(projects.map(project => [project.name, project._id]));
  const missingNames = projectNames.filter(projectName => !projectsByName.has(projectName));
  if (missingNames.length > 0) {
    const error = new Error(`Projects do not exist: ${missingNames.join(", ")}`);
    error.status = 400;
    throw error;
  }
  return projectNames.map(projectName => projectsByName.get(projectName));
};

module.exports = projectIdsFromNames;
