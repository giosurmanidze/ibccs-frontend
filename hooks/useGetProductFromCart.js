import axios from "@/config/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetProductFromCart = () => {
  return useQuery({
    queryKey: ["productsFromCart"],
    queryFn: async () => {
      const response = await axios.get(`cart/view`);
      console.log(response)
      return response.data;
    },
  });
};
