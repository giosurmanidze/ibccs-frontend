"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";

function EditPage() {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get(`pages/login`);
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
    if (pageContent?.login_content) {
      Object.entries(pageContent.login_content).forEach(([key, fieldData]) => {
        setValue(`login_content.${key}.value`, fieldData.value);
        setValue(`login_content.${key}.type`, fieldData.type);
      });
    }
  }, [pageContent, setValue]);

  const onSubmit = async (data) => {
    console.log(data.login_content);
    try {
      const currentContent = pageContent
        ? JSON.parse(JSON.stringify(pageContent))
        : {};

      const dynamicContentData = {
        ...currentContent,
        buttons: data.login_content,
      };

      const payload = {
        dynamic_content: JSON.stringify(dynamicContentData),
        is_published: true,
      };

      const response = await axiosInstance.post(
        "pages/by-title/login",
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
      <PageBreadcrumb pageTitle={`Login page`} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(pageContent?.buttons || []).map((button, index) => (
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
                        {...register(`login_content.${index}.text`, {
                          required: "Button text is required",
                        })}
                        defaultValue={button.text}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                      />
                    </div>

                    {button.url && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Button URL
                        </label>
                        <input
                          type="text"
                          {...register(`login_content.${index}.url`, {
                            required: "Button URL is required",
                          })}
                          defaultValue={button.url}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Button Name
                      </label>
                      <input
                        type="text"
                        {...register(`login_content.${index}.name`, {
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
                          {...register(`login_content.${index}.text_color`)}
                          defaultValue={button.text_color}
                          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                        />
                        <input
                          type="text"
                          value={
                            watch(`login_content.${index}.text_color`) ||
                            button.text_color
                          }
                          onChange={(e) => {
                            setValue(
                              `login_content.${index}.text_color`,
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
                            `login_content.${index}.background_color`
                          )}
                          defaultValue={button.background_color}
                          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                        />
                        <input
                          type="text"
                          value={
                            watch(`login_content.${index}.background_color`) ||
                            button.background_color
                          }
                          onChange={(e) => {
                            setValue(
                              `login_content.${index}.background_color`,
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

export default withProtectedRoute(EditPage, ["Admin"]);
