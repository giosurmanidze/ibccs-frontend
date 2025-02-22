import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await axios.get(`/roles`);
      return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 30 * 24 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => data.filter((role) => role.id !== 2),
  });
};
