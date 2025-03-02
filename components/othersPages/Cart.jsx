"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "@/config/axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import mammoth from "mammoth";

export default function Cart() {
  const { cartProducts, setCartProducts } = useContextElement();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/view-cart");
      setPageContent(JSON.parse(response.data?.dynamic_content));
    };
    getPageContent();
  }, []);

  const checkout_box_background =
    pageContent?.cart_content?.checkout_box_background["value"];
  const info_box_background =
    pageContent?.cart_content?.info_box_background["value"];
  const info_box_text = pageContent?.cart_content?.info_box_text["value"];
  const info_box_text_color =
    pageContent?.cart_content?.info_box_text_color["value"];
  const fire_info = pageContent?.cart_content?.fire_info["value"];

  const router = useRouter();

  const setQuantity = (id, quantity) => {
    if (quantity >= 1) {
      const item = cartProducts.filter((elm) => elm.id == id)[0];
      const items = [...cartProducts];
      const itemIndex = items.indexOf(item);
      item.quantity = quantity;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };
  const removeItem = (id) => {
    setCartProducts((pre) => pre.filter((elm) => elm.id !== id));

    let existingOrderDetails =
      JSON.parse(localStorage.getItem("order_details")) || [];
    existingOrderDetails = existingOrderDetails.filter(
      (order) => order.service_id !== id
    );

    localStorage.setItem("order_details", JSON.stringify(existingOrderDetails));
  };

  const [productData, setProductData] = useState(null);

  const handleOpenModal = async (id) => {
    setIsModalOpen(true);
    setIsInitialLoad(true);

    reset(
      {},
      {
        keepValues: false,
        keepDefaultValues: false,
        keepErrors: false,
      }
    );

    try {
      const response = await axiosInstance.get(`services/${id}`);
      setProductData(response.data);

      const savedData = JSON.parse(localStorage.getItem("order_details")) || [];
      const existingOrder = savedData.find((order) => order.service_id === id);

      if (existingOrder?.fields) {
        const defaultValues = {};
        const newFiles = {};

        existingOrder.fields.forEach((field) => {
          if (field.type === "file" && field.value) {
            defaultValues[field.name] = field.value;
            newFiles[field.name] = {
              name: field.value.fileName || field.fileName,
              value: field.value.data || field.value,
            };
          } else {
            defaultValues[field.name] = field.value;
          }
        });

        setFiles(newFiles);
        reset(defaultValues, {
          keepDefaultValues: true,
        });
      } else {
        setFiles({});
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
    setTempCartChanges(null);
    setFiles({});
    setExtraInputs([]);
    setProductData([]);
  };
  const [extraInputs, setExtraInputs] = useState([]);

  const createValidationSchema = (fields) => {
    let schemaShape = {};

    fields?.forEach((field) => {
      if (field.type === "text") {
        schemaShape[field.name] = yup
          .string()
          .required(`${field.name} is required`);
      } else if (field.type === "dropdown") {
        schemaShape[field.name] = yup
          .string()
          .required(`${field.name} is required`);
      } else if (field.type === "radio") {
        schemaShape[field.name] = yup
          .string()
          .required(`${field.name} is required`);

        if (field.extra_tax) {
          extraInputs.forEach((_, index) => {
            schemaShape[`${field.name}_extra_${index}`] = yup
              .string()
              .required(`Extra tax field ${index + 1} is required`);
          });
        }
      } else if (field.type === "checkbox") {
        schemaShape[field.name] = yup
          .array()
          .min(1, "At least one option must be selected");
      } else if (field.type === "file") {
        schemaShape[field.name] = yup.mixed().required("File is required");
      }
    });

    return yup.object().shape(schemaShape);
  };

  const makeFieldsUnique = (fields, productId) => {
    const nameCount = {};

    return fields.map((field) => {
      let baseName = field.name?.replace(/_\d+$/, "");
      let uniqueName = `${baseName}_${productId}`;

      if (nameCount[baseName]) {
        nameCount[baseName] += 1;
        uniqueName = `${baseName}_${productId}_${nameCount[baseName]}`;
      } else {
        nameCount[baseName] = 1;
      }

      return {
        ...field,
        name: uniqueName,
        originalName: baseName,
      };
    });
  };

  const parsedFields = productData?.additional_fields
    ? makeFieldsUnique(
        JSON.parse(productData?.additional_fields),
        productData.id
      )
    : [];

  const [tempCartChanges, setTempCartChanges] = useState(null);

  useEffect(() => {
    if (!isModalOpen) {
      setTempCartChanges(null);
    }
  }, [isModalOpen]);

  const [isInitialLoad, setIsInitialLoad] = useState(null);
  const schema = createValidationSchema(parsedFields);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (tempCartChanges) {
      setCartProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (tempCartChanges[product.id]) {
            return {
              ...product,
              extraTaxFields: tempCartChanges[product.id],
            };
          }
          return product;
        })
      );
    }
    setTempCartChanges(null);
    setIsModalOpen(false);
    const serviceId = productData?.id;
    let existingOrderDetails =
      JSON.parse(localStorage.getItem("order_details")) || [];
    let serviceOrder = existingOrderDetails.find(
      (order) => order.service_id === serviceId
    );
    const fileFields =
      serviceOrder?.fields?.filter((field) => field.type === "file") || [];

    const fileToBase64 = (file) => {
      if (!file || !(file instanceof Blob)) {
        return Promise.resolve(null);
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
      });
    };

    const updatedFields = await Promise.all(
      parsedFields.map(async (field) => {
        let value = data[field.name];

        if (field.type === "file") {
          const existingFile = fileFields.find((f) => f.name === field.name);
          const currentFile = files[field.name];

          if (currentFile instanceof Blob) {
            try {
              const dataUrl = await fileToBase64(currentFile);
              value = {
                data: dataUrl,
                fileName: currentFile.name,
                wordCount: wordCounts[field.name] || 0,
              };
            } catch (error) {
              console.error(`Error processing file ${field.name}:`, error);
              value = existingFile?.value || null;
            }
          } else if (currentFile && currentFile.value) {
            value = {
              data: currentFile.value,
              fileName: currentFile.name,
              wordCount: wordCounts[field.name] || 0,
            };
          } else {
            value = {
              ...existingFile,
              wordCount: existingFile?.wordCount || 0,
            };
          }
        }

        return {
          name: field.name,
          type: field.type,
          value:
            field.type === "file"
              ? value
              : Array.isArray(value)
              ? value
              : value || "",
          ...(field.options && { options: field.options }),
        };
      })
    );

    const filteredFields = updatedFields.filter(
      (field) =>
        (field.type === "file" && field.value) ||
        (typeof field.value === "string" && field.value.trim() !== "") ||
        (Array.isArray(field.value) && field.value.length > 0)
    );

    updatelocalStorage(serviceId, null, filteredFields);
    reset();
    setIsModalOpen(false);
  };
  const updatelocalStorage = (serviceId, fieldName, fieldValue) => {
    let existingOrderDetails =
      JSON.parse(localStorage.getItem("order_details")) || [];

    const calculateTotalPrice = (fields) => {
      // Find the corresponding cart product
      const product = cartProducts.find((p) => p.id === serviceId);

      // Start with base price
      let basePrice = product ? getProductTotal(product) : 0;

      // Parse additional fields to check word count calculation
      let additionalFields = [];
      try {
        additionalFields = product
          ? JSON.parse(product.additional_fields || "[]")
          : [];
      } catch (error) {
        console.error("Error parsing additional fields:", error);
      }

      // Check if word count calculation is enabled
      const isWordCountCalculationEnabled = additionalFields.some(
        (field) =>
          field.name === "Calculation of the number of words" &&
          field.calculation_fee === true
      );

      // Calculate additional word count price
      const wordCountPrice = isWordCountCalculationEnabled
        ? fields
            .filter((field) => field.type === "file" && field.wordCount)
            .reduce((total, field) => {
              // Precise calculation of word count price
              return total + Number((field.wordCount * 0.1).toFixed(2));
            }, 0)
        : 0;

      // Calculate total price (base price + word count price)
      const totalPrice = Number((basePrice + wordCountPrice).toFixed(2));

      // Update cart products with word count fee if applicable
      if (isWordCountCalculationEnabled && wordCountPrice > 0) {
        setCartProducts((prevProducts) =>
          prevProducts.map((p) => {
            if (p.id === serviceId) {
              return {
                ...p,
                extraTaxFields: {
                  ...p.extraTaxFields,
                  word_count_fee: {
                    name: "Word Count Fee",
                    extra_tax: wordCountPrice.toFixed(2),
                    displayName: "Word Count Pricing",
                  },
                },
              };
            }
            return p;
          })
        );
      }

      return totalPrice;
    };

    const orderIndex = existingOrderDetails.findIndex(
      (order) => order.service_id === serviceId
    );

    if (orderIndex !== -1) {
      if (fieldName) {
        const fieldIndex = existingOrderDetails[orderIndex].fields.findIndex(
          (field) => field.name === fieldName
        );

        if (fieldIndex !== -1) {
          existingOrderDetails[orderIndex].fields[fieldIndex].value =
            fieldValue;
          if (typeof fieldValue === "object" && fieldValue.fileName) {
            existingOrderDetails[orderIndex].fields[fieldIndex].fileName =
              fieldValue.fileName;
            existingOrderDetails[orderIndex].fields[fieldIndex].value =
              fieldValue.data;

            // Add word count for file fields
            if (fieldValue.wordCount !== undefined) {
              existingOrderDetails[orderIndex].fields[fieldIndex].wordCount =
                fieldValue.wordCount;
            }
          }

          // Explicitly recalculate and update total price
          existingOrderDetails[orderIndex].total_price = calculateTotalPrice(
            existingOrderDetails[orderIndex].fields
          );
        } else {
          existingOrderDetails[orderIndex].fields.push({
            name: fieldName,
            type: "file",
            value:
              typeof fieldValue === "object" ? fieldValue.data : fieldValue,
            ...(typeof fieldValue === "object" && {
              fileName: fieldValue.fileName,
              wordCount: fieldValue.wordCount,
            }),
          });

          // Recalculate total price
          existingOrderDetails[orderIndex].total_price = calculateTotalPrice(
            existingOrderDetails[orderIndex].fields
          );
        }
      } else {
        // Update fields and recalculate total price
        existingOrderDetails[orderIndex].fields = fieldValue.map((field) => {
          if (field.type === "file" && typeof field.value === "object") {
            return {
              ...field,
              fileName: field.value.fileName,
              value: field.value.data,
              wordCount: field.value.wordCount,
            };
          }
          return field;
        });

        // Recalculate total price
        existingOrderDetails[orderIndex].total_price = calculateTotalPrice(
          existingOrderDetails[orderIndex].fields
        );
      }

      if (existingOrderDetails[orderIndex].fields.length === 0) {
        existingOrderDetails.splice(orderIndex, 1);
      }
    } else {
      if (fieldValue.length > 0) {
        existingOrderDetails.push({
          service_id: serviceId,
          fields: fieldValue.map((field) => {
            if (field.type === "file" && typeof field.value === "object") {
              return {
                ...field,
                fileName: field.value.fileName,
                value: field.value.data,
                wordCount: field.value.wordCount,
              };
            }
            return field;
          }),
          total_price: calculateTotalPrice(fieldValue),
        });
      }
    }

    localStorage.setItem("order_details", JSON.stringify(existingOrderDetails));
  };
  const getCleanFieldName = (fieldName) => {
    return fieldName.split("_")[0];
  };

  const savedData = JSON.parse(localStorage.getItem("order_details")) || [];

  const serviceOrder = savedData.find(
    (order) => order.service_id === productData?.id
  );

  useEffect(() => {
    if (serviceOrder?.fields && isInitialLoad) {
      const fileUpdates = {};
      const formValues = {};
      const wordCountUpdates = {};

      serviceOrder.fields.forEach((field) => {
        if (field.type === "file" && field.value) {
          fileUpdates[field.name] = {
            name: field.fileName || field.value.split("/").pop(),
            value: field.value,
          };
          formValues[field.name] = field.value;

          // Restore word count if available
          if (field.wordCount !== undefined) {
            wordCountUpdates[field.name] = field.wordCount;
          }
        }
      });

      Object.entries(formValues).forEach(([key, value]) => {
        setValue(key, value, {
          shouldValidate: true,
          shouldDirty: true,
        });
      });

      if (Object.keys(fileUpdates).length > 0) {
        setFiles((prev) => ({
          ...prev,
          ...fileUpdates,
        }));
      }

      // Restore word counts
      if (Object.keys(wordCountUpdates).length > 0) {
        setWordCounts((prev) => ({
          ...prev,
          ...wordCountUpdates,
        }));
      }

      setIsInitialLoad(false);
    }
  }, [serviceOrder, setValue, isInitialLoad]);
  const getProductTotal = (product) => {
    const extraTaxFields =
      tempCartChanges?.[product.id] || product.extraTaxFields;

    return (
      product.base_price * product.quantity +
      (extraTaxFields
        ? Object.values(extraTaxFields).reduce(
            (sum, field) => sum + (Number(field.extra_tax) || 0),
            0
          )
        : 0)
    );
  };
  const handleChange = (e, type) => {
    const { name, value } = e.target;

    if (type === "checkbox") {
      setValue(name, [...(watch(name) || []), value]);
    } else {
      setValue(name, value);
    }
  };
  const handleCheckOrder = () => {
    let existingOrderDetails =
      JSON.parse(localStorage.getItem("order_details")) || [];

    if (existingOrderDetails.length === cartProducts.length) {
      if (cartProducts.length !== 0) {
        router.push("/checkout");
      } else {
        toast.error("No services for checkout.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      toast.error("Please fill service requirments.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  const checkOrderExists = (productId) => {
    return savedData?.some((order) => order.service_id === productId);
  };

  const { user } = useAuth();

  const [files, setFiles] = useState({});
  const [wordCounts, setWordCounts] = useState({});
  const countWords = (file, fieldName) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      mammoth
        .extractRawText({ arrayBuffer: arrayBuffer })
        .then((result) => {
          const text = result.value;
          const wordCount = text
            .split(/\s+/)
            .filter((word) => word.length > 0).length;

          // Update word counts
          setWordCounts((prev) => ({
            ...prev,
            [fieldName]: wordCount,
          }));

          // Update temp cart changes with word count fee
          const serviceId = productData?.id;
          if (serviceId) {
            setTempCartChanges((prevChanges) => {
              const currentProduct = cartProducts.find(
                (p) => p.id === serviceId
              );
              const existingExtraTaxFields = {
                ...(prevChanges?.[serviceId] ||
                  currentProduct?.extraTaxFields ||
                  {}),
              };

              // Remove any existing word count fee before adding new one
              const filteredExtraTaxFields = Object.fromEntries(
                Object.entries(existingExtraTaxFields).filter(
                  ([key]) => key !== "word_count_fee"
                )
              );

              const wordCountPrice = Number((wordCount * 0.1).toFixed(2));

              return {
                ...prevChanges,
                [serviceId]: {
                  ...filteredExtraTaxFields,
                  word_count_fee: {
                    name: "Word Count Fee",
                    value: `${wordCount} words`,
                    extra_tax: wordCountPrice.toString(),
                    displayName: "Word Count Pricing",
                  },
                },
              };
            });
          }
        })
        .catch((error) => {
          console.error("Error reading the document:", error);
        });
    };
    reader.readAsArrayBuffer(file);
  };
  const handleFileChange = (event, fieldName, field) => {
    const file = event.target.files[0];
    const serviceId = productData?.id;

    if (file) {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      const currentValues = getValues();

      setValue(fieldName, file, {
        shouldValidate: true,
        shouldDirty: true,
      });

      Object.entries(currentValues).forEach(([key, value]) => {
        if (key !== fieldName && value) {
          setValue(key, value, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      });

      // Check if word count calculation is enabled
      if (field.calculation_fee) {
        countWords(file, fieldName);
      }
    }
  };

  const addExtraInput = (cate_extra_tax) => {
    setExtraInputs((prev) => [...prev, ""]);

    const categoryExtraTax = Number(cate_extra_tax) || 0;

    setTotalExtraCategoryPrice((prev) => {
      const currentTotal = Number(prev) || 0;
      return currentTotal + categoryExtraTax;
    });
  };

  const [totalExtraCategoryPrice, setTotalExtraCategoryPrice] = useState(() => {
    const savedPrice = localStorage.getItem("total_extra_category_price");
    const parsedPrice = parseFloat(savedPrice);
    return !isNaN(parsedPrice) ? parsedPrice : 0;
  });

  useEffect(() => {
    const priceToStore = !isNaN(totalExtraCategoryPrice)
      ? totalExtraCategoryPrice
      : 0;
    localStorage.setItem("total_extra_category_price", priceToStore.toString());
  }, [totalExtraCategoryPrice]);

  const handleSelectChange = (e) => {
    const selectedValue = JSON.parse(e.target.value);
    const fieldName = e.target.name;
    const serviceId = productData?.id;

    if (
      selectedValue &&
      typeof selectedValue === "object" &&
      "extra_tax" in selectedValue
    ) {
      setTempCartChanges((prevChanges) => {
        const currentProduct = cartProducts.find((p) => p.id === serviceId);
        const existingExtraTaxFields =
          prevChanges?.[serviceId] || currentProduct?.extraTaxFields || {};

        const updatedExtraTaxFields = {
          ...existingExtraTaxFields,
          [fieldName]: {
            name: fieldName,
            value: selectedValue.text,
            extra_tax: selectedValue.extra_tax,
            displayName: getCleanFieldName(fieldName),
          },
        };

        return {
          ...prevChanges,
          [serviceId]: updatedExtraTaxFields,
        };
      });
    } else {
      setTempCartChanges((prevChanges) => {
        if (!prevChanges?.[serviceId]) {
          const currentProduct = cartProducts.find((p) => p.id === serviceId);
          const existingFields = { ...currentProduct?.extraTaxFields };
          delete existingFields[fieldName];
          return {
            ...prevChanges,
            [serviceId]: existingFields,
          };
        }
        const updatedFields = { ...prevChanges[serviceId] };
        delete updatedFields[fieldName];

        return {
          ...prevChanges,
          [serviceId]: updatedFields,
        };
      });
    }

    handleChange(e, selectedValue);
  };
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
        {!user && (
          <div
            class="alert alert-success"
            role="alert"
            style={{
              backgroundColor: info_box_background,
              color: info_box_text_color,
            }}
          >
            {info_box_text}
          </div>
        )}
        <div className="tf-cart-countdown">
          <div className="title-left">
            <svg
              className="d-inline-block"
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={24}
              viewBox="0 0 16 24"
              fill="rgb(219 18 21)"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0899 24C11.3119 22.1928 11.4245 20.2409 10.4277 18.1443C10.1505 19.2691 9.64344 19.9518 8.90645 20.1924C9.59084 18.2379 9.01896 16.1263 7.19079 13.8576C7.15133 16.2007 6.58824 17.9076 5.50148 18.9782C4.00436 20.4517 4.02197 22.1146 5.55428 23.9669C-0.806588 20.5819 -1.70399 16.0418 2.86196 10.347C3.14516 11.7228 3.83141 12.5674 4.92082 12.8809C3.73335 7.84186 4.98274 3.54821 8.66895 0C8.6916 7.87426 11.1062 8.57414 14.1592 12.089C17.4554 16.3071 15.5184 21.1748 10.0899 24Z"
              />
            </svg>
            <p>{fire_info}</p>
          </div>
          <div
            className="js-countdown timer-count"
            data-timer={600}
            data-labels="d:,h:,m:,s"
          />
        </div>
        <div className="tf-page-cart-wrap">
          <div className="tf-page-cart-item">
            <div>
              <table className="tf-table-page-cart">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {cartProducts.map((elm, i) => (
                    <tr key={i} className="tf-cart-item file-delete">
                      <td className="tf-cart-item_product">
                        <Link
                          href={`/product-detail/${elm.id}`}
                          className="img-box"
                        >
                          <Image
                            alt="img-product"
                            src={`http://localhost:8000/storage/${elm.icon}`}
                            width={668}
                            height={932}
                          />
                        </Link>
                        <div className="cart-info">
                          <Link
                            href={`/product-detail/${elm.id}`}
                            className="cart-title link"
                          >
                            {elm.title}
                          </Link>
                          <div className="cart-meta-variant">{elm.name}</div>
                          <span
                            className="remove-cart link remove"
                            onClick={() => removeItem(elm.id)}
                          >
                            Remove
                          </span>
                        </div>
                      </td>
                      <td
                        className="tf-cart-item_price"
                        cart-data-title="Price"
                      >
                        <div className="cart-price">${elm.base_price}</div>
                      </td>
                      <td
                        className="tf-cart-item_quantity"
                        cart-data-title="Quantity"
                      >
                        <div className="cart-quantity">
                          <div className="wg-quantity">
                            <span
                              className="btn-quantity minus-btn"
                              onClick={() =>
                                setQuantity(elm.id, elm.quantity - 1)
                              }
                            >
                              <svg
                                className="d-inline-block"
                                width={9}
                                height={1}
                                viewBox="0 0 9 1"
                                fill="currentColor"
                              >
                                <path d="M9 1H5.14286H3.85714H0V1.50201e-05H3.85714L5.14286 0L9 1.50201e-05V1Z" />
                              </svg>
                            </span>
                            <input
                              type="text"
                              name="number"
                              value={elm.quantity}
                              min={1}
                              onChange={(e) =>
                                setQuantity(elm.id, e.target.value / 1)
                              }
                            />
                            <span
                              className="btn-quantity plus-btn"
                              onClick={() =>
                                setQuantity(elm.id, elm.quantity + 1)
                              }
                            >
                              <svg
                                className="d-inline-block"
                                width={9}
                                height={9}
                                viewBox="0 0 9 9"
                                fill="currentColor"
                              >
                                <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        className="tf-cart-item_total"
                        cart-data-title="Total"
                      >
                        <div
                          className="cart-total"
                          style={{ minWidth: "60px" }}
                        >
                          <div className="mb-2 fs-6">
                            ${(elm.base_price * elm.quantity).toFixed(2)}
                          </div>
                          {((tempCartChanges && tempCartChanges[elm.id]) ||
                            elm.extraTaxFields) &&
                            Object.entries(
                              tempCartChanges?.[elm.id] || elm.extraTaxFields
                            )
                              .filter(
                                ([fieldName]) => fieldName !== "word_count_fee"
                              ) // Exclude word count fee
                              .map(([fieldName, field]) => (
                                <div
                                  key={field?.name}
                                  className="extra-tax-item small d-flex justify-content-between align-items-center border-top border-secondary-subtle pt-1 mb-1"
                                >
                                  <span className="text-secondary">
                                    {getCleanFieldName(fieldName)}(
                                    {field?.value}) :
                                  </span>
                                  <span className="text-success">
                                    +${Number(field.extra_tax).toFixed(2)}
                                  </span>
                                </div>
                              ))}

                          {(tempCartChanges?.[elm.id]?.word_count_fee ||
                            savedData
                              .find((order) => order.service_id === elm.id)
                              ?.fields?.some(
                                (field) =>
                                  field.type === "file" && field.wordCount
                              )) && (
                            <div
                              key="word-count-fee"
                              className="word-count-item small d-flex justify-content-between align-items-center border-top border-secondary-subtle pt-1 mb-1"
                            >
                              <span className="text-secondary">
                                {tempCartChanges?.[elm.id]?.word_count_fee
                                  ? `${
                                      tempCartChanges[elm.id].word_count_fee
                                        .value
                                    }`
                                  : "Document words count fee"}
                                :
                              </span>
                              <span className="text-success">
                                +$
                                {Number(
                                  tempCartChanges?.[elm.id]?.word_count_fee
                                    ?.extra_tax ||
                                    savedData
                                      .find(
                                        (order) => order.service_id === elm.id
                                      )
                                      ?.fields?.filter(
                                        (field) =>
                                          field.type === "file" &&
                                          field.wordCount
                                      )
                                      .reduce(
                                        (total, field) =>
                                          total + field.wordCount * 0.1,
                                        0
                                      )
                                      .toFixed(2) ||
                                    0
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="fw-bold d-flex justify-content-between align-items-center border-top pt-2 mt-2 total_price">
                            <span>Total:</span>
                            <span>
                              $
                              {(() => {
                                const orderDetail = savedData.find(
                                  (order) => order.service_id === elm.id
                                );

                                if (orderDetail && orderDetail.total_price) {
                                  return Number(
                                    orderDetail.total_price
                                  ).toFixed(2);
                                }

                                const baseTotal = getProductTotal(elm);
                                const wordCountTotal =
                                  savedData
                                    .find(
                                      (order) => order.service_id === elm.id
                                    )
                                    ?.fields?.filter(
                                      (field) =>
                                        field.type === "file" && field.wordCount
                                    )
                                    .reduce(
                                      (total, field) =>
                                        total + field.wordCount * 0.1,
                                      0
                                    ) || 0;

                                return (baseTotal + wordCountTotal).toFixed(2);
                              })()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <div
                        className="cart-total"
                        style={{ minWidth: "100px" }}
                      ></div>
                      <td>
                        <div>
                          <button
                            className="tf-cart-item_total"
                            cart-data-title="order"
                            onClick={() => handleOpenModal(elm.id)}
                          >
                            <div
                              className={`tf-btn w-100 animate-hover-btn radius-3 ${
                                checkOrderExists(elm.id) ? "filled_bg" : ""
                              }`}
                            >
                              {checkOrderExists(elm.id)
                                ? "Filled service"
                                : "Fill service details"}
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <form
                className={`modal fade ${isModalOpen ? "show" : ""}`}
                tabIndex="-1"
                role="dialog"
                style={{ display: isModalOpen ? "block" : "none" }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h6 className="modal-title">
                        Fill service requirements <p>{productData?.name}</p>
                      </h6>
                      <button
                        onClick={handleCloseModal}
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="tf-field style-1 mb_30">
                          {parsedFields?.map((field, index) => {
                            const displayName = getCleanFieldName(field.name);

                            return (
                              <div
                                key={`${field.name}-${index}`}
                                className="tf-field style-1 mb_30"
                              >
                                <h5>{field?.title}</h5>
                                <>
                                  {field.type === "text" && (
                                    <div
                                      key={`textfield_${field.name}}`}
                                      className="form-group"
                                    >
                                      <label
                                        className="fw-4 text_black-2"
                                        htmlFor={`${field.name}}`}
                                      >
                                        {displayName} *
                                      </label>
                                      <input
                                        className="tf-field-input tf-input custom-input"
                                        placeholder=""
                                        type="text"
                                        id={`${field.name}}`}
                                        {...register(field.name)}
                                      />
                                    </div>
                                  )}
                                  {field.type === "dropdown" && (
                                    <div className="select-input">
                                      <label className=" fw-4 text_black-2">
                                        {displayName} *
                                      </label>
                                      <select
                                        className="tf-field-input tf-input custom-input form-control form-control-sm w-50"
                                        id={field.name}
                                        {...register(field.name)}
                                        onChange={handleSelectChange}
                                      >
                                        <option value="">
                                          Select an option
                                        </option>
                                        {Object.entries(field.options)?.map(
                                          ([key, option], idx) => (
                                            <option
                                              key={idx}
                                              value={JSON.stringify(option)}
                                            >
                                              {option.text}
                                              {option.extra_tax
                                                ? `(Extra Tax: $${option.extra_tax})`
                                                : ""}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                  )}
                                  {field.type === "radio" && (
                                    <div className="mb-2 d-flex flex-column radio-group">
                                      <label className="fw-4 text_black-2">
                                        {displayName} *
                                      </label>
                                      <div className="d-flex flex-column">
                                        {Object.entries(field.options)?.map(
                                          ([key, option], idx) => (
                                            <div
                                              key={idx}
                                              className="d-flex align-items-center mb-2 radio-option"
                                            >
                                              {option.extra_tax && (
                                                <div className="d-flex flex-column gap-2 additional-charge">
                                                  <span className="fw-bold">
                                                    Consultation fee:
                                                    {field.extra_tax}$
                                                  </span>
                                                  <span className="fw-bold">
                                                    Fee for extra category(s):
                                                    {totalExtraCategoryPrice}$
                                                  </span>
                                                  <span className="fw-bold">
                                                    Total price:
                                                    {Number(field.extra_tax) +
                                                      totalExtraCategoryPrice}
                                                    $
                                                  </span>
                                                </div>
                                              )}
                                              <input
                                                type="radio"
                                                id={`${field.name}_${idx}`}
                                                className="form-check-input me-2"
                                                name={field.name}
                                                value={JSON.stringify(option)}
                                                {...register(field.name)}
                                                onChange={handleSelectChange}
                                              />
                                              <label
                                                htmlFor={`${field.name}_${idx}`}
                                                className="form-check-label custom-radio"
                                              >
                                                {option.text}
                                              </label>
                                            </div>
                                          )
                                        )}
                                      </div>
                                      {field.extra_category_tax && (
                                        <div className="extra-tax-section mt-3 flex-column">
                                          <div className="d-flex flex-column align-items-start mb-2">
                                            <button
                                              type="button"
                                              className="btn btn-sm  mt-2 add-category-button"
                                              onClick={() =>
                                                addExtraInput(
                                                  field.extra_category_tax
                                                )
                                              }
                                            >
                                              Add category
                                            </button>
                                          </div>
                                          {extraInputs.map((_, idx) => (
                                            <div
                                              key={idx}
                                              className="mb-2 d-flex align-items-center"
                                            >
                                              <input
                                                type="text"
                                                className="form-control form-control-sm w-50"
                                                {...register(
                                                  `${field.name}_extra_${idx}`
                                                )}
                                                placeholder={`Category ${
                                                  idx + 1
                                                }`}
                                              />
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-danger ms-2 delete-category-button"
                                                onClick={() => {
                                                  setExtraInputs((prev) =>
                                                    prev.filter(
                                                      (_, i) => i !== idx
                                                    )
                                                  );
                                                  setTotalExtraCategoryPrice(
                                                    (prev) => {
                                                      if (
                                                        idx === 0 &&
                                                        extraInputs.length === 1
                                                      ) {
                                                        return 0;
                                                      } else {
                                                        return (
                                                          prev -
                                                          field.extra_category_tax
                                                        );
                                                      }
                                                    }
                                                  );
                                                  const newTotal =
                                                    idx === 0
                                                      ? totalExtraCategoryPrice -
                                                        field.extra_tax
                                                      : totalExtraCategoryPrice -
                                                        field.extra_category_tax;
                                                  localStorage.setItem(
                                                    "total_extra_category_price",
                                                    newTotal.toString()
                                                  );
                                                }}
                                              >
                                                -
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {field.comment && (
                                        <p className="comment-text">
                                          <span>*</span> {field?.comment}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {field.type === "checkbox" && (
                                    <div className="checkbox-group">
                                      <label>{displayName} *</label>
                                      <div>
                                        {field.options?.map((option, idx) => {
                                          const optionName =
                                            option.name || option;
                                          const optionValue =
                                            option.value || option;
                                          return (
                                            <div
                                              key={idx}
                                              className="checkbox-option"
                                            >
                                              <input
                                                type="checkbox"
                                                id={`${field.name}-${optionValue}`}
                                                name={field.name}
                                                value={optionValue}
                                                {...register(field.name)}
                                                defaultChecked={field.value?.includes(
                                                  optionValue
                                                )}
                                              />
                                              <label
                                                htmlFor={`${field.name}-${optionValue}`}
                                                className="custom-checkbox"
                                              >
                                                {optionName}
                                              </label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  {errors.file && (
                                    <p className="text-red-500">
                                      {errors.file.message}
                                    </p>
                                  )}
                                  {field.type === "file" && (
                                    <div className="file-upload button-wrap">
                                      <input
                                        type="file"
                                        id={field.name}
                                        {...register(field.name)}
                                        onChange={(e) =>
                                          handleFileChange(e, field.name, field)
                                        }
                                        className="file-upload-input"
                                      />
                                      <label
                                        htmlFor={field.name}
                                        className="new-button"
                                      >
                                        {displayName} *
                                      </label>
                                      {files[field.name]?.name && (
                                        <p className="file-upload-file-name">
                                          File: {files[field.name]?.name}
                                        </p>
                                      )}
                                      {files[field.name]?.name &&
                                        field?.calculation_fee && (
                                          <div className="file-upload-info">
                                            <p className="file-upload-word-count">
                                              Word Count:
                                              {` ${
                                                wordCounts[field.name] || 0
                                              }`}
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                  <p className="file-upload-word-count ">
                                    {field.comment2}
                                  </p>
                                  {wordCounts[field.name] && (
                                    <div>
                                      {wordCounts[field.name] ? (
                                        <p className="file-upload-word-count">
                                          Total price =
                                          {` ${wordCounts[field.name] * 0.1}`} $
                                        </p>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  )}
                                </>
                                {errors[field.name] && (
                                  <p className="error">
                                    This field is required
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </form>
                    </div>
                    <div className="modal-footer">
                      <div>
                        <button
                          className="tf-cart-item_total"
                          cart-data-title="order"
                          type="submit"
                          onClick={handleCloseModal}
                        >
                          <div
                            className={`tf-btn w-100 animate-hover-btn radius-3 `}
                            style={{ minWidth: "60px" }}
                          >
                            Cancel
                          </div>
                        </button>
                      </div>
                      <div>
                        <button
                          className="tf-cart-item_total"
                          cart-data-title="order"
                          type="submit"
                        >
                          <div
                            className={`tf-btn w-100 animate-hover-btn radius-3 `}
                            style={{ minWidth: "60px" }}
                          >
                            Confirm
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              {isModalOpen && (
                <div
                  className="modal-backdrop fade show"
                  onClick={handleCloseModal}
                ></div>
              )}
              {!cartProducts.length && (
                <>
                  <div className="row align-items-center mb-5">
                    <div className="col-6 fs-18">Your shop cart is empty</div>
                    <div className="col-6">
                      {pageContent.buttons && (
                        <Link
                          href={pageContent.buttons[0].url}
                          className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                          style={{
                            width: "fit-content",
                            backgroundColor:
                              pageContent.buttons[0].background_color,
                            color: pageContent.buttons[0].text_color,
                          }}
                        >
                          {pageContent.buttons[0].text}
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="tf-page-cart-footer">
            <div className="tf-cart-footer-inner">
              <div
                className="tf-page-cart-checkout"
                style={{ backgroundColor: checkout_box_background }}
              >
                <div className="tf-cart-totals-discounts">
                  <h3>Subtotal</h3>
                  <span className="total-value">${totalPrice2} USD</span>
                </div>
                <p className="tf-cart-tax">
                  Taxes and
                  <Link href={`/shipping-delivery`}>shipping</Link> calculated
                  at checkout
                </p>
                <div className="cart-checkbox">
                  <input
                    type="checkbox"
                    className="tf-check"
                    id="check-agree"
                  />
                  <label htmlFor="check-agree" className="fw-4">
                    I agree with the
                    <Link href={`/terms-conditions`}>terms and conditions</Link>
                  </label>
                </div>
                <div className="cart-checkout-btn">
                  {pageContent.buttons && (
                    <button
                      onClick={handleCheckOrder}
                      className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                      style={{
                        width: "fit-content",
                        backgroundColor:
                          pageContent.buttons[1].background_color,
                        color: pageContent.buttons[1].text_color,
                      }}
                    >
                      {pageContent.buttons[1].text}
                    </button>
                  )}
                </div>
                <div className="tf-page-cart_imgtrust">
                  <p className="text-center fw-6">Guarantee Safe Checkout</p>
                  <div className="cart-list-social">
                    <div className="payment-item">
                      <svg
                        viewBox="0 0 38 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        width={38}
                        height={24}
                        aria-labelledby="pi-visa"
                      >
                        <title id="pi-visa">Visa</title>
                        <path
                          opacity=".07"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                        />
                        <path
                          fill="#fff"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                        />
                        <path
                          d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z"
                          fill="#142688"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        viewBox="0 0 38 24"
                        xmlns="http://www.w3.org/2000/svg"
                        width={38}
                        height={24}
                        role="img"
                        aria-labelledby="pi-paypal"
                      >
                        <title id="pi-paypal">PayPal</title>
                        <path
                          opacity=".07"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                        />
                        <path
                          fill="#fff"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                        />
                        <path
                          fill="#003087"
                          d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"
                        />
                        <path
                          fill="#3086C8"
                          d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"
                        />
                        <path
                          fill="#012169"
                          d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        viewBox="0 0 38 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        width={38}
                        height={24}
                        aria-labelledby="pi-master"
                      >
                        <title id="pi-master">Mastercard</title>
                        <path
                          opacity=".07"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                        />
                        <path
                          fill="#fff"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                        />
                        <circle fill="#EB001B" cx={15} cy={12} r={7} />
                        <circle fill="#F79E1B" cx={23} cy={12} r={7} />
                        <path
                          fill="#FF5F00"
                          d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-labelledby="pi-american_express"
                        viewBox="0 0 38 24"
                        width={38}
                        height={24}
                      >
                        <title id="pi-american_express">American Express</title>
                        <path
                          fill="#000"
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z"
                          opacity=".07"
                        />
                        <path
                          fill="#006FCF"
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32Z"
                        />
                        <path
                          fill="#FFF"
                          d="M22.012 19.936v-8.421L37 11.528v2.326l-1.732 1.852L37 17.573v2.375h-2.766l-1.47-1.622-1.46 1.628-9.292-.02Z"
                        />
                        <path
                          fill="#006FCF"
                          d="M23.013 19.012v-6.57h5.572v1.513h-3.768v1.028h3.678v1.488h-3.678v1.01h3.768v1.531h-5.572Z"
                        />
                        <path
                          fill="#006FCF"
                          d="m28.557 19.012 3.083-3.289-3.083-3.282h2.386l1.884 2.083 1.89-2.082H37v.051l-3.017 3.23L37 18.92v.093h-2.307l-1.917-2.103-1.898 2.104h-2.321Z"
                        />
                        <path
                          fill="#FFF"
                          d="M22.71 4.04h3.614l1.269 2.881V4.04h4.46l.77 2.159.771-2.159H37v8.421H19l3.71-8.421Z"
                        />
                        <path
                          fill="#006FCF"
                          d="m23.395 4.955-2.916 6.566h2l.55-1.315h2.98l.55 1.315h2.05l-2.904-6.566h-2.31Zm.25 3.777.875-2.09.873 2.09h-1.748Z"
                        />
                        <path
                          fill="#006FCF"
                          d="M28.581 11.52V4.953l2.811.01L32.84 9l1.456-4.046H37v6.565l-1.74.016v-4.51l-1.644 4.494h-1.59L30.35 7.01v4.51h-1.768Z"
                        />
                      </svg>
                    </div>
                    <div className="payment-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        viewBox="0 0 38 24"
                        width={38}
                        height={24}
                        aria-labelledby="pi-amazon"
                      >
                        <title id="pi-amazon">Amazon</title>
                        <path
                          d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                          fill="#000"
                          fillRule="nonzero"
                          opacity=".07"
                        />
                        <path
                          d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                          fill="#FFF"
                          fillRule="nonzero"
                        />
                        <path
                          d="M25.26 16.23c-1.697 1.48-4.157 2.27-6.275 2.27-2.97 0-5.644-1.3-7.666-3.463-.16-.17-.018-.402.173-.27 2.183 1.504 4.882 2.408 7.67 2.408 1.88 0 3.95-.46 5.85-1.416.288-.145.53.222.248.47v.001zm.706-.957c-.216-.328-1.434-.155-1.98-.078-.167.024-.193-.148-.043-.27.97-.81 2.562-.576 2.748-.305.187.272-.047 2.16-.96 3.063-.14.138-.272.064-.21-.12.205-.604.664-1.96.446-2.29h-.001z"
                          fill="#F90"
                          fillRule="nonzero"
                        />
                        <path
                          d="M21.814 15.291c-.574-.498-.676-.73-.993-1.205-.947 1.012-1.618 1.315-2.85 1.315-1.453 0-2.587-.938-2.587-2.818 0-1.467.762-2.467 1.844-2.955.94-.433 2.25-.51 3.25-.628v-.235c0-.43.033-.94-.208-1.31-.212-.333-.616-.47-.97-.47-.66 0-1.25.353-1.392 1.085-.03.163-.144.323-.3.33l-1.677-.187c-.14-.033-.296-.153-.257-.38.386-2.125 2.223-2.766 3.867-2.766.84 0 1.94.234 2.604.9.842.82.762 1.918.762 3.11v2.818c0 .847.335 1.22.65 1.676.113.164.138.36-.003.482-.353.308-.98.88-1.326 1.2a.367.367 0 0 1-.414.038zm-1.659-2.533c.34-.626.323-1.214.323-1.918v-.392c-1.25 0-2.57.28-2.57 1.82 0 .782.386 1.31 1.05 1.31.487 0 .922-.312 1.197-.82z"
                          fill="#221F1F"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
