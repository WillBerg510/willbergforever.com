import { BACKEND } from "./config.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const changePassword = (e) => {
    setPassword(e.target.value);
  }

  const inputKeyDown = (e) => {
    if (e.key === "Enter") {
      login();
    }
  }

  const login = () => {
    fetch(`${BACKEND}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
      }),
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error status: ${res.status}`);
      }
      return res.json();
    }).catch(error => {
      alert(error);
    }).then(data => {
      localStorage.setItem("auth_token", data.token);
      navigate('/');
    });
  }

  return (
    <>
      <h2>Login</h2>
      <input type="password" onChange={changePassword} value={password} onKeyDown={inputKeyDown}/>
      <button onClick={login}>Log In</button>
    </>
  )
}

export default Login