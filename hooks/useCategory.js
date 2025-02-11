import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetCategory = (categoryId) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const response = await axios.get(`categories/${categoryId}`);
      return response.data;
    },
  });
};
