"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";

function SidebarLayout() {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/header");
      setPageContent(JSON.parse(response.data?.dynamic_content));
    };
    getPageContent();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({});

  useEffect(() => {
    if (pageContent?.sidebar_buttons) {
      Object.entries(pageContent.sidebar_buttons).forEach(
        ([key, fieldData]) => {
          setValue(`sidebar_buttons.${key}.value`, fieldData.value);
          setValue(`sidebar_buttons.${key}.type`, fieldData.type);
        }
      );
    }
    if (pageContent?.sidebar_content) {
      Object.entries(pageContent.sidebar_content).forEach(
        ([key, fieldData]) => {
          setValue(`sidebar_content.${key}.value`, fieldData.value);
          setValue(`sidebar_content.${key}.type`, fieldData.type);
        }
      );
    }
  }, [pageContent, setValue]);

  const onSubmit = async (data) => {
    try {
      const currentContent = pageContent
        ? JSON.parse(JSON.stringify(pageContent))
        : {};

      const dynamicContentData = {
        ...currentContent,
        sidebar_buttons: data.sidebar_buttons,
        sidebar_content: data.sidebar_content,
      };

      const payload = {
        dynamic_content: JSON.stringify(dynamicContentData),
        is_published: true,
      };

      const response = await axiosInstance.post(
        "pages/by-title/header",
        payload
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
      <PageBreadcrumb pageTitle="Sidebar layout" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              {(pageContent?.sidebar_buttons || []).map((button, index) => (
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
                        {...register(`sidebar_buttons.${index}.text`, {
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
                        {...register(`sidebar_buttons.${index}.url`, {
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
                        {...register(`sidebar_buttons.${index}.name`, {
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
                          {...register(`sidebar_buttons.${index}.text_color`)}
                          defaultValue={button.text_color}
                          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                        />
                        <input
                          type="text"
                          value={
                            watch(`sidebar_buttons.${index}.text_color`) ||
                            button.text_color
                          }
                          onChange={(e) => {
                            setValue(
                              `sidebar_buttons.${index}.text_color`,
                              e.target.value
                            );
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Background Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id={`button-color-${index}`}
                          {...register(
                            `sidebar_buttons.${index}.background_color`
                          )}
                          defaultValue={button.background_color}
                          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                        />
                        <input
                          type="text"
                          value={
                            watch(
                              `sidebar_buttons.${index}.background_color`
                            ) || button.background_color
                          }
                          onChange={(e) => {
                            setValue(
                              `sidebar_buttons.${index}.background_color`,
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
          </div>{" "}
          <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(pageContent?.sidebar_content || {}).map(
            ([key, fieldData]) => (
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
                        watch(`sidebar_content.${key}.value`) || fieldData.value
                      }
                      onChange={(e) => {
                        setValue(
                          `sidebar_content.${key}.value`,
                          e.target.value
                        );
                      }}
                      className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                    />
                    <input
                      type="text"
                      id={key}
                      value={
                        watch(`sidebar_content.${key}.value`) || fieldData.value
                      }
                      onChange={(e) => {
                        setValue(
                          `sidebar_content.${key}.value`,
                          e.target.value
                        );
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                ) : fieldData.type === "text" ? (
                  <input
                    type="text"
                    id={key}
                    {...register(`sidebar_content.${key}.value`, {
                      required: "This field is required",
                    })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                ) : null}
                {errors?.sidebar_content?.[key]?.value && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sidebar_content[key].value.message}
                  </p>
                )}
              </div>
            )
          )}
          </div>
          </div>
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

export default withProtectedRoute(SidebarLayout, ["Admin"]);
