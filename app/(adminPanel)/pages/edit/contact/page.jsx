"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";
import { useRouter } from "next/navigation";

function EditPage() {
  const router = useRouter();
  const [pageContent, setPageContent] = useState({});
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [detailCounter, setDetailCounter] = useState(1);
  const [loading, setLoading] = useState(false);

  // For dynamic fields
  const [newDynamicFieldName, setNewDynamicFieldName] = useState("");
  const [newDynamicFieldType, setNewDynamicFieldType] = useState("text");
  const [newDynamicFieldPlaceholder, setNewDynamicFieldPlaceholder] = useState("");
  const [isDynamicRequired, setIsDynamicRequired] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contact_details: {},
      dynamic_fields: {},
    },
  });

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`pages/contact`);
      let content;

      if (response.data?.dynamic_content) {
        content = JSON.parse(response.data.dynamic_content);

        if (Array.isArray(content.dynamic_fields)) {
          content.dynamic_fields = {};
        }

        if (!content.dynamic_fields) {
          content.dynamic_fields = {};
        }
      } else {
        content = { contact_details: {}, dynamic_fields: {} };
      }

      setPageContent(content);

      const keys = Object.keys(content?.contact_details || {});
      const detailNumbers = keys
        .filter((key) => key.startsWith("detail_name_"))
        .map((key) => {
          const match = key.match(/detail_name_(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });

      const highestNumber =
        detailNumbers.length > 0 ? Math.max(...detailNumbers) : 0;
      setDetailCounter(highestNumber + 1);

      return content;
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to load contact page data");
      return { contact_details: {}, dynamic_fields: {} };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const content = await fetchPageData();
      initializeForm(content);
    };

    loadData();
  }, []);

  const initializeForm = (content) => {
    const formData = {
      contact_details: {},
      dynamic_fields: {},
    };

    if (content?.contact_details) {
      Object.entries(content.contact_details).forEach(([key, fieldData]) => {
        formData.contact_details[key] = {
          value: fieldData.value || "",
          type: fieldData.type || "text",
          required: Boolean(fieldData.required), 
        };
      });
    }

    if (content?.dynamic_fields && !Array.isArray(content.dynamic_fields)) {
      Object.entries(content.dynamic_fields).forEach(([key, fieldData]) => {
        formData.dynamic_fields[key] = {
          value: fieldData.value || "",
          type: fieldData.type || "text",
          required: Boolean(fieldData.required), 
          placeholder: fieldData.placeholder || "",
        };
      });
    }

    reset(formData);

    setPageContent(content);
  };

  const addNewField = () => {
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    const nameKey = `detail_name_${detailCounter}`;
    const valueKey = `detail_name_${detailCounter}_value`;

    const updatedContent = { ...pageContent };
    if (!updatedContent.contact_details) {
      updatedContent.contact_details = {};
    }

    updatedContent.contact_details[nameKey] = {
      type: "text",
      value: newFieldName,
      required: isRequired,
    };

    updatedContent.contact_details[valueKey] = {
      type: newFieldType,
      value: newFieldValue,
      required: isRequired,
    };

    setPageContent(updatedContent);

    setValue(`contact_details.${nameKey}.value`, newFieldName);
    setValue(`contact_details.${nameKey}.type`, "text");
    setValue(`contact_details.${nameKey}.required`, isRequired);

    setValue(`contact_details.${valueKey}.value`, newFieldValue);
    setValue(`contact_details.${valueKey}.type`, newFieldType);
    setValue(`contact_details.${valueKey}.required`, isRequired);

    setDetailCounter((prev) => prev + 1);

    setNewFieldName("");
    setNewFieldValue("");

    toast.success("New contact field added successfully");
  };

  const addNewDynamicField = () => {
    if (!newDynamicFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    const formattedKey = newDynamicFieldName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    if (
      pageContent?.dynamic_fields &&
      pageContent.dynamic_fields[formattedKey]
    ) {
      toast.error("A field with this name already exists");
      return;
    }

    const updatedContent = { ...pageContent };
    if (
      !updatedContent.dynamic_fields ||
      Array.isArray(updatedContent.dynamic_fields)
    ) {
      updatedContent.dynamic_fields = {};
    }

    updatedContent.dynamic_fields[formattedKey] = {
      type: newDynamicFieldType,
      value: "",
      required: isDynamicRequired,
      placeholder: newDynamicFieldPlaceholder || "", 
    };

    setPageContent(updatedContent);

    setValue(`dynamic_fields.${formattedKey}.value`, "");
    setValue(`dynamic_fields.${formattedKey}.type`, newDynamicFieldType);
    setValue(`dynamic_fields.${formattedKey}.required`, isDynamicRequired);
    setValue(
      `dynamic_fields.${formattedKey}.placeholder`,
      newDynamicFieldPlaceholder
    );

    setNewDynamicFieldName("");
    setNewDynamicFieldPlaceholder("");
    setNewDynamicFieldType("text");
    setIsDynamicRequired(false);

    toast.success("New dynamic field added successfully");
  };

  const removeField = (index) => {
    const updatedContent = { ...pageContent };

    const nameKey = `detail_name_${index}`;
    const valueKey = `detail_name_${index}_value`;

    // Remove both the name and value fields
    if (updatedContent.contact_details) {
      if (updatedContent.contact_details[nameKey]) {
        delete updatedContent.contact_details[nameKey];
      }
      if (updatedContent.contact_details[valueKey]) {
        delete updatedContent.contact_details[valueKey];
      }

      // Update state
      setPageContent(updatedContent);

      // Update form by resetting the form with updated content
      const updatedFormData = {
        contact_details: {},
        dynamic_fields: pageContent.dynamic_fields || {},
      };

      Object.entries(updatedContent.contact_details).forEach(
        ([key, fieldData]) => {
          if (key.startsWith("detail_name_")) {
            updatedFormData.contact_details[key] = {
              value: fieldData.value || "",
              type: fieldData.type || "text",
              required: fieldData.required || false,
            };
          }
        }
      );

      reset(updatedFormData);

      toast.success("Contact field removed successfully");
    }
  };

  const removeDynamicField = (key) => {
    const updatedContent = { ...pageContent };

    if (updatedContent.dynamic_fields && updatedContent.dynamic_fields[key]) {
      delete updatedContent.dynamic_fields[key];

      setPageContent(updatedContent);

      const updatedFormData = {
        contact_details: pageContent.contact_details || {},
        dynamic_fields: {},
      };

      Object.entries(updatedContent.dynamic_fields).forEach(
        ([fieldKey, fieldData]) => {
          updatedFormData.dynamic_fields[fieldKey] = {
            value: fieldData.value || "",
            type: fieldData.type || "text",
            required: fieldData.required || false,
            placeholder: fieldData.placeholder || "",
          };
        }
      );

      reset(updatedFormData);

      toast.success("Dynamic field removed successfully");
    }
  };

  const getDetailPairs = () => {
    if (!pageContent?.contact_details) return [];

    const details = [];
    const nameKeys = Object.keys(pageContent.contact_details).filter((key) =>
      key.match(/detail_name_\d+$/)
    ); 

    nameKeys.forEach((nameKey) => {
      const match = nameKey.match(/detail_name_(\d+)$/);
      if (match) {
        const index = match[1];
        const valueKey = `detail_name_${index}_value`;

        if (
          pageContent.contact_details[nameKey] &&
          pageContent.contact_details[valueKey]
        ) {
          details.push({
            index,
            nameKey,
            valueKey,
            name: pageContent.contact_details[nameKey],
            value: pageContent.contact_details[valueKey],
          });
        }
      }
    });

    return details;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const updatedContent = { ...pageContent };

      updatedContent.contact_details = {};
      if (data.contact_details) {
        Object.entries(data.contact_details).forEach(([key, fieldData]) => {
          updatedContent.contact_details[key] = {
            value: fieldData.value || "",
            type: fieldData.type || "text",
            required:
              fieldData.required === true || fieldData.required === "true",
          };
        });
      }

      if (
        !updatedContent.dynamic_fields ||
        Array.isArray(updatedContent.dynamic_fields)
      ) {
        updatedContent.dynamic_fields = {};
      }

      if (data.dynamic_fields) {
        Object.entries(data.dynamic_fields).forEach(([key, fieldData]) => {
          updatedContent.dynamic_fields[key] = {
            value: fieldData.value || "",
            type: fieldData.type || "text",
            required:
              fieldData.required === true || fieldData.required === "true",
            placeholder: fieldData.placeholder || "",
          };
        });
      }

      const payload = {
        dynamic_content: JSON.stringify(updatedContent),
        is_published: true,
      };

      console.log("Submitting payload:", payload);

      const response = await axiosInstance.post(
        "pages/by-title/contact",
        payload
      );

      if (response.status === 200) {
        toast.success("Contact page updated successfully!");

        const freshData = await fetchPageData();

        initializeForm(freshData);
      }
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update contact page");
    } finally {
      setLoading(false);
    }
  };

  const detailPairs = getDetailPairs();

  return (
    <div>
      <ToastContainer
        position="top-left"
        autoClose={2000}n
        hideProgressBar={false}
        closeOnClick
        draggable
      />
      <PageBreadcrumb pageTitle={`Contact page`} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* CONTACT DETAILS SECTION */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold">Contact Details</h2>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 w-full md:w-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="newFieldName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Field Label
                      </label>
                      <input
                        type="text"
                        id="newFieldName"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="e.g. Phone"
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newFieldValue"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Field Value
                      </label>
                      <input
                        type={newFieldType}
                        id="newFieldValue"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        placeholder="e.g. (123) 456-7890"
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newFieldType"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Field Type
                      </label>
                      <select
                        id="newFieldType"
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="url">URL</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addNewField}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                  >
                    Add Contact Field
                  </button>
                </div>
              </div>

              {detailPairs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {detailPairs.map((detail) => (
                    <div
                      key={detail.index}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeField(detail.index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove field"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={detail.nameKey}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Field Label
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id={detail.nameKey}
                              {...register(
                                `contact_details.${detail.nameKey}.value`
                              )}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                            <input
                              type="hidden"
                              {...register(
                                `contact_details.${detail.nameKey}.type`
                              )}
                              value="text"
                            />
                            <input
                              type="hidden"
                              {...register(
                                `contact_details.${detail.nameKey}.required`
                              )}
                              value={detail.name.required ? "true" : "false"}
                            />
                          </div>
                          {errors?.contact_details?.[detail.nameKey]?.value && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                errors.contact_details[detail.nameKey].value
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor={detail.valueKey}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Field Value
                          </label>
                          <div className="relative">
                            <input
                              type={detail.value.type || "text"}
                              id={detail.valueKey}
                              {...register(
                                `contact_details.${detail.valueKey}.value`
                              )}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                          </div>
                          {errors?.contact_details?.[detail.valueKey]
                            ?.value && (
                            <p className="mt-1 text-sm text-red-600">
                              {
                                errors.contact_details[detail.valueKey].value
                                  .message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  No contact details added yet. Use the form above to add your
                  first contact field.
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold">Dynamic Form Fields</h2>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 w-full md:w-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="newDynamicFieldName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Field Name
                      </label>
                      <input
                        type="text"
                        id="newDynamicFieldName"
                        value={newDynamicFieldName}
                        onChange={(e) => setNewDynamicFieldName(e.target.value)}
                        placeholder="e.g. Full Name"
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newDynamicFieldType"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Field Type
                      </label>
                      <select
                        id="newDynamicFieldType"
                        value={newDynamicFieldType}
                        onChange={(e) => setNewDynamicFieldType(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="number">Number</option>
                        <option value="url">URL</option>
                        <option value="textarea">Text Area</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="newDynamicFieldPlaceholder"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Placeholder
                      </label>
                      <input
                        type="text"
                        id="newDynamicFieldPlaceholder"
                        value={newDynamicFieldPlaceholder}
                        onChange={(e) =>
                          setNewDynamicFieldPlaceholder(e.target.value)
                        }
                        placeholder="e.g. Enter your full name"
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center h-full">
                        <input
                          type="checkbox"
                          id="isDynamicRequired"
                          checked={isDynamicRequired}
                          onChange={(e) =>
                            setIsDynamicRequired(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="isDynamicRequired"
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Required Field
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addNewDynamicField}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                  >
                    Add Form Field
                  </button>
                </div>
              </div>

              {pageContent?.dynamic_fields &&
              !Array.isArray(pageContent.dynamic_fields) &&
              Object.keys(pageContent.dynamic_fields).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(pageContent.dynamic_fields).map(
                    ([key, fieldData]) => (
                      <div
                        key={key}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => removeDynamicField(key)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove field"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                        <div className="mb-4">
                          <label
                            htmlFor={`dynamic-${key}`}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </label>

                          {fieldData.type === "textarea" ? (
                            <textarea
                              id={`dynamic-${key}`}
                              {...register(`dynamic_fields.${key}.value`)}
                              rows="3"
                              placeholder={fieldData.placeholder || ""}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            ></textarea>
                          ) : (
                            <input
                              type={fieldData.type || "text"}
                              id={`dynamic-${key}`}
                              {...register(`dynamic_fields.${key}.value`)}
                              placeholder={
                                fieldData.placeholder ||
                                `Enter ${key.replace(/_/g, " ")}`
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                          )}

                          <input
                            type="hidden"
                            {...register(`dynamic_fields.${key}.type`)}
                            value={fieldData.type || "text"}
                          />
                          <input
                            type="hidden"
                            {...register(`dynamic_fields.${key}.placeholder`)}
                            value={fieldData.placeholder || ""}
                          />
                          <input
                            type="hidden"
                            {...register(`dynamic_fields.${key}.required`)}
                            value={fieldData.required ? "true" : "false"}
                          />

                          {errors?.dynamic_fields?.[key]?.value && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.dynamic_fields[key].value.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`dynamic-required-${key}`}
                            checked={
                              watch(`dynamic_fields.${key}.required`) === true
                            }
                            onChange={(e) => {
                              setValue(
                                `dynamic_fields.${key}.required`,
                                e.target.checked
                              );
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`dynamic-required-${key}`}
                            className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Required Field
                          </label>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  No dynamic form fields added yet. Use the form above to add
                  form fields for your visitors.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center">
              <button
                type="submit"
                disabled={loading}
                className="text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              {loading && (
                <div className="ml-3 inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default withProtectedRoute(EditPage, ["Admin"]);
