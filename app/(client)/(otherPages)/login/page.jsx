"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "@/config/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const emailShecma = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function Login() {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get(`pages/login`);
      setPageContent(JSON.parse(response.data?.dynamic_content).buttons);
    };
    getPageContent();
  }, []);

  console.log(pageContent);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errorsEmail },
    reset: resetEmail,
  } = useForm({
    resolver: yupResolver(emailShecma),
  });

  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("login", data);
      login(response.data["user"], response.data["token"]);
      reset();
      router.push("/");
    } catch (error) {
      toast.error(error?.response?.data["error"]);
    }
  };
  const ResetSubmit = async (data) => {
    console.log(data);
    try {
      await axiosInstance.post("forgot-password", { email: data["email"] });
      toast.success("Verification email is sent.");
    } catch (error) {
      toast.error(error.response.data?.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <ToastContainer />
        <div className="tf-grid-layout lg-col-2 tf-login-wrap">
          <div className="tf-login-form">
            <div id="recover">
              <h5 className="mb_24">Reset your password</h5>
              <p className="mb_30">
                We will send you an email to reset your password
              </p>
              <div>
                <form onSubmit={handleEmailSubmit(ResetSubmit)}>
                  <div className="tf-field style-1 mb_15">
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      Email *
                    </label>
                    <input
                      className="tf-field-input "
                      type="email"
                      id="property5"
                      name="email"
                      {...registerEmail("email")}
                    />
                  </div>
                  <div className="mb_20">
                    <a href="#login" className="tf-btn btn-line">
                      Cancel
                    </a>
                  </div>
                  {Array.isArray(pageContent) && pageContent[1] && (
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                      style={{
                        backgroundColor: pageContent[1].background_color,
                        color: pageContent[1].text_color,
                      }}
                    >
                      {pageContent[1].text}
                    </button>
                  )}
                </form>
              </div>
            </div>
            <div id="login">
              <h5 className="mb_36">Log in</h5>
              <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="tf-field style-1 mb_15">
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="email"
                    >
                      Email *
                    </label>
                    <input
                      className="tf-field-input "
                      type="email"
                      autoComplete="abc@xyz.com"
                      id="property3"
                      name="email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="error">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="tf-field style-1 mb_30">
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="password"
                    >
                      Password *
                    </label>
                    <input
                      className="tf-field-input "
                      type="password"
                      id="property4"
                      name="password"
                      autoComplete="current-password"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="error">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="mb_20">
                    <a href="#recover" className="tf-btn btn-line">
                      Forgot your password?
                    </a>
                  </div>
                  {Array.isArray(pageContent) && pageContent[0] && (
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                      style={{
                        backgroundColor: pageContent[0].background_color,
                        color: pageContent[0].text_color,
                      }}
                    >
                      {pageContent[0].text}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>

          <div className="tf-login-content">
            <h5 className="mb_36">I am new here</h5>
            <p className="mb_20">
              Sign up for early Sale access plus tailored new arrivals, trends
              and promotions. To opt out, click unsubscribe in our emails.
            </p>
            <Link href={`/register`} className="tf-btn btn-line">
              Register
              <i className="icon icon-arrow1-top-left" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
