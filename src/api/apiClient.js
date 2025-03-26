import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://13.203.94.55:5000/api/v1",
});

export default apiClient;

//local : http://localhost:5000/api/v1
//render.com : https://sarayu-node-backend-hti6.onrender.com//api/v1
//aws : http://65.1.185.30/api/v1
