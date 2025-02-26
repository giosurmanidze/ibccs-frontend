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
      buttons: pageContent.buttons,
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
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          } // Ensure it's always controlled
                          onChange={(e) => {
                            setValue(`header.${key}.value`, e.target.value); // Update the color value in form state
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
                            setValue(`header.${key}.value`, e.target.value); // Update the text input value as well
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                    ) : fieldData.type === "text" ? (
                      <input
                        type="text"
                        id={key}
                        {...register(`header.${key}.value`, {
                          required: "This field is required",
                        })}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full max-w-xs p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

            <div className="col-span-1 mt-4">
              <label
                htmlFor="header_logo"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Header Logo
              </label>
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
                      <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 justify-center rounded-full shadow text-white text-xs font-semibold leading-4 items-center cursor-pointer hover:bg-indigo-700 transition-colors focus:outline-none">
                        Choose Photo
                      </div>
                    </label>
                  </div>
                  {imageUrl ? (
                    <div className="flex mt-4">
                      <img
                        src={imageUrl}
                        alt="Uploaded"
                        className="p-4 object-contain border-2 border-gray-300 rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 mt-4">
                      No image found
                    </p>
                  )}

                  {watch(`header.header_logo.preview`) && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        New Logo Preview
                      </h3>
                      <div className="flex justify-center">
                        <img
                          src={watch(`header.header_logo.preview`)}
                          alt="Preview"
                          className="p-4 object-contain border-2 border-gray-300 rounded-lg shadow-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors?.header?.header_logo?.value && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.header.header_logo.value.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
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
