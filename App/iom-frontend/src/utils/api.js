import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", //  direct connection to backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
