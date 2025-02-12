"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/config/axios";

export default function page() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (email) {
      axiosInstance
        .post("/email/verify", { email })
        .then((response) => {
          console.log("Verification successful:", response.data);
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
        });
    }
  }, [email]);

  return (
    <div className="success-page">
      <h3>Verification completed successfully! ✔</h3>
    </div>
  );
}
