import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
