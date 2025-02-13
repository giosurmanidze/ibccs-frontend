"use client";
import axiosInstance from "@/config/axios";
import { useAuth } from "@/context/AuthContext";
import { useContextElement } from "@/context/Context";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import * as yup from "yup";

export default function Checkout() {
  const { cartProducts, totalPrice } = useContextElement();
  const router = useRouter();

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        firstname: yup.string().required("First name is required"),
        lastname: yup.string().required("Last name is required"),
        email: yup
          .string()
          .email("Invalid email")
          .required("Email is required"),
        phone_number: yup
          .string()
          .matches(/^\d+$/, "Phone number must be numeric")
          .min(10, "Phone number must be at least 10 digits")
          .required("Phone number is required"),
        address: yup.string().required("Address is required"),
        store_user: yup.string(),
      }),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { user } = useAuth();

  const onSubmit = async (data) => {
    let userDataExists = localStorage.getItem("store_user_data");
    if (!userDataExists && !user && data["store_user"]) {
      localStorage.setItem("store_user_data", JSON.stringify(data));
    }

    const order_details = JSON.parse(sessionStorage.getItem("order_details"));

    const order_items = order_details.map(({ type, ...item }) => ({
      service_id: item.service_id,
      service_details: JSON.stringify(item),
    }));

    const validatedData = {
      firstname: data["firstname"],
      lastname: data["lastname"],
      phone_number: data["phone_number"],
      email: data["email"],
      address: data["address"],
      order_items: order_items,
    };

    try {
      await axiosInstance.post("/orders", validatedData);
      reset();
      toast.success("Order is completed.", {
        position: "top-right",
        autoClose: 2000,
      });
      // sessionStorage.removeItem("order_details");
      // setTimeout(() => {
      //   router.push("/");
      // }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      setValue("firstname", user.name);
      setValue("lastname", user.lastname);
      setValue("phone_number", user.phone_number);
      setValue("email", user.email);
    }
  }, [user, setValue]);

  return (
    <section className="flat-spacing-11">
      <ToastContainer />
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          <div className="tf-page-cart-item">
            <h5 className="fw-5 mb_20">Billing details</h5>
            <form onSubmit={handleSubmit(onSubmit)} className="form-checkout">
              <div className="tf-field style-1 mb_30">
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
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
                      Firstname
                    </label>
                    {errors.firstname && (
                      <p className="error">{errors.firstname.message}</p>
                    )}
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      id="property4"
                      name="lastname"
                      {...register("lastname")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="lastname"
                    >
                      Lastname
                    </label>
                    {errors.lastname && (
                      <p className="error">{errors.lastname.message}</p>
                    )}
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      id="property4"
                      name="email"
                      {...register("email")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    {errors.email && (
                      <p className="error">{errors.email.message}</p>
                    )}
                  </div>
                </fieldset>{" "}
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      id="property4"
                      name="phone_number"
                      {...register("phone_number")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="phone_number"
                    >
                      Phone number
                    </label>
                    {errors.phone_number && (
                      <p className="error">{errors.phone_number.message}</p>
                    )}
                  </div>
                </fieldset>{" "}
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      id="address"
                      name="address"
                      {...register("address")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="address"
                    >
                      Address
                    </label>
                    {errors.address && (
                      <p className="error">{errors.address.message}</p>
                    )}
                  </div>
                </fieldset>
                <div className="box-checkbox fieldset-radio mb_20 store-user">
                  <input
                    type="checkbox"
                    id="check-agree"
                    className="tf-check"
                    name="store_user"
                    {...register("store_user")}
                  />
                  <label htmlFor="check-agree" className="text_black-2">
                    Do you want to store this data for future registration?
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div className="tf-page-cart-footer">
            <div className="tf-cart-footer-inner">
              <h5 className="fw-5 mb_20">Your order</h5>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="tf-page-cart-checkout widget-wrap-checkout"
              >
                <ul className="wrap-checkout-product">
                  {cartProducts.map((elm, i) => (
                    <li key={i} className="checkout-product-item">
                      <figure className="img-product">
                        <Image
                          alt="product"
                          src={`http://localhost:8000/storage/${elm.icon}`}
                          width={720}
                          height={1005}
                        />
                        <span className="quantity">{elm.quantity}</span>
                      </figure>
                      <div className="content">
                        <div className="info">
                          <p className="name">{elm.name}</p>
                        </div>
                        <span className="price">
                          ${(elm.base_price * elm.quantity).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                {!cartProducts.length && (
                  <div className="container">
                    <div className="row align-items-center mt-5 mb-5">
                      <div className="col-12 fs-18">
                        Your shop cart is empty
                      </div>
                      <div className="col-12 mt-3">
                        <Link
                          href={`/shop-default`}
                          className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                          style={{ width: "fit-content" }}
                        >
                          Explore Services!
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                <div className="d-flex justify-content-between line pb_20">
                  <h6 className="fw-5">Total</h6>
                  <h6 className="total fw-5">{totalPrice}</h6>
                </div>
                <div className="wd-check-payment">
                  <div className="fieldset-radio mb_20">
                    <input
                      required
                      type="radio"
                      name="payment"
                      id="bank"
                      className="tf-check"
                      defaultChecked
                    />
                    <label htmlFor="bank">Direct bank transfer</label>
                  </div>
                  <div className="fieldset-radio mb_20">
                    <input
                      required
                      type="radio"
                      name="payment"
                      id="delivery"
                      className="tf-check"
                    />
                    <label htmlFor="delivery">Cash on delivery</label>
                  </div>
                  <p className="text_black-2 mb_20">
                    Your personal data will be used to process your order,
                    support your experience throughout this website, and for
                    other purposes described in our
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
                      I have read and agree to the website.
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center"
                >
                  Place order
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
