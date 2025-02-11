import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await axios.get(`/services`);
      return response.data?.services;
    },
  });
};
