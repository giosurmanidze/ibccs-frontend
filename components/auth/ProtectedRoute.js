"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withProtectedRoute(Component, allowedRoles = []) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (
        !loading &&
        (!user ||
          (allowedRoles.length > 0 && !allowedRoles.includes(user?.role.name)))
      ) {
        router.replace("/error-404");
      }
    }, [user, loading]);

    if (
      loading ||
      !user ||
      (allowedRoles.length > 0 && !allowedRoles.includes(user?.role.name))
    ) {
      return null;
    }

    return <Component {...props} />;
  };
}
