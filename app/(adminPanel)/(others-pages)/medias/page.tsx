"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/config/axios";

export default function EnhancedFileLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredFile, setHoveredFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Fetch files from the server
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axiosInstance("files");

        // Enhance file data with correct type and URL
        const enhancedFiles = response.data.map((file) => {
          // Determine file type
          const type = determineFileType(file.mimetype);

          // Correct URL
          const correctedUrl = file.url.includes("/uploads/order_files/")
            ? file.url.replace("/uploads/order_files/", "/uploads/")
            : file.url;

          return {
            ...file,
            type,
            url: file.url, // Use original or corrected URL as needed
          };
        });

        setFiles(enhancedFiles);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching files:", err);
        setError("Failed to load files");
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Determine file type based on MIME type
  const determineFileType = (mimeType) => {
    if (mimeType && mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
    if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "word";

    return "other";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter files based on type and search term
  const filteredFiles = files.filter(
    (file) =>
      (activeTab === "all" || file.type === activeTab) &&
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get file counts by type
  const fileCounts = {
    all: files.length,
    image: files.filter((file) => file.type === "image").length,
    pdf: files.filter((file) => file.type === "pdf").length,
    word: files.filter((file) => file.type === "word").length,
    other: files.filter(
      (file) =>
        file.type !== "image" && file.type !== "pdf" && file.type !== "word"
    ).length,
  };

  // Handle file preview
  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  // Handle file download
  const handleDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file deletion
  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setFiles(files.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error("Error deleting file:", err);
      // TODO: Add user-friendly error notification
    }
  };

  // Render file icon based on type
  const renderFileIcon = (type) => {
    switch (type) {
      case "image":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-purple-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case "word":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
    }
  };

  // Render tab icon based on type
  const renderTabIcon = (type) => {
    switch (type) {
      case "all":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
            <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
          </svg>
        );
      case "image":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        );
    }
  };

  // Render preview modal
  const renderPreviewModal = () => {
    if (!previewFile) return null;

    const isImage = previewFile.type === "image";
    const isPdf = previewFile.type === "pdf";
    const isDocument = previewFile.type === "word";

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={() => setPreviewFile(null)}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl max-h-[90vh] w-full h-[80vh] relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                {renderFileIcon(previewFile.type)}
              </div>
              <h2 className="text-xl font-semibold truncate max-w-[80%]">
                {previewFile.file_name}
              </h2>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
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

          {/* Preview Content */}
          <div className="p-4 h-[calc(100%-140px)] overflow-auto flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            {isImage ? (
              <img
                src={previewFile.url}
                alt={previewFile.file_name}
                className="max-w-full max-h-full mx-auto object-contain rounded-lg shadow-lg"
              />
            ) : isPdf || isDocument ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  previewFile.url
                )}&embedded=true`}
                className="w-full h-full rounded-lg shadow-lg"
                title="Document Preview"
              ></iframe>
            ) : (
              <div className="text-center text-gray-500 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="mb-4">{renderFileIcon(previewFile.type)}</div>
                <p className="font-semibold">
                  Preview not available for this file type.
                </p>
                <p className="mt-2">File type: {previewFile.mimetype}</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center rounded-b-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-750">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(parseInt(previewFile.file_size_bytes))} • Uploaded
              on {formatDate(previewFile.created_at)}
            </div>
            <a
              href={previewFile.url}
              download={previewFile.file_name}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-md hover:shadow-lg"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="relative group"
            onMouseEnter={() => setHoveredFile(file.id)}
            onMouseLeave={() => setHoveredFile(null)}
          >
            <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 transition-all duration-300 bg-white dark:bg-gray-800 hover:shadow-2xl transform hover:-translate-y-2 h-full flex flex-col">
              {/* File Preview or Icon */}
              <div
                className="flex justify-center items-center mb-4 cursor-pointer flex-grow"
                onClick={() => handlePreview(file)}
              >
                {file.type === "image" ? (
                  <div className="relative w-full pt-[100%] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                    <img
                      src={file.url}
                      alt={file.file_name}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                    {renderFileIcon(file.type)}
                  </div>
                )}
              </div>

              {/* File Details */}
              <div className="text-center mt-auto">
                <p className="font-semibold text-sm text-gray-800 dark:text-white/90 truncate max-w-full mb-1">
                  {file.file_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {formatFileSize(parseInt(file.file_size_bytes))} •{" "}
                  {formatDate(file.created_at)}
                </p>
              </div>

              {/* Action Buttons */}
              <div
                className={`absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 dark:from-black/70 dark:to-black/90 rounded-2xl flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  hoveredFile === file.id ? "visible" : "invisible"
                }`}
              >
                <button
                  onClick={() => handleDownload(file.url, file.file_name)}
                  className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Download"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
                <button
                  onClick={() => handlePreview(file)}
                  className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Preview"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-red-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                File
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Type
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Size
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Uploaded
              </th>
              <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFiles.map((file) => (
              <tr
                key={file.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10">
                      {file.type === "image" ? (
                        <img
                          src={file.url}
                          alt={file.file_name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center">
                          {renderTabIcon(file.type)}
                        </div>
                      )}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {file.file_name}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 capitalize">
                  {file.type}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {formatFileSize(parseInt(file.file_size_bytes))}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {formatDate(file.created_at)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handlePreview(file)}
                      className="text-green-600 hover:text-green-800 dark:hover:text-green-400"
                      title="Preview"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownload(file.url, file.file_name)}
                      className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                      title="Download"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="flex space-x-4 mb-6">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto text-red-500 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-red-500 text-xl font-semibold">{error}</p>
            <p className="text-gray-500 mt-2">
              Please try again later or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header with search and filters */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900/50 dark:to-gray-900/30 rounded-t-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              File Library
            </h1>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Tab Navigation for file types */}
          <div className="mt-6 flex flex-wrap items-center space-x-1 md:space-x-2">
            {["all", "image", "pdf", "word", "other"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                  activeTab === type
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                }`}
              >
                <span>{renderTabIcon(type)}</span>
                <span className="capitalize">{type}</span>
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {fileCounts[type] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle and Stats */}
        <div className="px-6 py-3 bg-white dark:bg-gray-900/20 flex flex-wrap justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing{" "}
            <span className="font-semibold">{filteredFiles.length}</span> of{" "}
            <span className="font-semibold">{files.length}</span> files
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Grid View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="List View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Files Display (Grid or List View) */}
        {filteredFiles.length > 0 ? (
          viewMode === "grid" ? (
            renderGridView()
          ) : (
            renderListView()
          )
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 mx-auto text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              No files found
            </p>
            <p className="text-gray-500 mt-2">
              {searchTerm
                ? `No files match "${searchTerm}"`
                : activeTab !== "all"
                ? `No ${activeTab} files available`
                : "Upload some files to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {renderPreviewModal()}
    </div>
  );
}
