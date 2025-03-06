"use client";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";

const ServiceFieldEditor = ({ service, onClose, onSave }) => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    discount: "",
    additional_fields: [],
    icon: null,
    files: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [existingFiles, setExistingFiles] = useState([]);
  const [fieldTypes] = useState([
    { value: "text", label: "Text Input" },
    { value: "dropdown", label: "Dropdown" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio Buttons" },
    { value: "file", label: "File Upload" },
    { value: "calculation_of_number", label: "Word Count Calculation" },
    { value: "physical_person", label: "Physical Person Section" },
    { value: "legal_person", label: "Legal Person Section" },
    { value: "director", label: "Director Section" },
  ]);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        base_price: service.base_price || "",
        category_id: service.category_id || "",
        discount: service.discount || "",
        status: service.status || "active",
        additional_fields: parseAdditionalFields(
          service.additional_fields || "[]"
        ),
        files: [],
      });

      if (service.files && Array.isArray(service.files)) {
        setExistingFiles(service.files);
      } else if (service.files && typeof service.files === "string") {
        try {
          const parsedFiles = JSON.parse(service.files);
          setExistingFiles(Array.isArray(parsedFiles) ? parsedFiles : []);
        } catch (e) {
          console.error("Error parsing service files:", e);
          setExistingFiles([]);
        }
      }
    }
  }, [service]);

  const parseAdditionalFields = (fields) => {
    if (typeof fields === "string") {
      try {
        return JSON.parse(fields);
      } catch (e) {
        console.error("Error parsing additional fields:", e);
        return [];
      }
    }
    return Array.isArray(fields) ? fields : [];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      setFormData({
        ...formData,
        files: [...formData.files, ...newFiles],
      });

      const newUploadedFiles = newFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));

      setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);

    const updatedUploadedFiles = [...uploadedFiles];

    if (updatedUploadedFiles[index]?.preview) {
      URL.revokeObjectURL(updatedUploadedFiles[index].preview);
    }

    updatedUploadedFiles.splice(index, 1);

    setFormData({
      ...formData,
      files: updatedFiles,
    });
    setUploadedFiles(updatedUploadedFiles);
  };

  const removeExistingFile = (index) => {
    const updatedExistingFiles = [...existingFiles];
    updatedExistingFiles.splice(index, 1);
    setExistingFiles(updatedExistingFiles);

  };

  const addField = () => {
    const newField = {
      name: "",
      type: "text",
      value: "",
      options: [],
    };

    setFormData({
      ...formData,
      additional_fields: [...formData.additional_fields, newField],
    });
  };

  const removeField = (index) => {
    const updatedFields = [...formData.additional_fields];
    updatedFields.splice(index, 1);

    setFormData({
      ...formData,
      additional_fields: updatedFields,
    });
  };

  const updateField = (index, fieldData) => {
    const updatedFields = [...formData.additional_fields];
    updatedFields[index] = {
      ...updatedFields[index],
      ...fieldData,
    };

    setFormData({
      ...formData,
      additional_fields: updatedFields,
    });
  };

  const addOption = (fieldIndex) => {
    const field = formData.additional_fields[fieldIndex];
    let updatedOptions;

    if (field.type === "dropdown" || field.type === "radio") {
      const newKey = `option_${Date.now()}`;
      updatedOptions = {
        ...field.options,
        [newKey]: {
          text: `Option ${Object.keys(field.options || {}).length + 1}`,
        },
      };
    } else {
      if (!Array.isArray(field.options)) {
        updatedOptions = [];
      } else {
        updatedOptions = [...field.options];
      }

      if (updatedOptions.length > 0 && typeof updatedOptions[0] === "object") {
        updatedOptions.push({
          name: `Option ${updatedOptions.length + 1}`,
          value: `option_${Date.now()}`,
          price: 0,
        });
      } else {
        updatedOptions.push(`Option ${updatedOptions.length + 1}`);
      }
    }

    updateField(fieldIndex, { options: updatedOptions });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const field = formData.additional_fields[fieldIndex];
    let updatedOptions;

    if (field.type === "dropdown" || field.type === "radio") {
      updatedOptions = { ...field.options };
      const keys = Object.keys(updatedOptions);
      delete updatedOptions[keys[optionIndex]];
    } else {
      updatedOptions = [...field.options];
      updatedOptions.splice(optionIndex, 1);
    }

    updateField(fieldIndex, { options: updatedOptions });
  };

  const updateOption = (fieldIndex, optionIndex, optionData) => {
    const field = formData.additional_fields[fieldIndex];
    let updatedOptions;

    if (field.type === "dropdown" || field.type === "radio") {
      updatedOptions = { ...field.options };
      const keys = Object.keys(updatedOptions);
      updatedOptions[keys[optionIndex]] = {
        ...updatedOptions[keys[optionIndex]],
        ...optionData,
      };
    } else {
      updatedOptions = [...field.options];

      if (typeof updatedOptions[optionIndex] === "object") {
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          ...optionData,
        };
      } else {
        updatedOptions[optionIndex] = optionData;
      }
    }

    updateField(fieldIndex, { options: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataPayload = new FormData();

      formDataPayload.append("name", formData.name);
      formDataPayload.append("description", formData.description || "");
      formDataPayload.append("base_price", formData.base_price);
      formDataPayload.append("category_id", formData.category_id);
      formDataPayload.append("discount", formData.discount || "0");
      formDataPayload.append("status", formData.status || "active");
      formDataPayload.append(
        "additional_fields",
        JSON.stringify(formData.additional_fields)
      );

      formDataPayload.append("existing_files", JSON.stringify(existingFiles));

      if (formData.icon) {
        formDataPayload.append("icon", formData.icon);
      }

      formData.files.forEach((file, index) => {
        formDataPayload.append(`files[${index}]`, file);
      });

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      let response;
      if (service?.id) {
        formDataPayload.append("_method", "PUT");
        response = await axiosInstance.post(
          `services/${service.id}`,
          formDataPayload,
          config
        );
        toast.success("Service updated successfully");
      } else {
        response = await axiosInstance.post(
          "services",
          formDataPayload,
          config
        );
        toast.success("Service created successfully");
      }

      if (onSave) onSave(response.data);
    } catch (error) {
      console.error("Error saving service:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((field) => {
          toast.error(`${field}: ${errors[field][0]}`);
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to save service");
      }
    }
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data.categories || response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  const renderFieldOptions = (field, fieldIndex) => {
    switch (field.type) {
      case "dropdown":
      case "radio":
        return (
          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options
              </h3>
              <button
                type="button"
                onClick={() => addOption(fieldIndex)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Option
              </button>
            </div>
            {field.options &&
              Object.keys(field.options).map((key, optionIndex) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 p-2 mb-2 bg-gray-50 rounded-md dark:bg-gray-700"
                >
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Option {optionIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOption(fieldIndex, optionIndex)}
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="block text-xs text-gray-700 dark:text-gray-300">
                        Text
                      </label>
                      <input
                        type="text"
                        value={field.options[key]?.text || ""}
                        onChange={(e) =>
                          updateOption(fieldIndex, optionIndex, {
                            text: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>

                    <div className="flex items-center mt-2">
                      <input
                        id={`has-extra-tax-${fieldIndex}-${optionIndex}`}
                        type="checkbox"
                        checked={field.options[key]?.extra_tax !== undefined}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateOption(fieldIndex, optionIndex, {
                              extra_tax: "0",
                            });
                          } else {
                            const updatedOption = { ...field.options[key] };
                            delete updatedOption.extra_tax;
                            updateOption(
                              fieldIndex,
                              optionIndex,
                              updatedOption
                            );
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
                      />
                      <label
                        htmlFor={`has-extra-tax-${fieldIndex}-${optionIndex}`}
                        className="ml-2 block text-xs text-gray-700 dark:text-gray-300"
                      >
                        Has Extra Tax Fee
                      </label>
                    </div>

                    {field.options[key]?.extra_tax !== undefined && (
                      <div className="mt-1">
                        <label className="block text-xs text-gray-700 dark:text-gray-300">
                          Extra Tax/Fee Amount
                        </label>
                        <input
                          type="number"
                          value={field.options[key]?.extra_tax || "0"}
                          onChange={(e) =>
                            updateOption(fieldIndex, optionIndex, {
                              extra_tax: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options
              </h3>
              <button
                type="button"
                onClick={() => addOption(fieldIndex)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Option
              </button>
            </div>
            {Array.isArray(field.options) &&
              field.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex flex-col gap-2 p-2 mb-2 bg-gray-50 rounded-md dark:bg-gray-700"
                >
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Option {optionIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOption(fieldIndex, optionIndex)}
                      className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  {typeof option === "object" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          value={option.name || ""}
                          onChange={(e) =>
                            updateOption(fieldIndex, optionIndex, {
                              name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 dark:text-gray-300">
                          Value
                        </label>
                        <input
                          type="text"
                          value={option.value || ""}
                          onChange={(e) =>
                            updateOption(fieldIndex, optionIndex, {
                              value: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 dark:text-gray-300">
                          Price
                        </label>
                        <input
                          type="number"
                          value={option.price || "0"}
                          onChange={(e) =>
                            updateOption(fieldIndex, optionIndex, {
                              price: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-gray-700 dark:text-gray-300">
                        Text
                      </label>
                      <input
                        type="text"
                        value={option || ""}
                        onChange={(e) =>
                          updateOption(fieldIndex, optionIndex, e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        );

      default:
        return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full shadow-xl overflow-hidden">
      <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {service?.id ? `Edit Service: ${service.name}` : "Create New Service"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base Price
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Icon
            </label>
            <input
              type="file"
              name="icon"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFormData({ ...formData, icon: e.target.files[0] });
                }
              }}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required={!service?.id}
            />
            {service?.icon && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Current icon:</p>
                <img
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL}${service.icon}`}
                  alt="Current icon"
                  className="h-16 w-16 object-cover mt-1 rounded"
                />
              </div>
            )}
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service Documentation Files
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
              ></button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {existingFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Files:
                </h4>
                <div className="space-y-2">
                  {existingFiles.map((file, index) => (
                    <div
                      key={`existing-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {file.name || `File ${index + 1}`}
                          </p>
                          {file.size && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {typeof file.size === "number"
                                ? formatFileSize(file.size)
                                : file.size}
                            </p>
                          )}
                          {file.path && (
                            <p className="text-xs text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">
                              <a
                                href={`${process.env.NEXT_PUBLIC_STORAGE_URL}${file.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View file
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Files to Upload:
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`new-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        {file.preview ? (
                          <div className="flex-shrink-0 w-10 h-10">
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="w-10 h-10 object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        )}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add(
                "bg-gray-50",
                "dark:bg-gray-700/30"
              );
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove(
                "bg-gray-50",
                "dark:bg-gray-700/30"
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove(
                "bg-gray-50",
                "dark:bg-gray-700/30"
              );

              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const newFiles = Array.from(e.dataTransfer.files);

                setFormData({
                  ...formData,
                  files: [...formData.files, ...newFiles],
                });

                const newUploadedFiles = newFiles.map((file) => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  file: file,
                  preview: file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : null,
                }));

                setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
              }
            }}
          >
            <div className="text-center py-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Drag and drop files here
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Browse Files
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Form Fields
              </h2>
              <button
                type="button"
                onClick={addField}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                + Add Field
              </button>
            </div>

            {formData.additional_fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400">
                  No fields added yet. Click "Add Field" to start.
                </p>
              </div>
            )}

            {formData.additional_fields.map((field, index) => (
              <div
                key={index}
                className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Field {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-600 hover:text-red-800 focus:outline-none dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.name || ""}
                      onChange={(e) =>
                        updateField(index, { name: e.target.value })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Field Type
                    </label>
                    <select
                      value={field.type || "text"}
                      onChange={(e) =>
                        updateField(index, {
                          type: e.target.value,
                          options:
                            e.target.value === "dropdown" ||
                            e.target.value === "radio"
                              ? {}
                              : e.target.value === "checkbox"
                              ? []
                              : undefined,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Value
                  </label>
                  <input
                    type="text"
                    value={field.value || ""}
                    onChange={(e) =>
                      updateField(index, { value: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comment/Help Text
                  </label>
                  <textarea
                    value={field.comment || ""}
                    onChange={(e) =>
                      updateField(index, { comment: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="2"
                  ></textarea>
                </div>

                <div className="mb-4 flex items-center">
                  <input
                    id={`required-field-${index}`}
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) =>
                      updateField(index, { required: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600"
                  />
                  <label
                    htmlFor={`required-field-${index}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Required field
                  </label>
                </div>

                {renderFieldOptions(field, index)}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Save Service
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceFieldEditor;
