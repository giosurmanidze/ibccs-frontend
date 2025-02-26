"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPage, getPage, updatePage } from "@/services/pageService";
import { toast, ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";

// const ReactQuill = dynamic(() => import("react-quill"), {
//   ssr: false,
//   loading: () => <p>Loading editor...</p>,
// });
import "react-quill/dist/quill.snow.css";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

function PageEditor({ pageId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    meta_data: { description: "", keywords: "" },
    is_published: false,
  });

  const {
    register,
    // handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(),
  });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      meta_data: {
        ...prev.meta_data,
        [name]: value,
      },
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await updatePage(pageId, formData);
        toast.success("Page updated successfully");
      } else {
        await createPage(formData);
        toast.success("Page created successfully");
      }
      // router.push("/admin/pages");
    } catch (error) {
      toast.error("Failed to save page");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="container mx-auto p-4">
    //   <h1 className="text-2xl font-bold mb-6">
    //     {isEditMode ? "Edit Page" : "Create New Page"}
    //   </h1>
    //   <form onSubmit={handleSubmit} className="space-y-6">
    //     <div>
    //       <label className="block text-sm font-medium text-gray-700">
    //         Title
    //       </label>
    //       <input
    //         type="text"
    //         name="title"
    //         value={formData.title}
    //         onChange={handleChange}
    //         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    //         required
    //       />
    //     </div>

    //     {/* <div>
    //       <label className="block text-sm font-medium text-gray-700">
    //         Content
    //       </label>
    //       <ReactQuill
    //         value={formData.content}
    //         onChange={handleContentChange}
    //         className="h-64 mb-12"
    //       />
    //     </div> */}

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700">
    //           Meta Description
    //         </label>
    //         <input
    //           type="text"
    //           name="description"
    //           value={formData.meta_data.description}
    //           onChange={handleMetaChange}
    //           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700">
    //           Meta Keywords
    //         </label>
    //         <input
    //           type="text"
    //           name="keywords"
    //           value={formData.meta_data.keywords}
    //           onChange={handleMetaChange}
    //           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    //         />
    //       </div>
    //     </div>

    //     <div className="flex items-center">
    //       <input
    //         type="checkbox"
    //         id="is_published"
    //         name="is_published"
    //         checked={formData.is_published}
    //         onChange={handleChange}
    //         className="h-4 w-4 text-blue-600 border-gray-300 rounded"
    //       />
    //       <label
    //         htmlFor="is_published"
    //         className="ml-2 block text-sm text-gray-900"
    //       >
    //         Publish this page
    //       </label>
    //     </div>

    //     <div className="flex space-x-2">
    //       <button
    //         type="submit"
    //         disabled={loading}
    //         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    //       >
    //         {loading ? "Saving..." : "Save Page"}
    //       </button>
    //       <button
    //         type="button"
    //         onClick={() => router.push("/admin/pages")}
    //         className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
    //       >
    //         Cancel
    //       </button>
    //     </div>
    //   </form>
    // </div>
    <div>
      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        draggable
      />
      <PageBreadcrumb pageTitle="Create New Page" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form>
          <div class="grid gap-6 mb-6 md:grid-cols-1">
            <div>
              <label
                for="name"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Title
              </label>
              <input
                type="text"
                {...register("title")}
                id="title"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              {/* {errors.name && <p className="error">{errors.name.message}</p>} */}
            </div>
            <div>
              <label
                for="lastname"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Content
              </label>
              <textarea
                type="text"
                {...register("content")}
                id="content"
                rows={6}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Page content here"
              />
              {/* {errors.content && ( */}
              {/* // <p className="error">{errors.lastname.message}</p> */}
              {/* )} */}
            </div>
            <div>
              <label
                for="meta_description"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Meta Description
              </label>
              <input
                type="text"
                id="meta_description"
                {...register("meta_description")}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              {/* {errors.meta_description && (
                <p className="error">{errors.phone_number.message}</p>
              )} */}
            </div>
          </div>
          <div class="mb-6">
            <label
              for="meta_keywords"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Meta Keywords
            </label>
            <input
              id="meta_keywords"
              {...register("meta_keywords")}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            {/* {errors.meta_keywords && <p className="error">{errors.email.message}</p>} */}
          </div>

          <button
            type="submit"
            // disabled={isSubmitting}
            className={`
            text-white 
            bg-blue-700 
            hover:bg-blue-800 
            focus:ring-4 
            focus:outline-none 
            focus:ring-blue-300 
            font-medium 
            rounded-lg 
            text-sm 
            w-full 
            sm:w-auto 
            px-5 
            py-2.5 
            text-center 
            dark:bg-blue-600 
            dark:hover:bg-blue-700 
            dark:focus:ring-blue-800 
            mt-10
            ${"isSubmitting" ? "opacity-50 cursor-not-allowed" : ""}
          `}
          >
            {"isSubmitting" ? (
              <div className="inline-flex items-center">
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Loading...
              </div>
            ) : (
              "Create"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default withProtectedRoute(PageEditor, ["Admin"]);
