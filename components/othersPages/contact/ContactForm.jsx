"use client";
import axiosInstance from "@/config/axios";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import * as yup from "yup";

export default function ContactForm() {
  const formRef = useRef();

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    firstname: yup.string().required("First name is required"),
    lastname: yup.string().required("Last name is required"),
    phone_number: yup
      .string()
      .matches(/^\d+$/, "Phone number must be numeric")
      .min(10, "Phone number must be at least 9 digits")
      .required("Phone number is required"),
    message: yup.string().required("Message is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const SendMail = async (data) => {
    try {
      const response = await axiosInstance.post("contact-forms", data);
      console.log(response);
      toast.success("Message is sent. Thank you!", {
        position: "top-right",
        autoClose: 3000,
      });
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="bg_grey-7 flat-spacing-9">
      <ToastContainer />
      <div className="container">
        <div className="flat-title">
          <span className="title">Get in Touch With us</span>
          <p className="sub-title text_black-2">Tell us about your needs</p>
          <p className="sub-title text_black-2">
            We love working individually with new clients and listening about
            the challenges they are facing. Provide a few details below and we
            will be happy to assist you.
          </p>
        </div>
        <div>
          <form
            ref={formRef}
            onSubmit={handleSubmit(SendMail)}
            className="mw-705 mx-auto text-center form-contact"
            id="contactform"
            action="./contact/contact-process.php"
            method="post"
          >
            <div className="tf-field style-1 mb_15">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="firstname"
                name="firstname"
                {...register("firstname")}
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="firstname"
              >
                Firstname *
              </label>
              <p className="error">{errors.firstname?.message}</p>
            </div>
            <div className="tf-field style-1 mb_15">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="lastname"
                name="lastname"
                {...register("lastname")}
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="lastname"
              >
                Lastname *
              </label>
              <p className="error">{errors.lastname?.message}</p>
            </div>
            <div className="tf-field style-1 mb_15">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="email"
                autoComplete="abc@xyz.com"
                id="email"
                name="email"
                {...register("email")}
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="email"
              >
                Email *
              </label>
              <p className="error">{errors.email?.message}</p>
            </div>
            <div className="tf-field style-1 mb_15">
              <input
                className="tf-field-input tf-input"
                placeholder=" "
                type="text"
                id="phone_number"
                name="phone_number"
                {...register("phone_number")}
              />
              <label
                className="tf-field-label fw-4 text_black-2"
                htmlFor="phone_number"
              >
                Phone number *
              </label>
              <p className="error">{errors.phone_number?.message}</p>
            </div>
            <div className="tf-field style-1 mb_15">
              <textarea
                placeholder="Message *"
                name="message"
                id="message"
                cols={30}
                rows={10}
                {...register("message")}
              />
              <p className="error">{errors.message?.message}</p>
            </div>
            <div className="send-wrap">
              <button
                type="submit"
                className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center w-100"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
