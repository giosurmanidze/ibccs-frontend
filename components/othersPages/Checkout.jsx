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
        delivery: yup.string().required("Delivery option is required"),
        city: yup.string().required("City is required"),
        note: yup.string(),
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
    if (!user && data["store_user"]) {
      localStorage.setItem("store_user_data", JSON.stringify(data));
    }

    const order_details = JSON.parse(sessionStorage.getItem("order_details"));

    // Helper function to clean the field names (remove suffix)
    const cleanFieldNames = (fields) => {
      return fields.map((field) => ({
        ...field,
        name: field.name.replace(/_\d+$/, ""), // Remove the "_number" suffix
      }));
    };

    // Loop through the order items and clean the fields
    const order_items = order_details.map(({ type, ...item }) => ({
      service_id: item.service_id,
      // Clean fields array (sanitize field names inside)
      service_details: {
        ...item,
        fields: cleanFieldNames(item.fields), // Clean the fields array
      },
    }));

    const validatedData = {
      firstname: data["firstname"],
      lastname: data["lastname"],
      phone_number: data["phone_number"],
      email: data["email"],
      address: data["address"],
      city: data["city"],
      note: data["note"],
      delivery_option: data["delivery"],
      order_items: order_items,
    };

    // Create a FormData instance
    const formData = new FormData();

    formData.append("firstname", validatedData.firstname);
    formData.append("lastname", validatedData.lastname);
    formData.append("phone_number", validatedData.phone_number);
    formData.append("email", validatedData.email);
    formData.append("address", validatedData.address);
    formData.append("city", validatedData.city);
    formData.append("note", validatedData.note);
    formData.append("delivery_option", validatedData.delivery_option);

    // Append order items (and handle file fields)
    validatedData.order_items.forEach((item, index) => {
      formData.append(`order_items[${index}][service_id]`, item.service_id);

      // Append the full field information including name and type
      item.service_details.fields.forEach((field, fieldIndex) => {
        formData.append(
          `order_items[${index}][service_details][fields][${fieldIndex}][name]`,
          field.name
        );
        formData.append(
          `order_items[${index}][service_details][fields][${fieldIndex}][type]`,
          field.type
        );

        if (field.type === "file" && field.value) {
          formData.append(
            `order_items[${index}][service_details][fields][${fieldIndex}][value]`,
            field.value
          );
        } else {
          formData.append(
            `order_items[${index}][service_details][fields][${fieldIndex}][value]`,
            field.value
          );
        }

        // If it's a dropdown, include the options
        if (field.type === "dropdown" && field.options) {
          formData.append(
            `order_items[${index}][service_details][fields][${fieldIndex}][options]`,
            JSON.stringify(field.options)
          );
        }
      });
    });

    try {
      const response = await axiosInstance.post("/orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Order is completed.", {
        position: "top-right",
        autoClose: 2000,
      });
      console.log(response);
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

  const [totalPrice2, setTotalPrice2] = useState(0);
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, elm) => {
      const serviceTotal =
        elm.base_price * elm.quantity +
        (elm.extraTaxFields
          ? Object.values(elm.extraTaxFields).reduce(
              (sum, field) => sum + (Number(field.extra_tax) || 0),
              0
            )
          : 0);

      return accumulator + serviceTotal;
    }, 0);

    setTotalPrice2(subtotal);
  }, [cartProducts]);

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
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=" "
                      type="text"
                      id="city"
                      name="city"
                      {...register("city")}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="city"
                    >
                      City
                    </label>
                    {errors.city && (
                      <p className="error">{errors.city.message}</p>
                    )}
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <div className="tf-field style-1 mb_30">
                    <select
                      className="tf-field-input tf-input"
                      id="delivery"
                      name="delivery"
                      {...register("delivery", {
                        required: "Please select a delivery option",
                      })}
                    >
                      <option value="">Select Delivery Option</option>
                      <option value="local">Local Delivery</option>
                      <option value="international">
                        International Delivery
                      </option>
                    </select>
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="delivery"
                    >
                      Delivery options
                    </label>
                    {errors.delivery && (
                      <p className="error">{errors.delivery.message}</p>
                    )}
                  </div>
                </fieldset>
                <fieldset className="box fieldset">
                  <label htmlFor="note" className="fw-5 text_black-2 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="note"
                    id="note"
                    placeholder="Add any note about your order..."
                    className="tf-field-input tf-textarea p-3 rounded-2 w-100"
                    rows="4"
                    {...register("note")}
                  />
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
                          {(
                            elm.base_price * elm.quantity +
                            (elm.extraTaxFields
                              ? Object.values(elm.extraTaxFields).reduce(
                                  (sum, field) =>
                                    sum + (Number(field.extra_tax) || 0),
                                  0
                                )
                              : 0)
                          ).toFixed(2)}$
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
                  <h6 className="total fw-5">{totalPrice2}$</h6>
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
