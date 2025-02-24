import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axios.get(`user`);
      console.log(response)
      return response.data.user;
    },
  });
};
