"use client";

import { useState, useEffect } from "react";
import { getPage } from "@/services/pageService";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";

function FooterLayout({ pageId }) {
  const [pageContent, setPageContent] = useState({});

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/header");
      setPageContent(JSON.parse(response.data?.dynamic_content));
      console.log(response);
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
  } = useForm({});

  useEffect(() => {
    if (pageContent?.footer) {
      Object.entries(pageContent.footer).forEach(([key, fieldData]) => {
        setValue(`footer.${key}.value`, fieldData.value);
        setValue(`footer.${key}.type`, fieldData.type);
      });
    }
  }, [pageContent, setValue]);

  const onSubmit = async (data) => {
    try {
      const currentContent = pageContent
        ? JSON.parse(JSON.stringify(pageContent))
        : {};

      const dynamicContentData = {
        ...currentContent,
        footer: data.footer,
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
      <PageBreadcrumb pageTitle="Footer layout" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              {Object.entries(pageContent?.footer || {}).map(
                ([key, fieldData]) => {
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

                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          id={`${key}-picker`}
                          value={
                            watch(`footer.${key}.value`) || fieldData.value
                          }
                          onChange={(e) => {
                            setValue(`footer.${key}.value`, e.target.value);
                          }}
                          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                        />
                        <input
                          type="text"
                          id={key}
                          value={
                            watch(`footer.${key}.value`) || fieldData.value
                          }
                          onChange={(e) => {
                            setValue(`footer.${key}.value`, e.target.value);
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                      </div>
                      {errors?.footer?.[key]?.value && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.footer[key].value.message}
                        </p>
                      )}
                    </div>
                  );
                }
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

export default withProtectedRoute(FooterLayout, ["Admin"]);
