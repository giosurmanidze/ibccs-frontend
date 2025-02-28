"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";

function EditPage() {
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      buttons: [],
    },
  });

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`pages/product-detail`);
      const content = JSON.parse(response.data?.dynamic_content || "{}");
      setPageContent(content);
      return content;
    } catch (error) {
      toast.error("Failed to load page data");
      return {};
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  useEffect(() => {
    if (pageContent && pageContent.buttons) {
      initializeFormData();
    }
  }, [pageContent]);

  const initializeFormData = () => {
    if (pageContent.buttons && Array.isArray(pageContent.buttons)) {
      pageContent.buttons.forEach((button, index) => {
        if (button.url !== undefined) {
          setValue(`buttons.${index}.url`, button.url);
        }
        if (button.name !== undefined) {
          setValue(`buttons.${index}.name`, button.name);
        }
        if (button.text !== undefined) {
          setValue(`buttons.${index}.text`, button.text);
        }
        if (button.text_color !== undefined) {
          setValue(`buttons.${index}.text_color`, button.text_color);
        }
        if (button.background_color !== undefined) {
          setValue(
            `buttons.${index}.background_color`,
            button.background_color
          );
        }
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      const currentContent = { ...pageContent };

      currentContent.buttons = data.buttons.map((button, index) => {
        const originalButton = pageContent.buttons[index] || {};
        const processedButton = {};

        if (originalButton.url !== undefined) {
          processedButton.url = button.url || "";
        }
        if (originalButton.name !== undefined) {
          processedButton.name = button.name || "";
        }
        if (originalButton.text !== undefined) {
          processedButton.text = button.text || "";
        }
        if (originalButton.text_color !== undefined) {
          processedButton.text_color = button.text_color || "#ffffff";
        }
        if (originalButton.background_color !== undefined) {
          processedButton.background_color =
            button.background_color || "#cf6e67";
        }

        return processedButton;
      });

      formData.append("dynamic_content", JSON.stringify(currentContent));
      formData.append("is_published", true);

      const response = await axiosInstance.post(
        "pages/by-title/product_detail",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Product detail page updated successfully!");
        await fetchPageData();
      }
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update product detail page");
    } finally {
      setLoading(false);
    }
  };

  const getButtonTitle = (button) => {
    if (button.name) {
      return button.name;
    }
  };

  const isMainButton = (button) => {
    return button.text !== undefined && button.url !== undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        draggable
      />
      <PageBreadcrumb pageTitle="Product Detail Page Editor" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Product Detail Settings</h2>

            {pageContent.buttons &&
              pageContent.buttons.length > 0 &&
              isMainButton(pageContent.buttons[0]) && (
                <div className="mb-6">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-lg font-medium mb-4">
                      {getButtonTitle(pageContent.buttons[0], 3)}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {pageContent.buttons[0].text !== undefined && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Button Text
                          </label>
                          <input
                            type="text"
                            {...register(`buttons.0.text`)}
                            defaultValue={pageContent.buttons[0].text}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
                          />
                        </div>
                      )}
                      {pageContent.buttons[0].text_color !== undefined && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Text Color
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              {...register(`buttons.0.text_color`)}
                              defaultValue={
                                pageContent.buttons[0].text_color || "#ffffff"
                              }
                              className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                            />
                            <input
                              type="text"
                              value={
                                watch(`buttons.0.text_color`) ||
                                pageContent.buttons[0].text_color ||
                                "#ffffff"
                              }
                              onChange={(e) =>
                                setValue(`buttons.0.text_color`, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                            />
                          </div>
                        </div>
                      )}
                      {pageContent.buttons[0].background_color !==
                        undefined && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Background Color
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              {...register(`buttons.0.background_color`)}
                              defaultValue={
                                pageContent.buttons[0].background_color ||
                                "#cf6e67"
                              }
                              className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                            />
                            <input
                              type="text"
                              value={
                                watch(`buttons.0.background_color`) ||
                                pageContent.buttons[0].background_color ||
                                "#cf6e67"
                              }
                              onChange={(e) =>
                                setValue(
                                  `buttons.0.background_color`,
                                  e.target.value
                                )
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                            />
                          </div>
                        </div>
                      )}

                      {/* Button preview */}
                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Button Preview
                        </label>
                        <div className="p-4 border rounded-lg flex justify-center">
                          <button
                            type="button"
                            style={{
                              backgroundColor:
                                watch(`buttons.0.background_color`) ||
                                pageContent.buttons[0].background_color ||
                                "#cf6e67",
                              color:
                                watch(`buttons.0.text_color`) ||
                                pageContent.buttons[0].text_color ||
                                "#ffffff",
                              padding: "8px 16px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {watch(`buttons.0.text`) ||
                              pageContent.buttons[0].text ||
                              "Button Text"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {pageContent.buttons && pageContent.buttons.length > 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Additional Color Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageContent.buttons.slice(1).map((colorData, index) => {
                    const buttonIndex = index + 1;

                    return (
                      <div
                        key={buttonIndex}
                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <h4 className="text-md font-medium mb-3 capitalize">
                          {getButtonTitle(colorData, buttonIndex)}
                        </h4>

                        <input
                          type="hidden"
                          {...register(`buttons.${buttonIndex}.name`)}
                          defaultValue={colorData.name}
                        />

                        {colorData.text_color !== undefined && (
                          <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Text Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                id={`text-color-${buttonIndex}`}
                                {...register(
                                  `buttons.${buttonIndex}.text_color`
                                )}
                                defaultValue={colorData.text_color || "#ffffff"}
                                className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                value={
                                  watch(`buttons.${buttonIndex}.text_color`) ||
                                  colorData.text_color ||
                                  "#ffffff"
                                }
                                onChange={(e) =>
                                  setValue(
                                    `buttons.${buttonIndex}.text_color`,
                                    e.target.value
                                  )
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                              />
                            </div>
                          </div>
                        )}

                        {colorData.background_color !== undefined && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                              Background Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                id={`bg-color-${buttonIndex}`}
                                {...register(
                                  `buttons.${buttonIndex}.background_color`
                                )}
                                defaultValue={
                                  colorData.background_color || "#cf6e67"
                                }
                                className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
                              />
                              <input
                                type="text"
                                value={
                                  watch(
                                    `buttons.${buttonIndex}.background_color`
                                  ) ||
                                  colorData.background_color ||
                                  "#cf6e67"
                                }
                                onChange={(e) =>
                                  setValue(
                                    `buttons.${buttonIndex}.background_color`,
                                    e.target.value
                                  )
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withProtectedRoute(EditPage, ["Admin"]);
