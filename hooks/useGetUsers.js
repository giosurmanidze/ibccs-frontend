import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get(`/users`);
      return response.data;
    },
  });
};
