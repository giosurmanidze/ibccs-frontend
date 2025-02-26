import axiosInstance from "@/config/axios";

export const getPages = async () => {
  const response = await axiosInstance.get("/pages");
  return response.data;
};

export const getPage = async (slug) => {
  const response = await axiosInstance.get(`/pages/public/${slug}`);
  return response.data;
};

export const createPage = async (pageData) => {
  const response = await axiosInstance.post("/pages/create", pageData);
  return response.data;
};

export const updatePage = async (title, pageData) => {
  const response = await axiosInstance.put(`/pages/by-title/${title}`, pageData);
  console.log(response);
  return response.data;
};

export const deletePage = async (id) => {
  await axiosInstance.delete(`/pages/${id}`);
  return true;
};
