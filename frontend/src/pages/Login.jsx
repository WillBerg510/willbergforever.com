import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
import adminAPI from "../api/AdminAPI.js";

const Login = () => {
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const changePassword = (e) => {
    setPassword(e.target.value);
  }

  const inputKeyDown = (e) => {
    if (e.key === "Enter") {
      login.mutate();
    }
  }

  const login = useMutation({
    mutationFn: () => adminAPI.login(password),
    onSuccess: () => navigate('/admin'),
  });

  return (
    <>
      <h2>Login</h2>
      <input type="password" onChange={changePassword} value={password} onKeyDown={inputKeyDown}/>
      <button onClick={login.mutate}>Log In</button>
    </>
  )
}

export default Login