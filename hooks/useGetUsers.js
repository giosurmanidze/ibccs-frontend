import axiosInstance from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetUsers = (searchTerm = "") => {
  return useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      const response = await axiosInstance.get(`/users?search=${searchTerm}`);
      return response.data.data;
    },
  });
};
