"use client";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";
import Image from "next/image";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const iconInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

  const openEditModal = (category) => {
    setIsEditMode(true);
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
    });

    // Reset file inputs
    setIconFile(null);
    setBackgroundFile(null);
    setIsModalOpen(true);
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast.error("Failed to load categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "icon") {
          setIconFile({
            file,
            preview: reader.result,
            name: file.name,
            size: file.size,
          });
        } else {
          setBackgroundFile({
            file,
            preview: reader.result,
            name: file.name,
            size: file.size,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type) => {
    if (type === "icon") {
      setIconFile(null);
      if (iconInputRef.current) {
        iconInputRef.current.value = "";
      }

      if (isEditMode && editingCategory) {
        setEditingCategory((prev) => ({
          ...prev,
          icon: null,
        }));
      }
    } else {
      setBackgroundFile(null);
      if (backgroundInputRef.current) {
        backgroundInputRef.current.value = "";
      }

      if (isEditMode && editingCategory) {
        setEditingCategory((prev) => ({
          ...prev,
          image: null,
        }));
      }
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    // Create form data
    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("description", newCategory.description);
    if (isEditMode && editingCategory && editingCategory.icon === null) {
      formData.append("remove_icon", "1");
    }

    if (isEditMode && editingCategory && editingCategory.image === null) {
      formData.append("remove_image", "1");
    }

    if (iconFile?.file) {
      formData.append("icon", iconFile.file);
    }

    if (backgroundFile?.file) {
      formData.append("image", backgroundFile.file);
    }

    try {
      let response;
      if (isEditMode && editingCategory) {
        response = await axiosInstance.post(
          `/categories/${editingCategory.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update category in the list
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? response.data : cat
          )
        );
      } else {
        response = await axiosInstance.post("/categories", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setCategories((prev) => [...prev, response.data]);
      }

      setNewCategory({ name: "", description: "" });
      setIconFile(null);
      setBackgroundFile(null);
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingCategory(null);

      toast.success(
        isEditMode
          ? "Category updated successfully"
          : "Category created successfully"
      );
    } catch (error) {
      console.error("Failed to save category", error);
      toast.error(
        isEditMode ? "Failed to update category" : "Failed to create category"
      );
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axiosInstance.delete(`/categories/${categoryId}`);

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Failed to delete category", error);
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading categories...</div>;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 overflow-hidden shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Categories Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage your service categories
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingCategory(null);
              setNewCategory({ name: "", description: "" });
              setIconFile(null);
              setBackgroundFile(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Category
          </button>
        </div>
      </div>

      {/* Table with responsive design */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300"
                  >
                    Icon
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300"
                  >
                    Background Image
                  </th>
                  <th
                    scope="col"
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {category.id}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      {category.icon && (
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                          <Image
                            src={category.icon}
                            alt={`${category.name} icon`}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {category.name}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs truncate">
                        {category.description}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      {category.image && (
                        <div className="h-12 w-24 rounded overflow-hidden bg-gray-100 dark:bg-gray-600">
                          <Image
                            src={category.image}
                            alt={`${category.name} background`}
                            width={96}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition duration-150 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition duration-150 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
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
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ease-in-out animate-modal-fade-in"
            style={{ animation: "fadeInScale 0.3s ease-out" }}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition duration-150"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitCategory} className="space-y-5">
                <div>
                  <label
                    htmlFor="category-name"
                    className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Category Name
                  </label>
                  <div className="relative">
                    <input
                      id="category-name"
                      type="text"
                      name="name"
                      value={newCategory.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter category name"
                      className="block w-full px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 ease-in-out shadow-sm hover:border-blue-500 dark:hover:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category-description"
                    className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2"
                  >
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      id="category-description"
                      name="description"
                      value={newCategory.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter category description"
                      rows={3}
                      className="block w-full px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 ease-in-out shadow-sm hover:border-blue-500 dark:hover:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Category Icon
                    </label>
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Choose File
                    </button>
                    <input
                      type="file"
                      ref={iconInputRef}
                      accept="image/*"
                      onChange={handleFileChange("icon")}
                      className="hidden"
                    />
                  </div>

                  {(iconFile || (isEditMode && editingCategory?.icon)) && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-md overflow-hidden p-1 border border-gray-200 dark:border-gray-700">
                            <Image
                              src={iconFile?.preview || editingCategory.icon}
                              alt="Icon Preview"
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {iconFile?.name || "Current Icon"}
                            </p>
                            {iconFile && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(iconFile.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile("icon")}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none transition duration-150"
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
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Background Image
                    </label>
                    <button
                      type="button"
                      onClick={() => backgroundInputRef.current?.click()}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Choose File
                    </button>
                    <input
                      type="file"
                      ref={backgroundInputRef}
                      accept="image/*"
                      onChange={handleFileChange("background")}
                      className="hidden"
                    />
                  </div>

                  {(backgroundFile ||
                    (isEditMode && editingCategory?.image)) && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-16 h-10 bg-white dark:bg-gray-800 rounded-md overflow-hidden p-1 border border-gray-200 dark:border-gray-700">
                            <Image
                              src={
                                backgroundFile?.preview || editingCategory.image
                              }
                              alt="Background Preview"
                              width={60}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {backgroundFile?.name || "Current Background"}
                            </p>
                            {backgroundFile && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(backgroundFile.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile("background")}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none transition duration-150"
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
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isEditMode ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSS for modal animation */}
      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CategoriesManagement;
