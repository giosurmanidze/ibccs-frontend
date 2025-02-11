import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await axios.get(`employees`);
      return response.data;
    },
  });
};
