"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "@/config/axios";

const socialPlatforms = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "telegram", name: "Telegram" },
  { id: "viber", name: "Viber" },
  { id: "botim", name: "Botim" },
];

export default function Register() {
  const [selectRegisterOption, setSelectRegisterOption] = useState(true);
  const [selectedSocials, setSelectedSocials] = useState([]);

  const handleSocialChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSocials((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };
  
  const schema = useMemo(
    () =>
      yup.object().shape({
        organizationName: selectRegisterOption
          ? yup.string().required("Organization name is required")
          : yup.string().notRequired(),
        passport_number: !selectRegisterOption
          ? yup.string().required("Passport number is required")
          : yup.string().notRequired(),
        name: yup.string().required("First name is required"),
        lastname: yup.string().required("Last name is required"),
        email: yup
          .string()
          .email("Invalid email")
          .required("Email is required"),
        id_number: !selectRegisterOption 
          ? yup.string().required("ID Number is required")
          : yup.string().notRequired(),
        Identification_number: selectRegisterOption 
          ? yup.string().required("Identification Number is required")
          : yup.string().notRequired(),
        phone_number: yup
          .string()
          .matches(/^\d+$/, "Phone number must be numeric")
          .min(9, "Phone number must be at least 10 digits")
          .required("Phone number is required"),
        password: yup
          .string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        platforms_number: yup.object().shape({
          whatsapp: yup
            .string()
            .matches(/^\d+$/, "Phone number must be numeric")
            .min(9, "Phone number must be at least 9 digits")
            .when("$selectedSocials", (selected, schema) =>
              selected.includes("whatsapp")
                ? schema.required("WhatsApp number is required")
                : schema.notRequired()
            ),
          telegram: yup
            .string()
            .matches(/^\d+$/, "Phone number must be numeric")
            .min(9, "Phone number must be at least 9 digits")
            .when("$selectedSocials", (selected, schema) =>
              selected.includes("telegram")
                ? schema.required("Telegram number is required")
                : schema.notRequired()
            ),
          viber: yup
            .string()
            .matches(/^\d+$/, "Phone number must be numeric")
            .min(9, "Phone number must be at least 9 digits")
            .when("$selectedSocials", (selected, schema) =>
              selected.includes("viber")
                ? schema.required("Viber number is required")
                : schema.notRequired()
            ),
          botim: yup
            .string()
            .matches(/^\d+$/, "Phone number must be numeric")
            .min(9, "Phone number must be at least 9 digits")
            .when("$selectedSocials", (selected, schema) =>
              selected.includes("botim")
                ? schema.required("Botim number is required")
                : schema.notRequired()
            ),
        }),
      }),
    [selectRegisterOption]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    reset();
  }, [selectRegisterOption, reset]);

  const onSubmit = async (data) => {
    const postData = {
      ...data,
      platforms_number: JSON.stringify({ ...data.platforms_number }),
    };
    console.log(postData);

    try {
      const response = await axiosInstance.post("user-register", postData);

      if (response.status === 200) {
        toast.success("Verification email is sent.", {
          position: "top-right",
          autoClose: 3000,
        });
        reset();
        setSelectedSocials([]);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDataExists = localStorage.getItem("store_user_data");
      if (userDataExists) {
        const userData = JSON.parse(localStorage.getItem("store_user_data"));
        setValue("name", userData.firstname);
        setValue("lastname", userData.lastname);
        setValue("phone_number", userData.phone_number);
        setValue("email", userData.email);
      }
    }
  }, [selectRegisterOption]);
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
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      Organization Name
                    </label>
                    <input
                      className="tf-field-input "
                      type="text"
                      {...register("organizationName")}
                    />
                    <p className="error">{errors.organizationName?.message}</p>
                  </div>{" "}
                  <div className="tf-field style-1 mb_15">
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      First Name
                    </label>
                    <input
                      className="tf-field-input "
                      type="text"
                      {...register("name")}
                    />
                    <p className="error">{errors.name?.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="tf-field style-1 mb_15">
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      First Name
                    </label>
                    <input
                      className="tf-field-input "
                      type="text"
                      {...register("name")}
                    />
                    <p className="error">{errors.name?.message}</p>
                  </div>{" "}
                  <div className="tf-field style-1 mb_15">
                    <label
                      className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      Passport Number
                    </label>
                    <input
                      className="tf-field-input "
                      type="text"
                      {...register("passport_number")}
                    />
                    <p className="error">{errors.passport_number?.message}</p>
                  </div>
                </>
              )}
              <div className="tf-field style-1 mb_15">
                <label
                  className="tf-field-label-top fw-4 text_black-2"
                  htmlFor="property3"
                >
                  Last Name
                </label>
                <input
                  className="tf-field-input "
                  type="text"
                  {...register("lastname")}
                />
                <p className="error">{errors.lastname?.message}</p>
              </div>
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
                  {...register("email")}
                />
                <p className="error">{errors.email?.message}</p>
              </div>
              <div className="mb_15 checkbox">
                <label   className="tf-field-label-top fw-4 text_black-2"
                      htmlFor="property3">
                  Select Social Platforms:
                </label>
                {socialPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="tf-checkbox platforms-checkbox mt-2!"
                  >
                    <input
                      type="checkbox"
                      id={platform.id}
                      value={platform.id}
                      checked={selectedSocials.includes(platform.id)}
                      onChange={handleSocialChange}
                    />
                    <label htmlFor={platform.id}>{platform.name}</label>
                  </div>
                ))}
              </div>
              {selectedSocials.map((social) => (
                <div key={social} className="tf-field style-1 mb_15 checkbox">
                  <label
                    className="tf-field-label-top fw-4 text_black-2"
                    htmlFor="property3"
                  >
                    {social} Phone Number *
                  </label>
                  <input
                    className="tf-field-input "
                    placeholder={`Enter ${social} phone number`}
                    type="text"
                    {...register(`platforms_number.${social}`)}
                  />
                  <p className="error">
                    {errors.platforms_number?.[social]?.message}
                  </p>
                </div>
              ))}
              {selectRegisterOption ? (
                <div className="tf-field style-1 mb_15">
                  <label
                    className="tf-field-label-top fw-4 text_black-2"
                    htmlFor="property3"
                  >
                    Identification number
                  </label>
                  <input
                    className="tf-field-input "
                    type="text"
                    {...register("Identification_number")}
                  />
                  <p className="error">
                    {errors.Identification_number?.message}
                  </p>
                </div>
              ) : (
                <div className="tf-field style-1 mb_15">
                  <label
                    className="tf-field-label-top fw-4 text_black-2"
                    htmlFor="property3"
                  >
                    ID Number
                  </label>
                  <input
                    className="tf-field-input "
                    type="text"
                    {...register("id_number")}
                  />
                  <p className="error">{errors.id_number?.message}</p>
                </div>
              )}
              <div className="tf-field style-1 mb_15">
                <label
                  className="tf-field-label-top fw-4 text_black-2"
                  htmlFor="property3"
                >
                  Phone Number
                </label>
                <input
                  className="tf-field-input "
                  type="text"
                  {...register("phone_number")}
                />
                <p className="error">{errors.phone_number?.message}</p>
              </div>
              <div className="tf-field style-1 mb_30">
                <label
                  className="tf-field-label-top fw-4 text_black-2"
                  htmlFor="property3"
                >
                  Password *
                </label>
                <input
                  className="tf-field-input "
                  type="password"
                  {...register("password")}
                />
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
                  className="tf-check !border-gray-500"
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
