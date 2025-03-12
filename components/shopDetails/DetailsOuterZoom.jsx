"use client";
import React, { useEffect, useState } from "react";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider1ZoomOuter from "./sliders/Slider1ZoomOuter";
import { useContextElement } from "@/context/Context";
import axiosInstance from "@/config/axios";
import { FileDown } from "lucide-react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

export default function DetailsOuterZoom({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(null);
  const [blockingErrors, setBlockingErrors] = useState({});
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});

  const [extraInputs, setExtraInputs] = useState([]);
  const [wordCounts, setWordCounts] = useState({});

  const [files, setFiles] = useState({});
  const [conditionalOptions, setConditionalOptions] = useState({});
  const [tempCartChanges, setTempCartChanges] = useState(null);

  const [loadingItemId, setLoadingItemId] = useState(null);
  const handleOptionWithValidation = (e, fieldName, fieldType) => {
    try {
      let selectedOption = null;

      // For both radio and dropdown options, try to parse the value as JSON
      try {
        selectedOption = JSON.parse(e.target.value);
      } catch (error) {
        console.error("Error parsing option value:", error);
        // If parsing fails, just use the value as is
        handleChange(e);
        return;
      }

      // Check if this option blocks continuation
      if (selectedOption.blocks_continuation) {
        // Set the error state for this field
        setBlockingErrors((prev) => ({
          ...prev,
          [fieldName]: {
            error: true,
            message:
              selectedOption.error_message ||
              "Cannot proceed with this selection",
          },
        }));

        if (fieldType === "dropdown") {
          handleDropdownWithConditional(e, fieldName);
        } else {
          handleSelectChange(e);
        }
      } else {
        // Clear any blocking error for this field
        setBlockingErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });

        // Continue with normal handling
        if (fieldType === "dropdown") {
          handleDropdownWithConditional(e, fieldName);
        } else {
          handleSelectChange(e);
        }
      }
    } catch (error) {
      console.error("Error in handleOptionWithValidation:", error);
      // If there's an error, just use the default handler
      if (fieldType === "dropdown") {
        handleDropdownWithConditional(e, fieldName);
      } else {
        handleSelectChange(e);
      }
    }
  };

  const handleDropdownWithConditional = (e, fieldName) => {
    try {
      const selectedValue = JSON.parse(e.target.value);

      handleSelectChange(e);

      // Check if this option has conditional options that should be shown
      if (selectedValue && selectedValue.has_conditional_options) {
        // Get the conditional options definitions
        const conditionalOpts = selectedValue.conditional_options || [];

        setConditionalOptions((prev) => ({
          ...prev,
          [fieldName]: {
            parentOption: selectedValue.text,
            options: conditionalOpts,
          },
        }));

        // If there are saved conditional values, restore them
        const savedData =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("order_details") || "[]")
            : [];

        const serviceOrder = savedData.find(
          (order) => order.service_id === productData?.id
        );

        const fieldData = serviceOrder?.fields?.find(
          (f) => f.name === fieldName
        );

        if (fieldData?.conditional_values) {
          // Set the form values for each conditional field
          conditionalOpts.forEach((condOption, index) => {
            const value = fieldData.conditional_values[condOption.text];
            if (value) {
              setValue(`${fieldName}_conditional_${index}`, value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          });
        }
      } else {
        setConditionalOptions((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    } catch (error) {
      console.error("Error handling dropdown selection:", error);
    }
  };
  const handleConditionalDropdownChange = (e, fieldName, condOptionIndex) => {
    const { value } = e.target;

    setValue(`${fieldName}_conditional_${condOptionIndex}`, value);
  };
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
  const handleChange = (e, type) => {
    const { name, value } = e.target;

    if (type === "checkbox") {
      setValue(name, [...(watch(name) || []), value]);
    } else {
      setValue(name, value);
    }
  };
  const handleTimeSlotSelection = (fieldName, selectedSlot) => {
    setSelectedTimeSlots((prev) => ({
      ...prev,
      [fieldName]: selectedSlot,
    }));

    if (selectedSlot) {
      setValue(fieldName, selectedSlot.display);
    } else {
      setValue(fieldName, "");
    }
  };
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
      } else if (field.type === "timeslot") {
        schemaShape[field.name] = yup
          .string()
          .required("Please select a time slot");
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
        typeof productData.additional_fields === "string"
          ? JSON.parse(productData.additional_fields)
          : productData.additional_fields,
        productData.id
      )
    : [];

  const schema = createValidationSchema(parsedFields);

  const {
    addProductToCart,
    isAddedToCartProducts,
    cartProducts,
    totalPrice,
    setCartProducts,
  } = useContextElement();
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/product-detail");
      setPageContent(JSON.parse(response.data?.dynamic_content));
    };
    getPageContent();
  }, []);

  const button1 = pageContent?.buttons?.[0] ?? null;
  const button2 = pageContent?.buttons?.[1] ?? null;
  const button3 = pageContent?.buttons?.[2] ?? null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (fileId, filename) => {
    const url = `http://localhost:8000/api/download/${fileId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    try {
      // Handle validation errors
      if (Object.keys(blockingErrors).length > 0) {
        const firstErrorField = Object.keys(blockingErrors)[0];
        const errorMessage = blockingErrors[firstErrorField].message;

        toast.error(
          errorMessage || "Please correct the errors before continuing",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return;
      }

      // Handle temp cart changes
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

      // Handle file conversions
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

      // Process all fields
      const updatedFields = await Promise.all(
        parsedFields.map(async (field) => {
          let value = data[field.name];

          if (field.type === "file") {
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
                value = null;
              }
            } else if (currentFile && currentFile.value) {
              value = {
                data: currentFile.value,
                fileName: currentFile.name,
                wordCount: wordCounts[field.name] || 0,
              };
            } else {
              value = null;
            }
          }

          // Handle conditional values
          let conditionalValues = null;
          if (conditionalOptions[field.name]) {
            conditionalValues = {};
            conditionalOptions[field.name].options.forEach(
              (condOption, index) => {
                const condValue = data[`${field.name}_conditional_${index}`];
                if (condValue) {
                  conditionalValues[condOption.text] = condValue;
                }
              }
            );
          }

          // Handle timeslot
          if (field.type === "timeslot") {
            const selectedTimeSlot = selectedTimeSlots[field.name];
            if (selectedTimeSlot) {
              return {
                name: field.name,
                type: field.type,
                value: selectedTimeSlot.display,
                ...(field.time_slots && { time_slots: field.time_slots }),
                ...(conditionalValues && {
                  conditional_values: conditionalValues,
                }),
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
            ...(field.time_slots && { time_slots: field.time_slots }),
            ...(conditionalValues && { conditional_values: conditionalValues }),
          };
        })
      );

      // Filter out empty fields
      const filteredFields = updatedFields.filter(
        (field) =>
          (field.type === "file" && field.value) ||
          (typeof field.value === "string" && field.value.trim() !== "") ||
          (Array.isArray(field.value) && field.value.length > 0)
      );

      // Calculate total price (assuming you have this value somewhere)
      // const totalPrice = calculateTotalPrice(); // Replace with your actual price calculation logic

      // Prepare data for API request
      const cartData = {
        service_id: serviceId,
        fields: filteredFields,
        total_price: totalPrice || 0,
        quantity: quantity,
      };

      // Make API request to store cart data
      const response = await axiosInstance.post("/carts", cartData);

      console.log(response.data);

      // If successful
      if (response.data.success) {
        toast.success("Item added to cart successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        // You might still want to update UI state
        addProductToCart(serviceId, quantity);

        // Reset form
        reset();
        setQuantity(1);
      } else {
        throw new Error(response.data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error(error.message || "Failed to add item to cart", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };
  const savedData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("order_details") || "[]")
      : [];
  const serviceOrder = savedData.find(
    (order) => order.service_id === productData?.id
  );

  useEffect(() => {
    if (serviceOrder?.fields && isInitialLoad) {
      const fileUpdates = {};
      const formValues = {};
      const wordCountUpdates = {};
      const condOptionsUpdates = {};

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
        if (field.type === "timeslot" && field.value) {
          try {
            // Try to parse as JSON first (for backward compatibility)
            let timeSlotValue;
            try {
              timeSlotValue = JSON.parse(field.value);

              // If it's already a display string, use it directly
              if (typeof timeSlotValue === "string") {
                setValue(field.name, timeSlotValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                // Create a minimal slot object for the UI
                // The timestamp is needed for selected slot highlighting
                const datePart = timeSlotValue.split(" ")[0];
                setSelectedTimeSlots((prev) => ({
                  ...prev,
                  [field.name]: {
                    display: timeSlotValue,
                    timestamp: new Date(datePart).getTime(),
                  },
                }));
              } else {
                // It's the old format with the full object
                setSelectedTimeSlots((prev) => ({
                  ...prev,
                  [field.name]: timeSlotValue,
                }));

                // Store just the display string in the form value
                setValue(field.name, timeSlotValue.display, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            } catch (error) {
              // Not JSON, assume it's already a display string
              console.log(
                `Time slot value is already a string: ${field.value}`
              );
              setValue(field.name, field.value, {
                shouldValidate: true,
                shouldDirty: true,
              });

              // Create a minimal slot object with timestamp for UI highlighting
              const datePart = field.value.split(" ")[0];
              setSelectedTimeSlots((prev) => ({
                ...prev,
                [field.name]: {
                  display: field.value,
                  timestamp: new Date(datePart).getTime(),
                },
              }));
            }
          } catch (error) {
            console.error(
              `Error processing time slot value for ${field.name}:`,
              error
            );
          }
        }

        // CHANGE: Restore conditional values
        if (field.conditional_values) {
          try {
            // Find the parent option from the conditional values
            let parentOption = null;
            if (field.value && field.type === "dropdown") {
              try {
                parentOption = JSON.parse(field.value);
              } catch (err) {
                console.error("Error parsing parent option:", err);
              }
            }

            if (parentOption) {
              // Extract conditional options from the parent option value
              const conditionalOptionsFromValue =
                parentOption.conditional_options || [];

              // Update the conditionalOptions state
              condOptionsUpdates[field.name] = {
                parentOption: parentOption.text,
                options: conditionalOptionsFromValue,
              };

              // Set values for each conditional field
              conditionalOptionsFromValue.forEach((condOptionDef, index) => {
                const optionText = condOptionDef.text;
                const value = field.conditional_values[optionText];

                if (value) {
                  const fieldName = `${field.name}_conditional_${index}`;
                  formValues[fieldName] = value;

                  // Make sure to set the form value
                  setValue(fieldName, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });

                  console.log(
                    `Restored conditional value for ${fieldName}: ${value}`
                  );
                }
              });
            }
          } catch (error) {
            console.error(
              `Error restoring conditional values for ${field.name}:`,
              error
            );
          }
        }
      });

      // Set all form values
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

      // CHANGE: Restore conditional options state
      if (Object.keys(condOptionsUpdates).length > 0) {
        setConditionalOptions((prev) => ({
          ...prev,
          ...condOptionsUpdates,
        }));
      }

      setIsInitialLoad(false);
    }
  }, [serviceOrder, setValue, isInitialLoad]);

  const handleFileChange = (event, fieldName, field) => {
    const file = event.target.files[0];
    const serviceId = productData?.id;

    if (file) {
      // Store the raw file for base64 conversion later
      setFiles((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      // For form validation only, we can set a simple value
      setValue(fieldName, file.name, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Preserve other form values
      const currentValues = getValues();
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

  const getProductTotal = (product) => {
    const extraTaxFields =
      tempCartChanges?.[product.id] || product.extraTaxFields;

    return (
      product.base_price * quantity +
      (extraTaxFields
        ? Object.values(extraTaxFields).reduce(
            (sum, field) => sum + (Number(field.extra_tax) || 0),
            0
          )
        : 0)
    );
  };
  function ensureDateFormat(dateStr) {
    if (!dateStr) return null;

    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Try to parse MM/DD/YYYY format
    const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr);
    if (mmddyyyy) {
      const [_, month, day, year] = mmddyyyy;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Try to create a date and format it
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return formatDateToYYYYMMDD(date);
      }
    } catch (e) {
      console.error("Could not parse date:", dateStr);
    }

    return dateStr; // Return original if we can't parse it
  }
  function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format time display
  function formatTime(date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function ensureTimeFormat(timeStr) {
    if (!timeStr) return "00:00";

    // If already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      // Ensure hours have leading zero
      const [hours, minutes] = timeStr.split(":");
      return `${hours.padStart(2, "0")}:${minutes}`;
    }

    // Handle 12-hour format with AM/PM
    const twelveHourFormat = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeStr);
    if (twelveHourFormat) {
      let [_, hours, minutes, period] = twelveHourFormat;
      hours = parseInt(hours);

      // Convert to 24-hour
      if (period.toUpperCase() === "PM" && hours < 12) {
        hours += 12;
      } else if (period.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }

    // Try to use Date object to parse
    try {
      // Create a date with the time string
      const today = new Date();
      const dateWithTime = new Date(
        `${formatDateToYYYYMMDD(today)} ${timeStr}`
      );

      if (!isNaN(dateWithTime.getTime())) {
        return `${dateWithTime
          .getHours()
          .toString()
          .padStart(2, "0")}:${dateWithTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }
    } catch (e) {
      console.error("Could not parse time:", timeStr);
    }

    return timeStr;
  }
  // const updatelocalStorage = (serviceId, fieldName, fieldValue) => {
  //   const existingOrderDetails =
  //     typeof window !== "undefined"
  //       ? JSON.parse(localStorage.getItem("order_details") || "[]")
  //       : [];
  //   const calculateTotalPrice = (fields) => {
  //     // Find the corresponding cart product
  //     const product = cartProducts.find((p) => p.id === serviceId);

  //     // Start with base price
  //     let basePrice = product ? product.base_price : 0;

  //     // Apply quantity
  //     basePrice = basePrice * quantity;

  //     // Get extra tax fields
  //     const extraTaxFields =
  //       product?.extraTaxFields || tempCartChanges?.[serviceId] || {};

  //     // Add extra tax values
  //     const extraTaxTotal = Object.values(extraTaxFields).reduce(
  //       (sum, field) => sum + (Number(field.extra_tax) || 0),
  //       0
  //     );

  //     // Parse additional fields to check word count calculation
  //     let additionalFields = [];
  //     try {
  //       additionalFields = product
  //         ? JSON.parse(product.additional_fields || "[]")
  //         : [];
  //     } catch (error) {
  //       console.error("Error parsing additional fields:", error);
  //     }

  //     // Check if word count calculation is enabled
  //     const isWordCountCalculationEnabled = additionalFields.some(
  //       (field) =>
  //         field.name === "Calculation of the number of words" &&
  //         field.calculation_fee === true
  //     );

  //     // Calculate additional word count price
  //     const wordCountPrice = isWordCountCalculationEnabled
  //       ? fields
  //           .filter((field) => field.type === "file" && field.wordCount)
  //           .reduce((total, field) => {
  //             // Precise calculation of word count price
  //             return total + Number((field.wordCount * 0.1).toFixed(2));
  //           }, 0)
  //       : 0;

  //     // Calculate total price (base price + extra tax + word count price)
  //     const totalPrice = Number(
  //       (basePrice + extraTaxTotal + wordCountPrice).toFixed(2)
  //     );

  //     // Update cart products with word count fee if applicable
  //     if (isWordCountCalculationEnabled && wordCountPrice > 0) {
  //       setCartProducts((prevProducts) =>
  //         prevProducts.map((p) => {
  //           if (p.id === serviceId) {
  //             return {
  //               ...p,
  //               extraTaxFields: {
  //                 ...p.extraTaxFields,
  //                 word_count_fee: {
  //                   name: "Word Count Fee",
  //                   extra_tax: wordCountPrice.toFixed(2),
  //                   displayName: "Word Count Pricing",
  //                 },
  //               },
  //             };
  //           }
  //           return p;
  //         })
  //       );
  //     }

  //     console.log("Calculated total price:", totalPrice);
  //     return totalPrice;
  //   };

  //   if (fieldName) {
  //     // Generate a unique ID
  //     const uniqueId = `${serviceId}_${Date.now()}`;

  //     // This handles individual field updates
  //     const orderIndex = existingOrderDetails.findIndex(
  //       (order) => order.service_id === serviceId
  //     );

  //     if (orderIndex !== -1) {
  //       // If the entry doesn't already have a unique_id, add one
  //       if (!existingOrderDetails[orderIndex].unique_id) {
  //         existingOrderDetails[orderIndex].unique_id = uniqueId;
  //       }

  //       const fieldIndex = existingOrderDetails[orderIndex].fields.findIndex(
  //         (field) => field.name === fieldName
  //       );

  //       if (fieldIndex !== -1) {
  //         existingOrderDetails[orderIndex].fields[fieldIndex].value =
  //           fieldValue;
  //         if (typeof fieldValue === "object" && fieldValue.fileName) {
  //           existingOrderDetails[orderIndex].fields[fieldIndex].fileName =
  //             fieldValue.fileName;
  //           existingOrderDetails[orderIndex].fields[fieldIndex].value =
  //             fieldValue.data;

  //           // Add word count for file fields
  //           if (fieldValue.wordCount !== undefined) {
  //             existingOrderDetails[orderIndex].fields[fieldIndex].wordCount =
  //               fieldValue.wordCount;
  //           }
  //         }

  //         // Explicitly recalculate and update total price
  //         existingOrderDetails[orderIndex].total_price = calculateTotalPrice(
  //           existingOrderDetails[orderIndex].fields
  //         );
  //       } else {
  //         existingOrderDetails[orderIndex].fields.push({
  //           name: fieldName,
  //           type: "file",
  //           value:
  //             typeof fieldValue === "object" ? fieldValue.data : fieldValue,
  //           ...(typeof fieldValue === "object" && {
  //             fileName: fieldValue.fileName,
  //             wordCount: fieldValue.wordCount,
  //           }),
  //         });

  //         // Recalculate total price
  //         existingOrderDetails[orderIndex].total_price = calculateTotalPrice(
  //           existingOrderDetails[orderIndex].fields
  //         );
  //       }
  //     } else {
  //       // Always add a new entry when service_id doesn't exist
  //       existingOrderDetails.push({
  //         service_id: serviceId,
  //         unique_id: uniqueId,
  //         fields: [
  //           {
  //             name: fieldName,
  //             type: "file",
  //             value:
  //               typeof fieldValue === "object" ? fieldValue.data : fieldValue,
  //             ...(typeof fieldValue === "object" && {
  //               fileName: fieldValue.fileName,
  //               wordCount: fieldValue.wordCount,
  //             }),
  //           },
  //         ],
  //         total_price: calculateTotalPrice([
  //           {
  //             name: fieldName,
  //             type: "file",
  //             value: fieldValue,
  //             ...(typeof fieldValue === "object" && {
  //               wordCount: fieldValue.wordCount,
  //             }),
  //           },
  //         ]),
  //       });
  //     }
  //   } else {
  //     const uniqueId = `${serviceId}_${Date.now()}`;

  //     const calculatedTotalPrice = calculateTotalPrice(fieldValue);

  //     existingOrderDetails.push({
  //       service_id: serviceId,
  //       unique_id: uniqueId,
  //       fields: fieldValue.map((field) => {
  //         if (field.type === "file" && typeof field.value === "object") {
  //           return {
  //             ...field,
  //             fileName: field.value.fileName,
  //             value: field.value.data,
  //             wordCount: field.value.wordCount,
  //           };
  //         }
  //         return field;
  //       }),
  //       total_price: calculatedTotalPrice,
  //       added_at: new Date().toISOString(),
  //     });
  //   }

  //   // Remove empty entries
  //   const filteredOrderDetails = existingOrderDetails.filter(
  //     (order) => order.fields && order.fields.length > 0
  //   );

  //   if (typeof window !== "undefined") {
  //     try {
  //       localStorage.setItem(
  //         "order_details",
  //         JSON.stringify(filteredOrderDetails)
  //       );
  //       console.log(
  //         "Updated order_details in localStorage:",
  //         filteredOrderDetails
  //       );
  //     } catch (error) {
  //       console.error("Error saving order details to localStorage:", error);
  //     }
  //   }
  // };
  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setTempCartChanges(null);
  // };

  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`services/${serviceId}`);
        setProductData(response.data);

        console.log("response.data", response.data);

        const savedData =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("order_details") || "[]")
            : [];
        const existingOrder = savedData.find(
          (order) => order.service_id === serviceId
        );

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
      } finally {
        setLoadingItemId(null);
      }
    };

    fetchData();
  }, [serviceId]);

  const renderConditionalDropdowns = (fieldName) => {
    if (!conditionalOptions[fieldName]) return null;

    return (
      <div className="conditional-options mt-3 pl-4 border-l-2 border-blue-200">
        {conditionalOptions[fieldName].options.map((condOption, condIndex) => (
          <div key={condIndex} className="mb-3 p-2 bg-blue-50 rounded-md">
            <label className="block text-sm mb-1">
              {condOption.text}
              {condOption.required && <span className="text-red-500">*</span>}
            </label>

            <select
              className="tf-field-input tf-input custom-input form-control form-control-sm w-100"
              id={`${fieldName}_conditional_${condIndex}`}
              {...register(`${fieldName}_conditional_${condIndex}`, {
                required: condOption.required,
              })}
              onChange={(e) =>
                handleConditionalDropdownChange(e, fieldName, condIndex)
              }
            >
              <option value="">Select an option</option>
              {(condOption.dropdown_options || "")
                .split(",")
                .map((opt, idx) => (
                  <option key={idx} value={opt.trim()}>
                    {opt.trim()}
                  </option>
                ))}
            </select>

            {errors[`${fieldName}_conditional_${condIndex}`] && (
              <p className="error mt-1 text-red-500">This field is required</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  const generateAvailableTimeSlots = (timeSlotConfig) => {
    if (!timeSlotConfig) {
      console.error("No time slot configuration provided");
      return [];
    }

    if (
      !Array.isArray(timeSlotConfig.time_slots) ||
      timeSlotConfig.time_slots.length === 0
    ) {
      console.error("No time slots array in configuration");
      return [];
    }

    const availableSlots = [];

    timeSlotConfig.time_slots.forEach((slotConfig) => {
      // Ensure we have all required properties with proper data types
      try {
        // Fix and standardize date formats
        const dateStart = ensureDateFormat(slotConfig.date_start);
        const dateEnd = ensureDateFormat(slotConfig.date_end);

        // Fix and standardize time formats
        const timeStart = ensureTimeFormat(slotConfig.time_start || "09:00");
        const timeEnd = ensureTimeFormat(slotConfig.time_end || "17:00");

        // Ensure interval is a number
        const intervalMinutes =
          typeof slotConfig.interval === "string"
            ? parseInt(slotConfig.interval, 10)
            : slotConfig.interval || 60;

        // Ensure excluded_days is an array
        const excludedDays = Array.isArray(slotConfig.excluded_days)
          ? slotConfig.excluded_days
          : typeof slotConfig.excluded_days === "string"
          ? JSON.parse(slotConfig.excluded_days)
          : [];

        // Ensure excluded_dates is an array
        const excludedDates = Array.isArray(slotConfig.excluded_dates)
          ? slotConfig.excluded_dates
          : typeof slotConfig.excluded_dates === "string"
          ? [slotConfig.excluded_dates]
          : [];

        // Parse dates
        const startDate = new Date(dateStart);
        const endDate = new Date(dateEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date range", { dateStart, dateEnd });
          return; // Skip invalid date ranges
        }

        // Clone the start date for iteration
        const currentDate = new Date(startDate);

        // Loop through each day in the range
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();

          // Skip if this day is in excluded days
          if (excludedDays.includes(dayOfWeek)) {
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
            continue;
          }

          // Format current date as YYYY-MM-DD
          const dateStr = formatDateToYYYYMMDD(currentDate);

          // Skip if this date is in excluded dates
          if (excludedDates.includes(dateStr)) {
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
            continue;
          }

          // Parse time ranges
          const [startHour, startMinute] = timeStart.split(":").map(Number);
          const [endHour, endMinute] = timeEnd.split(":").map(Number);

          // Set start time
          const timeStartObj = new Date(currentDate);
          timeStartObj.setHours(startHour, startMinute, 0, 0);

          // Set end time
          const timeEndObj = new Date(currentDate);
          timeEndObj.setHours(endHour, endMinute, 0, 0);

          // Generate time slots for this day
          let slotTime = new Date(timeStartObj);
          while (slotTime < timeEndObj) {
            const slotEndTime = new Date(slotTime);
            slotEndTime.setMinutes(slotEndTime.getMinutes() + intervalMinutes);

            // Format time for display
            const timeStr = formatTime(slotTime);
            const endTimeStr = formatTime(slotEndTime);

            // Check if this slot is in the future
            if (slotTime > new Date()) {
              availableSlots.push({
                date: dateStr,
                dayName: slotTime.toLocaleDateString([], { weekday: "long" }),
                startTime: timeStr,
                endTime: endTimeStr,
                timestamp: slotTime.getTime(),
                display: `${dateStr} (${slotTime.toLocaleDateString([], {
                  weekday: "short",
                })}) ${timeStr} - ${endTimeStr}`,
                maxBookings: slotConfig.max_bookings || 1,
              });
            }

            // Move to next slot time
            slotTime.setMinutes(slotTime.getMinutes() + intervalMinutes);
          }

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } catch (error) {
        console.error("Error processing time slot configuration:", error);
      }
    });

    // Sort by date and time
    return availableSlots.sort((a, b) => a.timestamp - b.timestamp);
  };
  const getCleanFieldName = (fieldName) => {
    return fieldName.split("_")[0];
  };

  const renderFieldComment = (field) => {
    const commentText =
      field.comment || field.comment1 || field.comment2 || field.description;

    if (!commentText) return null;

    return (
      <div className="field-comment mt-2 mb-3 text-sm text-gray-600 bg-gray-50  rounded-md border-l-3 border-blue-300 flex items-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0 mr-2 mt-0.5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="leading-relaxed" style={{ paddingLeft: "7px" }}>
          {commentText}
        </span>
      </div>
    );
  };
  return (
    <section style={{ maxWidth: "100vw", overflow: "clip" }}>
      <div
        className="tf-main-product section-image-zoom"
        style={{ maxWidth: "100vw", overflow: "clip" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="thumbs-slider">
                  <Slider1ZoomOuter firstImage={product?.icon} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h6>{product?.name}</h6>
                  </div>
                  <div className="tf-product-info-price">
                    <div className="price-on-sale">${product?.base_price}</div>
                    <div
                      className="badges-on-sale"
                      style={{
                        color: button3?.text_color,
                        backgroundColor: button3?.background_color,
                      }}
                    >
                      <span>{product?.discount}</span>% OFF
                    </div>
                  </div>
                  {product?.delivery_time && (
                    <div className="tf-delivery-time mt-3 bg-blue-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-orange-600 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <span className="!ml-1 font-medium text-orange-600">
                            Delivery Time:
                          </span>
                          <span className="!ml-2 text-orange-600">
                            {product.delivery_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity setQuantity={setQuantity} button2={button2} />
                  </div>
                  <form
                    tabIndex="-1"
                    role="dialog"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div>
                      <div>
                        <div className="modal-header border-0 py-3 text-white">
                          <div>
                            <h5 className="modal-title font-bold mb-0">
                              Fill Service Requirements
                            </h5>
                          </div>
                        </div>
                        <div>
                          <form onSubmit={handleSubmit(onSubmit)}>
                            {parsedFields?.map((field, index) => {
                              const displayName = getCleanFieldName(field.name);
                              return (
                                <div
                                  key={`${field.name}-${index}`}
                                  className="mb-4  bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <h5 className="text-gray-700 font-medium mb-2 border-b pb-2">
                                    {field?.title}
                                  </h5>

                                  {field.type === "text" && (
                                    <div className="form-group">
                                      <label
                                        className="text-sm font-medium text-gray-700 mb-1 block"
                                        htmlFor={`${field.name}}`}
                                      >
                                        {displayName}{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      {renderFieldComment(field)}
                                      <input
                                        className="w-full  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder=""
                                        type="text"
                                        id={`${field.name}}`}
                                        {...register(field.name)}
                                      />
                                    </div>
                                  )}

                                  {field.type === "timeslot" && (
                                    <div className="timeslot-selector mb-4">
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        {displayName}{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      {renderFieldComment(field)}

                                      {(() => {
                                        // Use the improved function
                                        const availableSlots =
                                          generateAvailableTimeSlots(field);

                                        if (availableSlots.length === 0) {
                                          return (
                                            <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-md mt-2 text-sm">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 inline mr-2"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                              No available time slots found.
                                              Please contact support.
                                            </div>
                                          );
                                        }

                                        // Group slots by date for better UI
                                        const slotsByDate = {};
                                        availableSlots.forEach((slot) => {
                                          if (!slotsByDate[slot.date]) {
                                            slotsByDate[slot.date] = [];
                                          }
                                          slotsByDate[slot.date].push(slot);
                                        });

                                        return (
                                          <div className="timeslot-container mt-2">
                                            {/* Date selector */}
                                            <select
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3 bg-white"
                                              onChange={(e) => {
                                                const dateValue =
                                                  e.target.value;
                                                if (dateValue) {
                                                  document
                                                    .getElementById(
                                                      `time-slots-${field.name}`
                                                    )
                                                    ?.scrollIntoView({
                                                      behavior: "smooth",
                                                    });
                                                }
                                              }}
                                            >
                                              <option value="">
                                                Select a date
                                              </option>
                                              {Object.keys(slotsByDate).map(
                                                (date) => (
                                                  <option
                                                    key={date}
                                                    value={date}
                                                  >
                                                    {new Date(
                                                      date
                                                    ).toLocaleDateString([], {
                                                      weekday: "long",
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                    })}
                                                  </option>
                                                )
                                              )}
                                            </select>

                                            {/* Time slots grid */}
                                            <div
                                              id={`time-slots-${field.name}`}
                                              className="time-slots-grid"
                                            >
                                              {Object.entries(slotsByDate).map(
                                                ([date, slots]) => (
                                                  <div
                                                    key={date}
                                                    className="date-slots mb-3"
                                                  >
                                                    <h6 className="mb-2 text-gray-600 font-medium">
                                                      {new Date(
                                                        date
                                                      ).toLocaleDateString([], {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                      })}
                                                    </h6>
                                                    <div className="slots-grid flex flex-wrap gap-2">
                                                      {slots.map(
                                                        (slot, idx) => {
                                                          const isSelected =
                                                            selectedTimeSlots[
                                                              field.name
                                                            ]?.timestamp ===
                                                            slot.timestamp;
                                                          return (
                                                            <button
                                                              key={idx}
                                                              type="button"
                                                              onClick={() =>
                                                                handleTimeSlotSelection(
                                                                  field.name,
                                                                  slot
                                                                )
                                                              }
                                                              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                                                isSelected
                                                                  ? "bg-blue-500 text-white"
                                                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                                              }`}
                                                            >
                                                              {slot.startTime} -{" "}
                                                              {slot.endTime}
                                                            </button>
                                                          );
                                                        }
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>

                                            {selectedTimeSlots[field.name] && (
                                              <div className="selected-slot bg-blue-50 border border-blue-200 rounded-md  mt-3">
                                                <div className="font-medium text-blue-700">
                                                  Selected time slot:
                                                </div>
                                                <div className="mt-1 text-blue-800">
                                                  {
                                                    selectedTimeSlots[
                                                      field.name
                                                    ].display
                                                  }
                                                </div>
                                                <button
                                                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline focus:outline-none"
                                                  type="button"
                                                  onClick={() =>
                                                    handleTimeSlotSelection(
                                                      field.name,
                                                      null
                                                    )
                                                  }
                                                >
                                                  Clear selection
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}

                                      {errors[field.name] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          Please select a time slot
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {/* Dropdown field */}
                                  {field.type === "dropdown" && (
                                    <div className="select-input">
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        {displayName}{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      {renderFieldComment(field)}
                                      <select
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                          blockingErrors[field.name]
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                        id={field.name}
                                        {...register(field.name)}
                                        onChange={(e) =>
                                          handleOptionWithValidation(
                                            e,
                                            field.name,
                                            "dropdown"
                                          )
                                        }
                                      >
                                        <option value="">
                                          Select an option
                                        </option>
                                        {Object.entries(field.options)?.map(
                                          ([key, option], idx) => (
                                            <option
                                              key={idx}
                                              value={JSON.stringify(option)}
                                              className={
                                                option.blocks_continuation
                                                  ? "text-red-500"
                                                  : ""
                                              }
                                            >
                                              {option.text}
                                              {option.blocks_continuation
                                                ? " (Not Eligible)"
                                                : ""}
                                              {option.extra_tax
                                                ? ` (Extra Tax: $${option.extra_tax})`
                                                : ""}
                                            </option>
                                          )
                                        )}
                                      </select>

                                      {blockingErrors[field.name] && (
                                        <div className="mt-2 text-sm p-2 bg-red-50 text-red-600 rounded-md">
                                          {blockingErrors[field.name].message}
                                        </div>
                                      )}

                                      {renderConditionalDropdowns(field.name)}
                                    </div>
                                  )}

                                  {/* Radio field */}
                                  {field.type === "radio" && (
                                    <div className="mb-2 radio-group">
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        {displayName}{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      {renderFieldComment(field)}
                                      <div className="space-y-2">
                                        {Object.entries(field.options)?.map(
                                          ([key, option], idx) => (
                                            <div
                                              key={idx}
                                              className={`flex items-center p-2 rounded-md ${
                                                option.blocks_continuation
                                                  ? "bg-red-50"
                                                  : "hover:bg-gray-100"
                                              }`}
                                            >
                                              <input
                                                type="radio"
                                                id={`${field.name}_${idx}`}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                name={field.name}
                                                value={JSON.stringify(option)}
                                                {...register(field.name)}
                                                onChange={(e) =>
                                                  handleOptionWithValidation(
                                                    e,
                                                    field.name,
                                                    "radio"
                                                  )
                                                }
                                              />
                                              <label
                                                htmlFor={`${field.name}_${idx}`}
                                                className={`ml-2 block text-sm ${
                                                  option.blocks_continuation
                                                    ? "text-red-700"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                {option.text}
                                                {option.blocks_continuation && (
                                                  <span className="!ml-1 text-red-600 font-medium">
                                                    (Not Eligible)
                                                  </span>
                                                )}
                                                {option.extra_tax && (
                                                  <span className="!ml-1 text-green-600">
                                                    (Extra Tax: $
                                                    {option.extra_tax})
                                                  </span>
                                                )}
                                              </label>
                                            </div>
                                          )
                                        )}
                                      </div>

                                      {blockingErrors[field.name] && (
                                        <div className="mt-2 text-sm p-2 bg-red-50 text-red-600 rounded-md">
                                          {blockingErrors[field.name].message}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {field.type === "checkbox" && (
                                    <div className="checkbox-group">
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        {displayName}{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      {renderFieldComment(field)}
                                      <div className="space-y-2">
                                        {field.options?.map((option, idx) => {
                                          const optionName =
                                            option.name || option;
                                          const optionValue =
                                            option.value || option;
                                          return (
                                            <div
                                              key={idx}
                                              className="flex items-center p-2 rounded-md hover:bg-gray-100"
                                            >
                                              <input
                                                type="checkbox"
                                                id={`${field.name}-${optionValue}`}
                                                name={field.name}
                                                value={optionValue}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                {...register(field.name)}
                                                defaultChecked={field.value?.includes(
                                                  optionValue
                                                )}
                                              />
                                              <p
                                                htmlFor={`${field.name}-${optionValue}`}
                                                className="block text-sm text-gray-700"
                                                style={{ paddingLeft: "10px" }}
                                              >
                                                {optionName}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* File field */}
                                  {field.type === "file" && (
                                    <div className="file-upload">
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        {displayName}{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      {renderFieldComment(field)}
                                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                                        {!files[field.name]?.name ? (
                                          <>
                                            <svg
                                              className="mx-auto h-12 w-12 text-gray-400"
                                              stroke="currentColor"
                                              fill="none"
                                              viewBox="0 0 48 48"
                                            >
                                              <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                            <div className="mt-1 flex justify-center">
                                              <label
                                                htmlFor={field.name}
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                              >
                                                <span>Upload a file</span>
                                                <input
                                                  type="file"
                                                  id={field.name}
                                                  className="sr-only"
                                                  {...register(field.name)}
                                                  onChange={(e) =>
                                                    handleFileChange(
                                                      e,
                                                      field.name,
                                                      field
                                                    )
                                                  }
                                                />
                                              </label>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                              PDF, DOC, DOCX, TXT up to 10MB
                                            </p>
                                          </>
                                        ) : (
                                          <div className="text-left">
                                            <div className="flex items-center text-sm">
                                              <svg
                                                className="flex-shrink-0 mr-2 h-5 w-5 text-green-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                              <span className="text-gray-900 font-medium truncate">
                                                {files[field.name]?.name}
                                              </span>
                                            </div>

                                            {field?.calculation_fee && (
                                              <div className="mt-3 bg-blue-50 p-2 rounded-md">
                                                <p className="text-sm text-blue-700">
                                                  Word Count:{" "}
                                                  {wordCounts[field.name] || 0}
                                                </p>
                                                {wordCounts[field.name] > 0 && (
                                                  <p className="text-sm font-medium text-blue-800 mt-1">
                                                    Estimated fee: $
                                                    {(
                                                      wordCounts[field.name] *
                                                      0.1
                                                    ).toFixed(2)}
                                                  </p>
                                                )}
                                              </div>
                                            )}

                                            <button
                                              onClick={() => {
                                                const fileInput =
                                                  document.getElementById(
                                                    field.name
                                                  );
                                                if (fileInput)
                                                  fileInput.value = "";
                                                const newFiles = { ...files };
                                                delete newFiles[field.name];
                                                setFiles(newFiles);
                                                const newWordCounts = {
                                                  ...wordCounts,
                                                };
                                                delete newWordCounts[
                                                  field.name
                                                ];
                                                setWordCounts(newWordCounts);
                                              }}
                                              type="button"
                                              className="mt-3 text-sm text-red-600 hover:text-red-800"
                                            >
                                              Remove file
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {errors[field.name] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      This field is required
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </form>
                        </div>
                        <div>
                          <button
                            type="submit"
                            className="tf-btn  w-full  justify-content-center fw-6 fs-16 animate-hover-btn"
                            style={{
                              color: button1?.text_color,
                              backgroundColor: "#000000",
                              cursor: "pointer",
                            }}
                          >
                            <span>Add to cart</span>
                            <span
                              className="tf-qty-price"
                              style={{ marginLeft: "10px" }}
                            >
                              ${(product?.base_price * quantity).toFixed(2)}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                  {console.log("errors", errors)}
                  {product?.files && product.files.length > 0 && (
                    <div className="files-section mt-4 mb-4">
                      <h5 className="text-lg font-semibold mb-2 text-gray-800">
                        Attached Files
                      </h5>
                      <div className="files-list space-y-2">
                        {product.files.map((file) => (
                          <div
                            key={file.id}
                            className="file-item mt-2 flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="file-info flex items-center space-x-3">
                              <FileDown className="text-gray-600" size={24} />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {file.file_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.file_size_bytes)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleDownload(file.id, file.filename)
                              }
                              rel="noopener noreferrer"
                              download
                              className="download-btn bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StickyItem />
      {/* <CartModal
        isOpen={isModalOpen}
        loadingItemId={loadingItemId}
        cartProducts={cartProducts}
        totalPrice={totalPrice}
      /> */}
    </section>
  );
}
