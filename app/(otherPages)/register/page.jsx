"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [selectRegisterOption, setSelectRegisterOption] = useState(true);

  const schema = useMemo(
    () =>
      yup.object().shape({
        organizationName: selectRegisterOption
          ? yup.string().required("Organization name is required")
          : yup.string().notRequired(),
        name: yup.string().required("First name is required"),
        lastname: yup.string().required("Last name is required"),
        email: yup
          .string()
          .email("Invalid email")
          .required("Email is required"),
        id_number: !selectRegisterOption // Only required when Physical person
          ? yup.string().required("ID Number is required")
          : yup.string().notRequired(),
        Identification_number: selectRegisterOption // Only required when Legal person
          ? yup.string().required("Identification Number is required")
          : yup.string().notRequired(),
        phone_number: yup
          .string()
          .matches(/^\d+$/, "Phone number must be numeric")
          .min(10, "Phone number must be at least 10 digits")
          .required("Phone number is required"),
        password: yup
          .string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      }),
    [selectRegisterOption]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    reset();
  }, [selectRegisterOption, reset]);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/user-register",
        data
      );

      if (response.status === 200) {
        toast.success("Verification email is sent.", {
          position: "top-right",
          autoClose: 3000,
        });
        reset();
        setShowVerificationOptions(true);
      }
    } catch (error) {
      if (error.response?.data.errors?.email) {
        toast.error("The email has already been taken.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <ToastContainer />
          <>
            <div className="flat-title align-items-start gap-0 mb_30 px-0">
              <h5 className="mb_18 register_option">
                Register as
                <button
                  onClick={() => setSelectRegisterOption(true)}
                  className={`tf-btn w-100 radius-3 btn-fill ${
                    selectRegisterOption ? "active-button" : "no-active-button"
                  }`}
                >
                  Legal person
                </button>
                <button
                  onClick={() => setSelectRegisterOption(false)}
                  className={`tf-btn w-100 radius-3 btn-fill ${
                    !selectRegisterOption ? "active-button" : "no-active-button"
                  }`}
                >
                  Physical person
                </button>
              </h5>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} id="register-form">
              {selectRegisterOption ? (
                <>
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      {...register("organizationName")}
                    />
                    <label className="tf-field-label">Organization Name</label>
                    <p className="error">{errors.organizationName?.message}</p>
                  </div>{" "}
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      {...register("name")}
                    />
                    <label className="tf-field-label">First Name</label>
                    <p className="error">{errors.name?.message}</p>
                  </div>
                </>
              ) : (
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    {...register("name")}
                  />
                  <label className="tf-field-label">First Name</label>
                  <p className="error">{errors.name?.message}</p>
                </div>
              )}
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  {...register("lastname")}
                />
                <label className="tf-field-label">Last Name</label>
                <p className="error">{errors.lastname?.message}</p>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  {...register("email")}
                />
                <label className="tf-field-label">Email *</label>
                <p className="error">{errors.email?.message}</p>
              </div>
              {selectRegisterOption ? (
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    {...register("Identification_number")}
                  />
                  <label className="tf-field-label">
                    Identification number
                  </label>
                  <p className="error">
                    {errors.Identification_number?.message}
                  </p>
                </div>
              ) : (
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    {...register("id_number")}
                  />
                  <label className="tf-field-label">ID Number</label>
                  <p className="error">{errors.id_number?.message}</p>
                </div>
              )}
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  {...register("phone_number")}
                />
                <label className="tf-field-label">Phone Number</label>
                <p className="error">{errors.phone_number?.message}</p>
              </div>
              <div className="tf-field style-1 mb_30">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="password"
                  {...register("password")}
                />
                <label className="tf-field-label">Password *</label>
                <p className="error">{errors.password?.message}</p>
              </div>
              <p className="text_black-2 mb_20">
                Your personal data will be used to process your order, support
                your experience throughout this website, and for other purposes
                described in our
                <Link
                  href={`/privacy-policy`}
                  className="text-decoration-underline"
                >
                  privacy policy
                </Link>
                .
              </p>
              <div className="box-checkbox fieldset-radio mb_20">
                <input
                  required
                  type="checkbox"
                  id="check-agree"
                  className="tf-check"
                />
                <label htmlFor="check-agree" className="text_black-2">
                  I have read and agree to the website
                  <Link
                    href={`/terms-conditions`}
                    className="text-decoration-underline"
                  >
                    terms and conditions
                  </Link>
                  .
                </label>
              </div>
              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill"
                >
                  Register
                </button>
              </div>{" "}
              <div className="text-center">
                <Link href={`/login`} className="tf-btn btn-line">
                  Already have an account? Log in here
                  <i className="icon icon-arrow1-top-left" />
                </Link>
              </div>
            </form>
          </>
        </div>
      </div>
    </section>
  );
}
