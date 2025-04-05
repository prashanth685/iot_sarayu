import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

export default apiClient;

//local : http://localhost:5000/api/v1
//render.com : https://sarayu-node-backend-hti6.onrender.com//api/v1
//aws : http://13.127.36.85:5000/api/v1
