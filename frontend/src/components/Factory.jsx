import '../stylesheets/Factory.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import factoryAPI from '../api/FactoryAPI.js';
import factoryParts from '../constants/factoryParts.js';

const Factory = ({ closeWindows, isAdmin, openFactoryPlayer }) => {
  const navigate = useNavigate();
  
  const { data: factoryEvent, isPending, isError } = useQuery({
    queryKey: ["factoryEvent"],
    queryFn: () => factoryAPI.getFactoryEvent().then(res => res?.data?.factoryEvent),
    retry: (count, error) => {
      if (error.response?.status == 500) {
        userRefresh();
        return true;
      }
      return false;
    },
    retryDelay: (count) => count * 250,
  });

  const { mutate: editEvent } = useMutation({
    mutationFn: () => factoryAPI.getFactoryEventForEdit(),
    onSuccess: (res) => {
      const eventId = res?.data?.factoryEvent?._id;
      if (eventId) navigate(`/admin?editFactoryEvent=${eventId}`);
    },
  });

  return (
    <div className="factoryBox" onClick={(e) => e.stopPropagation()}>
      <div className="factoryCloseButton" onClick={closeWindows}>
        <p>CLOSE</p>
      </div>
      <h2 className="factoryHeader">THE FACTORY</h2>
      {isPending && <p>Loading factory event...</p>}
      {isError && <p>Unable to load the factory event.</p>}
      {!isPending && !isError && <h3 className="factoryEventTitle">{factoryEvent?.name || "No factory events yet"}</h3>}
      {factoryEvent?._id && <button onClick={() => openFactoryPlayer(factoryEvent._id)}>Open factory player</button>}
      {isAdmin && <button onClick={editEvent}>Edit event</button>}
      {factoryEvent?.progress?.map((found, index) =>
        <div className="factoryPart" key={`${factoryEvent.parts?.[index] || "part"}${index}`}>
          {factoryParts[factoryEvent.parts?.[index]] &&
            <img
              className="factoryPartImage"
              src={factoryParts[factoryEvent.parts[index]]}
              alt={factoryEvent.parts[index]}
            />}
          <p>{found ? "FOUND" : "NOT FOUND"}</p>
        </div>
      )}
    </div>
  );
};

export default Factory;
