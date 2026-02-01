import './App.css'
import { useState, useEffect } from 'react';
import { BACKEND } from "./config.js"

function App() {
  const [update, setUpdate] = useState("");
  const [updates, setUpdates] = useState([]);

  const postUpdate = () => {
    if (update != "") {
      fetch(`${BACKEND}/updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: update,
        date: Date.now(),
      }),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error status: ${res.status}`);
        }
        return res.json();
      }).catch(error => {
        alert(error);
      }).then(() => {
        getUpdates();
        setUpdate("");
      });
    }
  };

  const getUpdates = () => {
    fetch(`${BACKEND}/updates`).then(res => {
      if (!res.ok) {
        throw new Error(`Response status ${res.status}`);
      }
      return res.json();
    }).then(data => {
      setUpdates(data.updates);
    }).catch(error => {
      alert(error);
    });
  };

  useEffect(() => {
    getUpdates();
  }, []);

  const changeUpdate = (e) => {
    setUpdate(e.target.value);
  }

  const inputKeyDown = (e) => {
    if (e.key === "Enter") {
      postUpdate();
    }
  }

  return (
    <>
      <h1>WELCOME TO THE WILL BERG WEBSITE</h1>
      <h3>THE PLACE TO BE</h3>
      <h5>Glad you could make it</h5>
      <input onChange={changeUpdate} value={update} onKeyDown={inputKeyDown}/>
      <button onClick={postUpdate}>Post an update</button>
      {updates.toReversed().map((update, i) =>
        <div index={i}>
          <h2>{update.text}</h2>
          <h3>{update.date}</h3>
        </div>
      )}
    </>
  )
}

export default App
