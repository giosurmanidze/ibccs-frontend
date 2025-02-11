import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`/categories`);
      return response.data;
    },
  });
};
