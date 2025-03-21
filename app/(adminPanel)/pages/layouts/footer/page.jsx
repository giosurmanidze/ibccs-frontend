"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";
import {
  MapPin,
  Mail,
  Upload,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

function FooterLayout() {
  const [pageContent, setPageContent] = useState({});
  const [isAddingQuickUrl, setIsAddingQuickUrl] = useState(false);
  const [newUrlName, setNewUrlName] = useState("");
  const [newUrlLink, setNewUrlLink] = useState("");
  const [isAddingSocialLink, setIsAddingSocialLink] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [previewQrImage, setPreviewQrImage] = useState("");

  useEffect(() => {
    const getPageContent = async () => {
      const response = await axiosInstance.get("pages/header");
      const parsedContent = JSON.parse(response.data?.dynamic_content);

      if (!parsedContent.footer.footer_quick_links) {
        parsedContent.footer.footer_quick_links = [];
      }

      // Initialize footer_social_links array if it doesn't exist
      if (!parsedContent.footer.footer_social_links) {
        parsedContent.footer.footer_social_links = [];
      }

      if (
        parsedContent.footer.footer_qr_image &&
        parsedContent.footer.footer_qr_image.value
      ) {
        setPreviewQrImage(parsedContent.footer.footer_qr_image.value);
      }

      if (
        Object.keys(parsedContent.footer).some((key) =>
          key.includes("quick_url_")
        )
      ) {
        const quickLinks = [];
        const quickUrlEntries = Object.entries(parsedContent.footer).filter(
          ([key]) => key.includes("quick_url_")
        );

        // Group name and link pairs to create links array
        const pairs = quickUrlEntries.reduce((pairs, [key, fieldData]) => {
          const baseKey = key.replace("_name", "").replace("_link", "");
          const existingPair = pairs.find((pair) => pair.baseKey === baseKey);

          if (existingPair) {
            if (key.includes("_name")) {
              existingPair.name = { key, fieldData };
            } else if (key.includes("_link")) {
              existingPair.link = { key, fieldData };
            }
            return pairs;
          } else {
            const newPair = { baseKey };
            if (key.includes("_name")) {
              newPair.name = { key, fieldData };
            } else if (key.includes("_link")) {
              newPair.link = { key, fieldData };
            }
            return [...pairs, newPair];
          }
        }, []);

        // Create links array
        pairs.forEach((pair) => {
          if (pair.name && pair.link) {
            quickLinks.push({
              name: pair.name.fieldData.value,
              url: pair.link.fieldData.value,
            });
          }
        });

        // Remove old format properties
        quickUrlEntries.forEach(([key]) => {
          delete parsedContent.footer[key];
        });

        // Add links array
        parsedContent.footer.footer_quick_links = quickLinks;
      }

      setPageContent(parsedContent);
    };
    getPageContent();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    getValues,
  } = useForm({});

  useEffect(() => {
    if (pageContent?.footer) {
      Object.entries(pageContent.footer)
        .filter(
          ([key]) =>
            !["footer_quick_links", "footer_social_links"].includes(key)
        )
        .forEach(([key, fieldData]) => {
          setValue(`footer.${key}.value`, fieldData.value);
          setValue(`footer.${key}.type`, fieldData.type);
        });

      if (pageContent.footer.footer_quick_links) {
        setValue(
          "footer.footer_quick_links",
          pageContent.footer.footer_quick_links
        );
      }

      if (pageContent.footer.footer_social_links) {
        setValue(
          "footer.footer_social_links",
          pageContent.footer.footer_social_links
        );
      }
    }
  }, [pageContent, setValue]);

  const addNewQuickUrl = () => {
    if (!newUrlName.trim() || !newUrlLink.trim()) {
      toast.error("Please enter both URL name and link");
      return;
    }

    const currentLinks = pageContent.footer.footer_quick_links || [];

    const updatedLinks = [
      ...currentLinks,
      { name: newUrlName, url: newUrlLink },
    ];

    setValue("footer.footer_quick_links", updatedLinks);

    const updatedFooter = {
      ...pageContent.footer,
      footer_quick_links: updatedLinks,
    };

    setPageContent({
      ...pageContent,
      footer: updatedFooter,
    });

    setNewUrlName("");
    setNewUrlLink("");
    setIsAddingQuickUrl(false);

    toast.success("Quick URL added successfully!");
  };

  const removeQuickUrl = (index) => {
    const currentLinks = [...(pageContent.footer.footer_quick_links || [])];
    currentLinks.splice(index, 1);

    setValue("footer.footer_quick_links", currentLinks);

    // Update page content state
    const updatedFooter = {
      ...pageContent.footer,
      footer_quick_links: currentLinks,
    };

    setPageContent({
      ...pageContent,
      footer: updatedFooter,
    });

    toast.success("Quick URL removed successfully!");
  };

  const addNewSocialLink = () => {
    if (!newSocialPlatform || !newSocialUrl.trim()) {
      toast.error("Please select a platform and enter a URL");
      return;
    }

    // Get current social links
    const currentLinks = pageContent.footer.footer_social_links || [];

    // Check if this platform already exists
    const platformExists = currentLinks.some(
      (link) => link.name === newSocialPlatform
    );
    if (platformExists) {
      toast.error(`A link for ${newSocialPlatform} already exists`);
      return;
    }

    // Add new link
    const updatedLinks = [
      ...currentLinks,
      { name: newSocialPlatform, url: newSocialUrl },
    ];

    // Update form state
    setValue("footer.footer_social_links", updatedLinks);

    // Update page content state
    const updatedFooter = {
      ...pageContent.footer,
      footer_social_links: updatedLinks,
    };

    setPageContent({
      ...pageContent,
      footer: updatedFooter,
    });

    // Reset form
    setNewSocialPlatform("");
    setNewSocialUrl("");
    setIsAddingSocialLink(false);

    toast.success("Social link added successfully!");
  };

  const removeSocialLink = (index) => {
    const currentLinks = [...(pageContent.footer.footer_social_links || [])];
    currentLinks.splice(index, 1);

    // Update form state
    setValue("footer.footer_social_links", currentLinks);

    // Update page content state
    const updatedFooter = {
      ...pageContent.footer,
      footer_social_links: currentLinks,
    };

    setPageContent({
      ...pageContent,
      footer: updatedFooter,
    });

    toast.success("Social link removed successfully!");
  };

  const handleQrImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    setQrImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewQrImage(reader.result);
      // Also update the form value
      setValue("footer.footer_qr_image.value", reader.result);
      setValue("footer.footer_qr_image.type", "image");

      // Update page content state
      const updatedFooter = {
        ...pageContent.footer,
        footer_qr_image: {
          value: reader.result,
          type: "image",
        },
      };

      setPageContent({
        ...pageContent,
        footer: updatedFooter,
      });
    };
    reader.readAsDataURL(file);
  };
  const removeQrImage = () => {
    setQrImage(null);
    setPreviewQrImage("");
    setValue("footer.footer_qr_image.value", "");

    // Update page content state
    const updatedFooter = {
      ...pageContent.footer,
    };

    if (updatedFooter.footer_qr_image) {
      updatedFooter.footer_qr_image.value = "";
    }

    setPageContent({
      ...pageContent,
      footer: updatedFooter,
    });

    toast.success("QR image removed successfully!");
  };

  const onSubmit = async (data) => {
    try {
      const currentContent = pageContent
        ? JSON.parse(JSON.stringify(pageContent))
        : {};

      // Store the footer arrays in the footer object
      const formData = { ...data.footer };

      // Create the final footer object with both arrays
      const footerObject = {};

      // Add all regular fields
      Object.entries(formData)
        .filter(
          ([key]) =>
            !["footer_quick_links", "footer_social_links"].includes(key)
        )
        .forEach(([key, value]) => {
          footerObject[key] = value;
        });

      // Add the links arrays
      footerObject.footer_quick_links = data.footer.footer_quick_links || [];
      footerObject.footer_social_links = data.footer.footer_social_links || [];

      if (data.footer.footer_qr_image && data.footer.footer_qr_image.value) {
        footerObject.footer_qr_image = data.footer.footer_qr_image;
      }

      const dynamicContentData = {
        ...currentContent,
        footer: footerObject,
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
            <div className="flex justify-between items-center mb-6">
              {!isAddingQuickUrl ? (
                <button
                  type="button"
                  onClick={() => setIsAddingQuickUrl(true)}
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Add Quick URL
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingQuickUrl(false)}
                    className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {!isAddingSocialLink ? (
              <button
                type="button"
                onClick={() => setIsAddingSocialLink(true)}
                className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Add Social Link
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSocialLink(false)}
                  className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}
            {isAddingQuickUrl && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 mt-4">
                <h4 className="text-md font-medium mb-3">Add New Quick URL</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      URL Display Name
                    </label>
                    <input
                      type="text"
                      value={newUrlName}
                      onChange={(e) => setNewUrlName(e.target.value)}
                      placeholder="e.g. About Us"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      URL Link
                    </label>
                    <input
                      type="text"
                      value={newUrlLink}
                      onChange={(e) => setNewUrlLink(e.target.value)}
                      placeholder="e.g. /about-us"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addNewQuickUrl}
                  className="text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  Add URL
                </button>
              </div>
            )}
            {isAddingSocialLink && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 mt-4">
                <h4 className="text-md font-medium mb-3">
                  Add New Social Link
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Platform
                    </label>
                    <select
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="">Select Platform</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      URL
                    </label>
                    <input
                      type="text"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      placeholder="e.g. https://twitter.com/yourprofile"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addNewSocialLink}
                  className="text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  Add Social Link
                </button>
              </div>
            )}
            <div className="mt-8 bg-gray-50 w-1/2 p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Footer QR Code</h3>
              <div className="grid grid-cols-1  gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Upload QR Code Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="qr-image-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                      {!previewQrImage ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF (MAX. 800x800px)
                          </p>
                        </div>
                      ) : (
                        <div className="relative flex flex-col items-center">
                          <img
                            src={previewQrImage}
                            alt="QR Code Preview"
                            className="max-h-52 max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={removeQrImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      <input
                        id="qr-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleQrImageChange}
                      />
                      <input
                        type="hidden"
                        {...register("footer.footer_qr_image.value")}
                      />
                      <input
                        type="hidden"
                        {...register("footer.footer_qr_image.type")}
                        value="image"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-3">QR Code Settings</h4>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      QR Code Title
                    </label>
                    <input
                      type="text"
                      {...register("footer.footer_qr_title.value", {
                        required: "QR code title is required",
                      })}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Scan to visit our website"
                    />
                    <input
                      type="hidden"
                      {...register("footer.footer_qr_title.type")}
                      value="text"
                    />
                    {errors?.footer?.footer_qr_title?.value && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.footer.footer_qr_title.value.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {Object.entries(pageContent?.footer || {})
                .filter(
                  ([key]) =>
                    key !== "footer_quick_links" &&
                    key !== "footer_social_links" &&
                    !key.includes("quick_url_") &&
                    key !== "footer_qr_image" &&
                    key !== "footer_qr_title"
                )
                .map(([key, fieldData]) => (
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
                    ) : fieldData.type === "text" ? (
                      <input
                        type="text"
                        id={key}
                        {...register(`footer.${key}.value`, {
                          required: "This field is required",
                        })}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    ) : fieldData.type === "textarea" ? (
                      <textarea
                        id={key}
                        rows="4"
                        {...register(`footer.${key}.value`, {
                          required: "This field is required",
                        })}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      ></textarea>
                    ) : null}
                    {errors?.footer?.[key]?.value && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.footer[key].value.message}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-8 mb-8">
            <h3 className="text-lg font-medium mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pageContent?.footer?.footer_social_links || []).map(
                (link, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {link.name === "Twitter" && (
                          <Twitter className="h-5 w-5 text-blue-400" />
                        )}
                        {link.name === "Facebook" && (
                          <Facebook className="h-5 w-5 text-blue-600" />
                        )}
                        {link.name === "Instagram" && (
                          <Instagram className="h-5 w-5 text-pink-500" />
                        )}
                        {link.name === "LinkedIn" && (
                          <Linkedin className="h-5 w-5 text-blue-700" />
                        )}
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {link.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                      </button>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        URL
                      </label>
                      <input
                        type="text"
                        {...register(
                          `footer.footer_social_links.${index}.url`,
                          {
                            required: "This field is required",
                          }
                        )}
                        defaultValue={link.url}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <input
                        type="hidden"
                        {...register(
                          `footer.footer_social_links.${index}.name`
                        )}
                        defaultValue={link.name}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick URLs Section */}
          <div className="mt-8 mb-8">
            <h3 className="text-lg font-medium mb-4">Quick URLs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pageContent?.footer?.footer_quick_links || []).map(
                (link, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Quick Link #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuickUrl(index)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Display Name
                      </label>
                      <input
                        type="text"
                        {...register(
                          `footer.footer_quick_links.${index}.name`,
                          {
                            required: "This field is required",
                          }
                        )}
                        defaultValue={link.name}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        URL
                      </label>
                      <input
                        type="text"
                        {...register(`footer.footer_quick_links.${index}.url`, {
                          required: "This field is required",
                        })}
                        defaultValue={link.url}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    </div>
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

export default withProtectedRoute(FooterLayout, ["Admin"]);
