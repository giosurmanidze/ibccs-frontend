"use client";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form"; // Import useForm
import { yupResolver } from "@hookform/resolvers/yup"; // Import yupResolver for validation
import * as yup from "yup"; // Import yup for schema validation
import { toast } from "react-toastify"; // Import toast for notifications
import axios from "axios"; // Import axios for making HTTP requests
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS

// Define the validation schema with Yup
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
  // Initialize react-hook-form with yup validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSUbmit,
    formState: { errorsEmail },
  } = useForm({
    resolver: yupResolver(emailShecma),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Simulate a login API request
      const response = await axios.post("/api/login", data); // Replace with your login API
      console.log("Login successful:", response.data);
      toast.success("Login successful!");
      // Handle success, like saving the token or redirecting
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    }
  };
  const ResetSubmit = (data) => {
    console.log(data);
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="tf-grid-layout lg-col-2 tf-login-wrap">
          {/* Reset Password Form */}
          <div className="tf-login-form">
            <div id="recover">
              <h5 className="mb_24">Reset your password</h5>
              <p className="mb_30">
                We will send you an email to reset your password
              </p>
              <div>
                <form onSubmit={handleEmailSUbmit(ResetSubmit)}>
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="email"
                      autoComplete="abc@xyz.com"
                      id="property3"
                      name="email"
                      {...registerEmail("email")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      Email *
                    </label>
                    {errors.email && (
                      <p className="error">{errorsEmail.email.message}</p>
                    )}
                  </div>
                  <div className="mb_20">
                    <a href="#login" className="tf-btn btn-line">
                      Cancel
                    </a>
                  </div>
                  <div className="">
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    >
                      Reset password
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Login Form */}
            <div id="login">
              <h5 className="mb_36">Log in</h5>
              <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="email"
                      autoComplete="abc@xyz.com"
                      id="property3"
                      name="email"
                      {...register("email")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="email"
                    >
                      Email *
                    </label>
                    {errors.email && (
                      <p className="error">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="tf-field style-1 mb_30">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="password"
                      id="property4"
                      name="password"
                      autoComplete="current-password"
                      {...register("password")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="password"
                    >
                      Password *
                    </label>
                    {errors.password && (
                      <p className="error">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="mb_20">
                    <a href="#recover" className="tf-btn btn-line">
                      Forgot your password?
                    </a>
                  </div>
                  <div className="">
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Registration Option */}
          <div className="tf-login-content">
            <h5 className="mb_36">I'm new here</h5>
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
