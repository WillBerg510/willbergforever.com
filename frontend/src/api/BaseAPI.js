import axios from 'axios';
import { BACKEND } from "../constants/config.js";

const API = axios.create({
  baseURL: BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: "include",
});

export default API;