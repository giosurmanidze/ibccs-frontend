"use client";

import { useState, useEffect } from "react";
import { getPage, updatePage } from "@/services/pageService";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";

function HeaderLayout({ pageId }) {
  const [pageContent, setPageContent] = useState({});
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/header");
      setPageContent(JSON.parse(response.data?.dynamic_content));
      const dynamicContent = response.data.dynamic_content
        ? JSON.parse(response.data.dynamic_content)
        : null;

      if (dynamicContent && dynamicContent.header?.header_logo?.value) {
        setImageUrl(dynamicContent.header.header_logo.value);
      }
    };
    getPageContent();
  }, []);

  const [loading, setLoading] = useState(false);
  const isEditMode = !!pageId;

  useEffect(() => {
    if (isEditMode) {
      fetchPageData();
    }
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const page = await getPage(pageId);
      setFormData({
        title: page.title,
        content: page.content,
        meta_data: page.meta_data || { description: "", keywords: "" },
        is_published: page.is_published,
      });
    } catch (error) {
      toast.error("Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      header: {},
    },
  });

  useEffect(() => {
    if (pageContent?.header) {
      Object.entries(pageContent.header).forEach(([key, fieldData]) => {
        setValue(`header.${key}.value`, fieldData.value);
        setValue(`header.${key}.type`, fieldData.type);
      });
    }
  }, [pageContent, setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    const headerData = { ...data.header };

    Object.entries(headerData).forEach(([key, fieldData]) => {
      if (fieldData.value instanceof File) {
        formData.append(`files[${key}]`, fieldData.value);

        headerData[key].value = `[file:${key}]`;
      }
    });

    const dynamicContentData = {
      header: headerData,
      buttons: data.buttons,
      bottom_header_buttons: data.bottom_header_buttons,
    };

    formData.append("dynamic_content", JSON.stringify(dynamicContentData));
    formData.append("is_published", true);

    try {
      const response = await axiosInstance.post(
        `pages/by-title/header`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Layout updated successfully!");
      }
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update layout");
    }
  };
  return (
    <div>
    <ToastContainer
      position="top-left"
      autoClose={2000}
      hideProgressBar={false}
      closeOnClick
      draggable
    />
    <PageBreadcrumb pageTitle="Header layout" />
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header Style Options */}
        <h3 className="text-lg font-medium mb-4">Header Style</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(pageContent?.header || {}).map(
            ([key, fieldData]) => {
              if (key === "header_logo") {
                return null;
              }
              return (
                <div key={key} className="mb-4">
                  <label
                    htmlFor={key}
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
  
                  {fieldData.type === "color" ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id={`${key}-picker`}
                        value={
                          watch(`header.${key}.value`) || fieldData.value
                        }
                        onChange={(e) => {
                          setValue(`header.${key}.value`, e.target.value);
                        }}
                        className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                      />
                      <input
                        type="text"
                        id={key}
                        value={
                          watch(`header.${key}.value`) || fieldData.value
                        }
                        onChange={(e) => {
                          setValue(`header.${key}.value`, e.target.value);
                        }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                  ) : fieldData.type === "text" ? (
                    <input
                      type="text"
                      id={key}
                      {...register(`header.${key}.value`, {
                        required: "This field is required",
                      })}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  ) : null}
                  {errors?.header?.[key]?.value && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.header[key].value.message}
                    </p>
                  )}
                </div>
              );
            }
          )}
        </div>
  
        {/* Logo Upload Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Header Logo</h3>
          <div className="flex flex-col">
            <div className="grid gap-6">
              <div className="flex items-center">
                <label>
                  <input
                    type="file"
                    hidden
                    id="header_logo"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setValue(`header.header_logo.value`, file);
  
                        if (file.type.includes("image")) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setValue(
                              `header.header_logo.preview`,
                              event.target.result
                            );
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                  <div className="flex h-10 px-4 bg-indigo-600 justify-center rounded-lg shadow text-white text-sm font-semibold items-center cursor-pointer hover:bg-indigo-700 transition-colors focus:outline-none">
                    Choose Logo Image
                  </div>
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 mt-2">
                {imageUrl && (
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Logo</h4>
                    <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Current Logo"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
  
                {watch(`header.header_logo.preview`) && (
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Logo Preview</h4>
                    <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <img
                        src={watch(`header.header_logo.preview`)}
                        alt="New Logo Preview"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {!imageUrl && !watch(`header.header_logo.preview`) && (
                  <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <p className="text-center text-gray-500">
                      No logo uploaded. Select an image to preview.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {errors?.header?.header_logo?.value && (
            <p className="mt-1 text-sm text-red-600">
              {errors.header.header_logo.value.message}
            </p>
          )}
        </div>
  
        {/* Header Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Header Buttons</h3>
  
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            {(pageContent?.buttons || []).map((button, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex-1 min-w-[280px]">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Button Text
                    </label>
                    <input
                      type="text"
                      {...register(`buttons.${index}.text`, {
                        required: "Button text is required",
                      })}
                      defaultValue={button.text}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                    />
                  </div>
  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Button URL
                    </label>
                    <input
                      type="text"
                      {...register(`buttons.${index}.url`, {
                        required: "Button URL is required",
                      })}
                      defaultValue={button.url}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                    />
                  </div>
  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Button Name
                    </label>
                    <input
                      type="text"
                      {...register(`buttons.${index}.name`, {
                        required: "Button name is required",
                      })}
                      defaultValue={button.name}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                    />
                  </div>
  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id={`button-color-${index}`}
                        {...register(`buttons.${index}.text_color`)}
                        defaultValue={button.text_color}
                        className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                      />
                      <input
                        type="text"
                        value={
                          watch(`buttons.${index}.text_color`) ||
                          button.text_color
                        }
                        onChange={(e) => {
                          setValue(
                            `buttons.${index}.text_color`,
                            e.target.value
                          );
                        }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Bottom Header Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Bottom Header Buttons</h3>
  
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            {(pageContent?.bottom_header_buttons || []).map(
              (button, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex-1 min-w-[280px]"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Button Text
                      </label>
                      <input
                        type="text"
                        {...register(
                          `bottom_header_buttons.${index}.text`,
                          {
                            required: "Button text is required",
                          }
                        )}
                        defaultValue={button.text}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                      />
                    </div>
  
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Button URL
                      </label>
                      <input
                        type="text"
                        {...register(`bottom_header_buttons.${index}.url`, {
                          required: "Button URL is required",
                        })}
                        defaultValue={button.url}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                      />
                    </div>
  
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Button Name
                      </label>
                      <input
                        type="text"
                        {...register(
                          `bottom_header_buttons.${index}.name`,
                          {
                            required: "Button name is required",
                          }
                        )}
                        defaultValue={button.name}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                      />
                    </div>
  
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Text Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id={`bottom-button-color-${index}`}
                          {...register(
                            `bottom_header_buttons.${index}.text_color`
                          )}
                          defaultValue={button.text_color}
                          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                        />
                        <input
                          type="text"
                          value={
                            watch(
                              `bottom_header_buttons.${index}.text_color`
                            ) || button.text_color
                          }
                          onChange={(e) => {
                            setValue(
                              `bottom_header_buttons.${index}.text_color`,
                              e.target.value
                            );
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
  
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}

export default withProtectedRoute(HeaderLayout, ["Admin"]);
