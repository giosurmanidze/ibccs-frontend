import axios from "axios";

const createAxiosInstance = () => {
  const baseConfig = {
    baseURL: "http://localhost:8000/api",

    // http://localhost:8000/api/
    // http://api.ibccsonline.ge/api
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      baseConfig.headers.Authorization = `Bearer ${token}`;
    }
  }

  return axios.create(baseConfig);
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;
