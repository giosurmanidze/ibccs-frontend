"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/config/axios";

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  useEffect(() => {
    if (email) {
      axiosInstance
        .post("/email/verify", { email })
        .then((response) => {
          console.log("Verification successful:", response.data);
          setTimeout(() => {
            router.push("/");
          }, 2000);
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
        });
    }
  }, [email, router]);

  return (
    <div className="success-page">
      <h3>Verification completed successfully! ✔</h3>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationContent />
    </Suspense>
  );
}
