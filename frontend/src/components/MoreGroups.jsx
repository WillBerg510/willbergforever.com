import { useState } from 'react';
import { motion } from 'motion/react';
import projectGroups from '../constants/projectGroups.js';
import '../stylesheets/MoreGroups.css';

const MoreGroups = (props) => {
	const { getGroupProjects, setMenu } = props;
  const [hoveredGroup, setHoveredGroup] = useState(null);

	const openGroup = (group, name) => {
		setMenu(name);
		getGroupProjects(group);
	};

	return (
		<motion.div
			className="moreGroups"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeInOut", delay: 0.15 } }}
			exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
		>
      <h1>MORE GROUPS</h1>
      <div className="moreGroupsList">
        {Object.entries(projectGroups).slice(5).map(([groupId, group]) => (
          <div
            className="moreGroupsSquare"
            onClick={() => openGroup(groupId, group.name)}
            onMouseEnter={() => setHoveredGroup(groupId)}
            onMouseLeave={() => setHoveredGroup(null)}
          >
            <button
              className="moreGroupsButton"
              type="button"
              key={`${group.name}Button`}
            >
              <img src={group.icon} />
            </button>
            {hoveredGroup == groupId &&
              <div className="moreGroupsTooltip">
                <div className="moreGroupsTooltipBox">
                  <p>{group.name.toUpperCase()}</p>
                </div>
                <div className="moreGroupsTriangle" />
              </div>
            }
          </div>
        ))}
      </div>
		</motion.div>
	);
};

export default MoreGroups;
