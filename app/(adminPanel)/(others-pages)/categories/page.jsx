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
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Categories Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage your product categories
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Category
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3">
                ID
              </th>
              <th scope="col" className="px-6 py-3">
                Icon
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Background Image
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">{category.id}</td>
                <td className="px-6 py-4">
                  {category.icon && (
                    <Image
                      src={category.icon}
                      alt={`${category.name} icon`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  )}
                </td>
                <td className="px-6 py-4">{category.name}</td>
                <td className="px-6 py-4">{category.description}</td>
                <td className="px-6 py-4">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={`${category.name} background`}
                      width={100}
                      height={50}
                      className="rounded object-cover"
                    />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl !p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {isEditMode ? "Edit Category" : "Add New Category"}
            </h3>
            <form onSubmit={handleSubmitCategory}>
              <div className="mb-4">
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
                    className=" 
        block 
        w-full 
        px-4 
        py-2.5 
        text-sm 
        text-gray-900 
        dark:text-white 
        bg-white 
        dark:bg-gray-700 
        border 
        border-gray-300 
        dark:border-gray-600 
        rounded-lg 
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-blue-500 
        dark:focus:ring-blue-500 
        dark:focus:border-blue-500 
        transition-all 
        duration-300 
        ease-in-out 
        shadow-sm 
        hover:border-blue-500 
        dark:hover:border-blue-400
      "
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="category-name"
                  className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2"
                >
                  Category Name
                </label>
                <div className="relative">
                  <textarea
                    id="category-description"
                    type="text"
                    name="description"
                    value={newCategory.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter category description"
                    className=" 
        block 
        w-full 
        px-4 
        py-2.5 
        text-sm 
        text-gray-900 
        dark:text-white 
        bg-white 
        dark:bg-gray-700 
        border 
        border-gray-300 
        dark:border-gray-600 
        rounded-lg 
        focus:ring-2 
        focus:ring-blue-500 
        focus:border-blue-500 
        dark:focus:ring-blue-500 
        dark:focus:border-blue-500 
        transition-all 
        duration-300 
        ease-in-out 
        shadow-sm 
        hover:border-blue-500 
        dark:hover:border-blue-400
      "
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Icon
                  </label>
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    ref={iconInputRef}
                    accept="image/*"
                    onChange={handleFileChange("icon")}
                    className="hidden"
                  />
                </div>{" "}
                {(iconFile || (isEditMode && editingCategory?.icon)) && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10">
                          <Image
                            src={iconFile?.preview || editingCategory.icon}
                            alt="Icon Preview"
                            width={40}
                            height={40}
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {iconFile?.name || "Existing Icon"}
                          </p>
                          {iconFile && (
                            <p className="text-xs text-gray-500">
                              {formatFileSize(iconFile.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("icon")}
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
                  </div>
                )}
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Background Image
                  </label>
                  <button
                    type="button"
                    onClick={() => backgroundInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800"
                  >
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

                {(backgroundFile || (isEditMode && editingCategory?.image)) && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10">
                          <Image
                            src={
                              backgroundFile?.preview || editingCategory.image
                            }
                            alt="Background Preview"
                            width={40}
                            height={40}
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {backgroundFile?.name || "Existing Background"}
                          </p>
                          {backgroundFile && (
                            <p className="text-xs text-gray-500">
                              {formatFileSize(backgroundFile.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("background")}
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
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditMode ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
