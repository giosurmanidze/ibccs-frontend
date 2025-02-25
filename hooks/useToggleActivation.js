import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios";

export const useToggleActivation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) =>
      axiosInstance.delete(`/users/activation-status/${userId}`),

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData(["users"]);

      queryClient.setQueryData(["users"], (old) => {
        if (!old) return old;
        return old.map((user) => {
          if (user.id === userId) {
            return { ...user, is_activated: !user.is_activated };
          }
          return user;
        });
      });

      return { previousUsers };
    },

    onError: (err, userId, context) => {
      queryClient.setQueryData(["users"], context.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
