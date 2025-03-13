"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "@/config/axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import mammoth from "mammoth";
import CartTable from "./CartTable";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionalOptions, setConditionalOptions] = useState({});
  const [blockingErrors, setBlockingErrors] = useState({});
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
  const [pageContent, setPageContent] = useState({});
  const [productData, setProductData] = useState(null);
  const [files, setFiles] = useState({});
  const [wordCounts, setWordCounts] = useState({});
  const [extraInputs, setExtraInputs] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(null);
  const [tempCartChanges, setTempCartChanges] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [extraTax, setExtraTax] = useState("");

  const calculateTotalPrice = (items) => {
    const subtotal = items.reduce((total, item) => {
      const itemTotal = parseFloat(item.total_price) || 0;
      return total + itemTotal;
    }, 0);
    setTotalPrice(subtotal);
  };

  const {
    removeItemFromCart,
    updateQuantity,
    fetchCartData: fetchCartData2,
  } = useContextElement();

  const fetchCartData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/carts");
      // console.log("test", response.data);
      setCartItems(response.data || []);
      calculateTotalPrice(response.data || []);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      toast.error("Failed to load cart items", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id) => {
    try {
      // Use the removeItemFromCart function from context
      await removeItemFromCart(id);

      // After successful removal, fetch updated cart data for your component
      await fetchCartData();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // const removeItem = async (id) => {
  //   try {
  //     await axiosInstance.delete(`/carts/${id}`);
  //     toast.success("Item removed from cart", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //     fetchCartData(); // Refresh cart data
  //   } catch (error) {
  //     console.error("Error removing item from cart:", error);
  //     toast.error("Failed to remove item from cart", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //   }
  // };
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

    return timeStr; // Return original if we can't parse it
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
  const generateAvailableTimeSlots = (timeSlotConfig) => {
    // Enhanced validation and error handling
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

    return availableSlots.sort((a, b) => a.timestamp - b.timestamp);
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
  const handleOptionWithValidation = (e, fieldName, fieldType) => {
    try {
      let selectedOption = null;

      console.log("fieldName", e.target.value);

      try {
        selectedOption = JSON.parse(e.target.value);
      } catch (error) {
        console.error("Error parsing option value:", error);
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

      setExtraTax(e.target.value);

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

        const serviceOrder = getSavedData().find(
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

  useEffect(() => {
    const getPageContent = async () => {
      try {
        const response = await axiosInstance.get("pages/view-cart");
        setPageContent(JSON.parse(response.data?.dynamic_content || "{}"));
      } catch (error) {
        console.error("Error fetching page content:", error);
      }
    };
    getPageContent();
    fetchCartData();
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

  const setQuantity = async (id, quantity) => {
    if (quantity >= 1) {
      try {
        console.log(`Updating cart ${id} with quantity: ${quantity}`);
        const response = await axiosInstance.patch(`/carts/${id}`, {
          quantity: quantity,
        });
        console.log("Update response:", response.data);
        fetchCartData(); // Refresh cart data
      } catch (error) {
        console.error("Full error details:", error.response?.data || error);
        toast.error("Failed to update quantity", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleOpenModal = async (cartItem) => {
    setLoadingItemId(cartItem.id);
    setIsModalOpen(true);
    setIsInitialLoad(true);

    // Reset form first
    reset(
      {},
      {
        keepValues: false,
        keepDefaultValues: false,
        keepErrors: false,
      }
    );

    try {
      // Use cart item directly without additional API call
      setProductData({
        ...cartItem,
        id: cartItem.service_id,
        cartId: cartItem.id,
      });

      console.log("cartItem", cartItem);

      // Parse the fields JSON string from cart item
      let parsedFields = [];
      if (cartItem.fields) {
        try {
          parsedFields =
            typeof cartItem.fields === "string"
              ? JSON.parse(cartItem.fields)
              : cartItem.fields;
        } catch (error) {
          console.error("Error parsing fields data:", error);
          parsedFields = [];
        }
      }

      if (parsedFields.length > 0) {
        // No need to fetch service options since they should already be stored with each field
        console.log("Parsed fields with options:", parsedFields);

        const defaultValues = {};
        const newFiles = {};

        parsedFields.forEach((field) => {
          // Handle file fields
          if (field.type === "file" && field.value) {
            defaultValues[field.name] = field.value;
            newFiles[field.name] = {
              name: field.value.fileName || field.fileName || "uploaded-file",
              value: field.value.data || field.value,
            };

            // Restore word count if available
            if (field.value.wordCount !== undefined) {
              setWordCounts((prev) => ({
                ...prev,
                [field.name]: field.value.wordCount,
              }));
            }
          } else if (field.type === "dropdown" && field.value) {
            defaultValues[field.name] = field.value;

            try {
              const selectedValue = JSON.parse(field.value);
              if (selectedValue && selectedValue.has_conditional_options) {
                const conditionalOpts = selectedValue.conditional_options || [];

                setConditionalOptions((prev) => ({
                  ...prev,
                  [field.name]: {
                    parentOption: selectedValue.text,
                    options: conditionalOpts,
                  },
                }));

                // Set values for conditional fields
                if (field.conditional_values) {
                  Object.entries(field.conditional_values).forEach(
                    ([optionText, value], index) => {
                      defaultValues[`${field.name}_conditional_${index}`] =
                        value;
                    }
                  );
                }
              }
            } catch (err) {
              console.error("Error parsing dropdown value:", err);
            }
          }
          // Handle timeslot fields
          else if (field.type === "timeslot" && field.value) {
            defaultValues[field.name] = field.value;

            try {
              // Create a minimal slot object for the UI
              const datePart = field.value.split(" ")[0];
              setSelectedTimeSlots((prev) => ({
                ...prev,
                [field.name]: {
                  display: field.value,
                  timestamp: new Date(datePart).getTime(),
                },
              }));
            } catch (error) {
              console.error(
                `Error processing time slot for ${field.name}:`,
                error
              );
            }
          }
          // Handle regular form fields
          else {
            defaultValues[field.name] = field.value;
          }
        });

        // Set files
        if (Object.keys(newFiles).length > 0) {
          setFiles(newFiles);
        }

        // Set form values with a small delay to ensure fields are rendered
        setTimeout(() => {
          Object.entries(defaultValues).forEach(([key, value]) => {
            setValue(key, value, {
              shouldValidate: true,
              shouldDirty: true,
            });
          });
        }, 100);
      }
    } catch (err) {
      console.error("Error processing cart item:", err);
      toast.error("Failed to load service details", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingItemId(null);
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

  const parsedFields = useMemo(() => {
    let fields = [];

    if (productData?.fields) {
      // If we have fields from a cart item, they should already have options
      // No need to transform them as much
      fields = makeFieldsUnique(
        typeof productData.fields === "string"
          ? JSON.parse(productData.fields)
          : productData.fields,
        productData.id
      );
    } else if (productData?.additional_fields) {
      // If we have fields from the service definition
      fields = makeFieldsUnique(
        typeof productData.additional_fields === "string"
          ? JSON.parse(productData.additional_fields)
          : productData.additional_fields,
        productData.id
      );
    }

    return fields;
  }, [productData]);

  useEffect(() => {
    if (!isModalOpen) {
      setTempCartChanges(null);
    }
  }, [isModalOpen]);

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
  // Function to calculate total price including extra taxes from form data
  const calculateTotalWithExtraTax = (
    formData,
    basePrice,
    quantity,
    previousExtraTaxFields = []
  ) => {
    let totalExtraTax = 0;
    let foundExtraTaxFields = [];

    // Go through each field in the form data
    Object.entries(formData).forEach(([fieldName, value]) => {
      // Check if this might be a dropdown value with extra tax
      if (typeof value === "string" && value.includes('"extra_tax"')) {
        try {
          // Try to parse the JSON string
          const parsedValue = JSON.parse(value);

          // If it has extra_tax, add it to our total
          if (parsedValue && parsedValue.extra_tax) {
            totalExtraTax += parseFloat(parsedValue.extra_tax);
            foundExtraTaxFields.push({
              name: fieldName,
              value: parsedValue.text,
              extra_tax: parsedValue.extra_tax,
            });
          }
        } catch (error) {
          // If parsing fails, just continue
          console.error("Error parsing dropdown value:", error);
        }
      }
    });

    // Calculate base total (always includes the base price)
    const baseTotal = parseFloat(basePrice) * quantity;

    // Add extra tax only if there are any
    const total = baseTotal + totalExtraTax * quantity;

    return {
      totalPrice: total.toFixed(2),
      extraTaxTotal: totalExtraTax.toFixed(2),
      extraTaxFields: foundExtraTaxFields,
    };
  };
  const handleDropdownChange = (e, fieldName) => {
    try {
      const selectedValue = JSON.parse(e.target.value);
      const serviceId = productData?.id;

      // Update form value first
      setValue(fieldName, e.target.value);

      // Get current cart item
      const currentItem = cartItems.find((item) => item.id === serviceId);

      // Initialize or get existing extra tax fields
      const currentExtraTaxFields =
        tempCartChanges?.[serviceId] || currentItem?.extraTaxFields || {};

      // Check if this field already had an extra tax
      const hadExtraTax = currentExtraTaxFields[fieldName] !== undefined;
      const oldExtraTaxAmount = hadExtraTax
        ? parseFloat(currentExtraTaxFields[fieldName].extra_tax) || 0
        : 0;

      // Check if new selection has extra tax
      const hasExtraTax =
        selectedValue &&
        typeof selectedValue === "object" &&
        "extra_tax" in selectedValue;

      // Update tempCartChanges based on whether new selection has extra tax
      if (hasExtraTax) {
        // Add or update extra tax for this field
        setTempCartChanges((prev) => {
          const updatedExtraTaxFields = {
            ...(prev?.[serviceId] || {}),
            [fieldName]: {
              name: fieldName,
              value: selectedValue.text,
              extra_tax: selectedValue.extra_tax,
              displayName: getCleanFieldName(fieldName),
            },
          };

          return {
            ...prev,
            [serviceId]: updatedExtraTaxFields,
          };
        });

        console.log(
          `Added extra tax for ${fieldName}: ${selectedValue.extra_tax}`
        );
      } else if (hadExtraTax) {
        // Remove extra tax for this field if it previously had one
        setTempCartChanges((prev) => {
          if (!prev?.[serviceId]) return prev;

          const updatedFields = { ...prev[serviceId] };
          delete updatedFields[fieldName];

          return {
            ...prev,
            [serviceId]: updatedFields,
          };
        });

        console.log(
          `Removed extra tax for ${fieldName} (was: ${oldExtraTaxAmount})`
        );
      }
    } catch (error) {
      console.error("Error in handleDropdownChange:", error);
      // Just update the form value if parsing fails
      setValue(fieldName, e.target.value);
    }
  };
  const onSubmit = async (data) => {
    try {
      // Check for blocking errors
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

      // Get the service ID and base info
      const serviceId = productData?.service_id || productData?.id;
      const basePrice = parseFloat(productData.service.base_price) || 0;
      const quantity = parseInt(productData.quantity || 1, 10);

      console.log("productData", productData);

      // Process all form fields
      const formFields = await Promise.all(
        parsedFields.map(async (field) => {
          let value = data[field.name];

          // Handle file fields
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
              const existingFilename = getValues(field.name);
              if (existingFilename) {
                value = {
                  fileName: existingFilename,
                  wordCount: wordCounts[field.name] || 0,
                };
              } else {
                value = null;
              }
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

          // Handle timeslot fields
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
      const filteredFields = formFields.filter(
        (field) =>
          (field.type === "file" && field.value) ||
          (typeof field.value === "string" && field.value.trim() !== "") ||
          (Array.isArray(field.value) && field.value.length > 0)
      );

      // Extract extra tax fields
      const extraTaxFields = [];

      // Examine all form fields for extra tax
      Object.entries(data).forEach(([fieldName, value]) => {
        // Check if this is a dropdown with extra tax
        if (typeof value === "string" && value.includes('"extra_tax"')) {
          try {
            const parsedValue = JSON.parse(value);
            if (parsedValue && parsedValue.extra_tax) {
              extraTaxFields.push({
                name: fieldName,
                value: parsedValue.text,
                extra_tax: parsedValue.extra_tax,
              });
            }
          } catch (error) {
            console.error(
              `Error parsing field ${fieldName} for extra tax:`,
              error
            );
          }
        }
      });

      // Calculate total price
      // IMPORTANT: Always include the base price
      let totalPrice = basePrice * quantity;

      // Add extra taxes if any
      if (extraTaxFields.length > 0) {
        const extraTaxTotal = extraTaxFields.reduce(
          (sum, field) => sum + parseFloat(field.extra_tax || 0),
          0
        );
        totalPrice += extraTaxTotal * quantity;
      }

      // Add word count fee if applicable
      let wordCountFee = 0;
      if (Object.keys(wordCounts).length > 0) {
        wordCountFee = Object.values(wordCounts).reduce(
          (sum, count) => sum + Number((count * 0.1).toFixed(2)),
          0
        );

        // Add to extra tax fields
        if (wordCountFee > 0) {
          extraTaxFields.push({
            name: "word_count_fee",
            value: "Word Count Fee",
            extra_tax: wordCountFee.toString(),
          });

          // Add to total price
          totalPrice += wordCountFee * quantity;
        }
      }

      // Prepare data for API
      const cartData = {
        service_id: serviceId,
        fields: filteredFields,
        extra_tax_fields: extraTaxFields,
        total_price: totalPrice,
        quantity: quantity,
      };

      console.log("Submitting cart data:", cartData);

      try {
        let response;
        if (productData.cartId) {
          // Update existing cart item
          response = await axiosInstance.patch(
            `/carts/${productData.cartId}`,
            cartData
          );
        } else {
          response = await axiosInstance.post("/carts", cartData);
        }

        if (response.data.success) {
          toast.success("Service details saved successfully", {
            position: "top-right",
            autoClose: 3000,
          });

          setIsModalOpen(false);

          await fetchCartData();
          await fetchCartData2();

          reset();
        } else {
          throw new Error(response.data.message || "Failed to update cart");
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        toast.error(error.message || "Failed to update cart", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("An error occurred while processing your form", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };
  const getCleanFieldName = (fieldName) => {
    return fieldName.split("_")[0];
  };
  const fetchCartDataForService = async (serviceId) => {
    try {
      const response = await axiosInstance.get(`/carts/${serviceId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(
        `Error fetching cart data for service ${serviceId}:`,
        error
      );
      return null;
    }
  };
  const getSavedData = async () => {
    try {
      const response = await axiosInstance.get("/carts");
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cart data:", error);
      return [];
    }
  };

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
  const { user } = useAuth();

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
              const currentProduct = cartItems.find((p) => p.id === serviceId);
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

  const [totalExtraCategoryPrice, setTotalExtraCategoryPrice] = useState(() => {
    const savedPrice =
      typeof window !== "undefined"
        ? localStorage.getItem("total_extra_category_price")
        : null;
    const parsedPrice = parseFloat(savedPrice);
    return !isNaN(parsedPrice) ? parsedPrice : 0;
  });

  useEffect(() => {
    const priceToStore = !isNaN(totalExtraCategoryPrice)
      ? totalExtraCategoryPrice
      : 0;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "total_extra_category_price",
          priceToStore.toString()
        );
      } catch (error) {
        console.error(
          "Error saving total extra category price to localStorage:",
          error
        );
      }
    }
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
        const currentProduct = cartItems.find((p) => p.id === serviceId);
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
          const currentProduct = cartItems.find((p) => p.id === serviceId);
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
    const subtotal = cartItems.reduce((accumulator, elm) => {
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
  }, []);

  const renderFieldComment = (field) => {
    const commentText =
      field.comment || field.comment1 || field.comment2 || field.description;

    if (!commentText) return null;

    return (
      <div className="field-comment mt-2 mb-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border-l-3 border-blue-300 flex items-start">
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
              {cartItems.length !== 0 && (
                <CartTable
                  cartItems={cartItems}
                  removeItem={removeItem}
                  setQuantity={setQuantity}
                  handleOpenModal={handleOpenModal}
                  loadingItemId={loadingItemId}
                  tempCartChanges={tempCartChanges}
                  savedData={fetchCartDataForService}
                  getCleanFieldName={getCleanFieldName}
                  getProductTotal={getProductTotal}
                  updateQuantity={updateQuantity}
                  fetchCartData={fetchCartData}
                  fetchCartData2={fetchCartData2}
                />
              )}

              <form
                className={`modal fade ${
                  isModalOpen && !loadingItemId ? "show" : ""
                }`}
                tabIndex="-1"
                role="dialog"
                style={{
                  display: isModalOpen ? "block" : "none",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg rounded-lg overflow-hidden">
                    <div
                      className="modal-header border-0 py-3 text-white"
                      style={{
                        background: `linear-gradient(to right, #5ca595, #6db8a8)`,
                      }}
                    >
                      <div>
                        <h5 className="modal-title font-bold mb-0">
                          Fill Service Requirements
                        </h5>
                        <p className="font-bold text-black text-sm mb-0 mt-1 opacity-90">
                          {productData?.name}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        type="button"
                        className="btn-close btn-close-white"
                        aria-label="Close"
                      ></button>
                    </div>
                    {/* Modal Body */}
                    <div className="modal-body p-4">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        {parsedFields?.map((field, index) => {
                          const displayName = getCleanFieldName(field.name);
                          console.log("parsedFields", parsedFields);
                          return (
                            <div
                              key={`${field.name}-${index}`}
                              className="mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <h5 className="text-gray-700 font-medium mb-2 border-b pb-2">
                                {field?.title}
                              </h5>

                              {/* Text field */}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                          No available time slots found. Please
                                          contact support.
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
                                            const dateValue = e.target.value;
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
                                              <option key={date} value={date}>
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
                                                  {slots.map((slot, idx) => {
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
                                                  })}
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>

                                        {selectedTimeSlots[field.name] && (
                                          <div className="selected-slot bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                                            <div className="font-medium text-blue-700">
                                              Selected time slot:
                                            </div>
                                            <div className="mt-1 text-blue-800">
                                              {
                                                selectedTimeSlots[field.name]
                                                  .display
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
                                    <option value="">Select an option</option>
                                    {field.options &&
                                    typeof field.options === "object" &&
                                    Object.keys(field.options).length > 0 ? (
                                      Object.entries(field.options).map(
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
                                      )
                                    ) : (
                                      <option value="">
                                        No options available
                                      </option>
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
                                              <span className="ml-1 text-red-600 font-medium">
                                                (Not Eligible)
                                              </span>
                                            )}
                                            {option.extra_tax && (
                                              <span className="ml-1 text-green-600">
                                                (Extra Tax: ${option.extra_tax})
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
                                      const optionName = option.name || option;
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
                                                  wordCounts[field.name] * 0.1
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
                                            if (fileInput) fileInput.value = "";
                                            const newFiles = { ...files };
                                            delete newFiles[field.name];
                                            setFiles(newFiles);
                                            const newWordCounts = {
                                              ...wordCounts,
                                            };
                                            delete newWordCounts[field.name];
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
                    <div className="modal-footer bg-gray-50 border-t border-gray-200 p-4 flex justify-end space-x-3">
                      <button
                        onClick={handleCloseModal}
                        type="button"
                        className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: `linear-gradient(to right, #5ca595, #6db8a8)`,
                        }}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Confirm
                      </button>
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
              {!cartItems.length && (
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
                  <span className="total-value">
                    ${totalPrice.toFixed(2)} USD
                  </span>
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
                    <Link
                      href={"checkout"}
                      className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                      style={{
                        width: "fit-content",
                        backgroundColor:
                          pageContent.buttons[1].background_color,
                        color: pageContent.buttons[1].text_color,
                      }}
                    >
                      {pageContent.buttons[1].text}
                    </Link>
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
