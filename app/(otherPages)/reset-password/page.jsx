"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "@/config/axios";
import { ToastContainer, toast } from "react-toastify";

export default function Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const validationSchema = useMemo(() => {
    return yup.object().shape({
      password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirm_password: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    const validatedData = {
      password: data["password"],
      password_confirmation: data["confirm_password"],
      email: email,
      token: token,
    };
    try {
      await axiosInstance.post("reset-password", validatedData);
      reset();
      toast.success("Password changed succesfully.", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container password-change-page">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h5>Please enter new password</h5>
        <ToastContainer />
        <div className="tf-field style-1 mb_15">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="password"
            {...register("password")}
          />
          <label className="tf-field-label">Password *</label>
          <p className="error">{errors.password?.message}</p>
        </div>

        <div className="tf-field style-1 mb_15">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="password"
            {...register("confirm_password")}
          />
          <label className="tf-field-label">Confirm Password *</label>
          <p className="error">{errors.confirm_password?.message}</p>
        </div>

        <div className="">
          <button
            type="submit"
            className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
}
