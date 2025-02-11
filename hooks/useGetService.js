import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetService = (serviceId) => {
  return useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      const response = await axios.get(`services/${serviceId}`);
      return response.data;
    },
  });
};
