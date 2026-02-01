import './App.css'
import { useState, useEffect } from 'react';

function App() {
  const [update, setUpdate] = useState("");

  const postUpdate = () => {
    fetch('https://willbergforever-com-server.onrender.com/updates', {
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
    })
  };

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
      <input onChange={changeUpdate} onKeyDown={inputKeyDown}/>
      <button onClick={postUpdate}>Post an update</button>
    </>
  )
}

export default App
