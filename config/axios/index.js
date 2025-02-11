import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Authorization: "Bearer " + localStorage.getItem("jwt_token"),
  },
});

export default axiosInstance;
