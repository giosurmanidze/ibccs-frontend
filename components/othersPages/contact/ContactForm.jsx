"use client";
import axiosInstance from "@/config/axios";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import * as yup from "yup";

export default function ContactForm({ dynamicFields = {}, header_texts }) {
  const formRef = useRef();
  const [validationSchema, setValidationSchema] = useState(null);

  const email_form_header_text = header_texts?.email_form_header_text.value;
  const email_form_bottom_text = header_texts?.email_form_bottom_text.value;

  useEffect(() => {
    let schema = yup.object().shape({});

    if (dynamicFields && typeof dynamicFields === "object") {
      Object.entries(dynamicFields).forEach(([key, field]) => {
        if (field.required) {
          let fieldValidation = yup
            .string()
            .required(`${key.replace(/_/g, " ")} is required`);

          if (field.type === "email") {
            fieldValidation = fieldValidation.email(
              `Please enter a valid email address`
            );
          } else if (field.type === "tel") {
            fieldValidation = fieldValidation.matches(
              /^\d+$/,
              "Phone number must be numeric"
            );
          } else if (field.type === "number") {
            fieldValidation = yup
              .number()
              .typeError("Must be a number")
              .required(`${key.replace(/_/g, " ")} is required`);
          }

          schema = schema.shape({
            [key]: fieldValidation,
          });
        } else {
          let fieldValidation = yup.string().optional();

          if (field.type === "email") {
            fieldValidation = fieldValidation.email(
              `Please enter a valid email address`
            );
          } else if (field.type === "number") {
            fieldValidation = yup
              .number()
              .typeError("Must be a number")
              .optional();
          }

          schema = schema.shape({
            [key]: fieldValidation,
          });
        }
      });
    }

    setValidationSchema(schema);
  }, [dynamicFields]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
  });

  const SendMail = async (data) => {
    try {
      const response = await axiosInstance.post("contact-forms", {
        contact_details: data,
      });

      toast.success("Message is sent. Thank you!", {
        position: "top-right",
        autoClose: 3000,
      });
      reset();
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const formatFieldName = (name) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderField = (key, field) => {
    return (
      <div className="tf-field style-1 mb_15" key={key}>
        <input
          className="tf-field-input tf-input"
          placeholder={`${formatFieldName(key)} ${field.required ? "*" : ""}`}
          type={field.type || "text"}
          id={key}
          name={key}
          {...register(key)}
        />
        <label className="tf-field-label fw-4 text_black-2" htmlFor={key}>
          {formatFieldName(key)} {field.required ? "*" : ""}
        </label>
        {errors[key] && <p className="error">{errors[key].message}</p>}
      </div>
    );
  };

  const renderTextarea = (key, field) => {
    return (
      <div className="tf-field style-1 mb_15" key={key}>
        <textarea
          placeholder={`${formatFieldName(key)} ${field.required ? "*" : ""}`}
          name={key}
          id={key}
          cols={30}
          rows={field.rows || 5}
          {...register(key)}
          className="w-100"
        />
        {errors[key] && <p className="error">{errors[key].message}</p>}
      </div>
    );
  };

  const getRegularAndTextareaFields = () => {
    const regularFields = [];
    const textareaFields = [];

    if (dynamicFields && Object.keys(dynamicFields).length > 0) {
      Object.entries(dynamicFields).forEach(([key, field]) => {
        if (field.type === "textarea") {
          textareaFields.push([key, field]);
        } else {
          regularFields.push([key, field]);
        }
      });
    }

    return { regularFields, textareaFields };
  };

  const { regularFields, textareaFields } = getRegularAndTextareaFields();

  return (
    <section className="bg_grey-7 flat-spacing-9">
      <ToastContainer />
      <div className="container">
        <div className="flat-title">
          <span className="title">{email_form_header_text}</span>
          <p className="sub-title text_black-2">{email_form_bottom_text}</p>
        </div>
        <div>
          <form
            ref={formRef}
            onSubmit={handleSubmit(SendMail)}
            className="mw-705 mx-auto text-center form-contact"
            id="contactform"
          >
            {dynamicFields && Object.keys(dynamicFields).length > 0 ? (
              <>
                {regularFields.map(([key, field]) => renderField(key, field))}
                {textareaFields.map(([key, field]) =>
                  renderTextarea(key, field)
                )}
              </>
            ) : (
              <div className="tf-field style-1 mb_15">
                <p>
                  No contact form fields configured. Please add fields in the
                  admin panel.
                </p>
              </div>
            )}

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
