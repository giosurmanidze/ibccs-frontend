"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm, useFieldArray } from "react-hook-form";
import axiosInstance from "@/config/axios";
import SubmitButton from "@/components/SubmitButton";

function EditPage() {
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState({});

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      header_text: { type: "text", value: "" },
      header_description: { type: "textarea", value: "" },
      cards: [],
    },
  });

  const {
    fields: cardFields,
    append: appendCard,
    remove: removeCard,
  } = useFieldArray({
    control,
    name: "cards",
  });

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`pages/about`);
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
    if (Object.keys(pageContent).length > 0) {
      initializeFormData();
    }
  }, [pageContent]);

  const initializeFormData = () => {
    if (pageContent.header_text) {
      setValue("header_text", pageContent.header_text);
    }

    if (pageContent.header_description) {
      setValue("header_description", pageContent.header_description);
    }

    if (pageContent.cards && Array.isArray(pageContent.cards)) {
      setValue(
        "cards",
        pageContent.cards.map((card) => ({
          title: card.title || { type: "text", value: "" },
          description: card.description || { type: "textarea", value: "" },
          image: card.image || { type: "file", value: "" },
        }))
      );

      pageContent.cards.forEach((card, index) => {
        if (card.image && card.image.value) {
          setImagePreview((prev) => ({
            ...prev,
            [`cards.${index}.image`]: card.image.value,
          }));
        }
      });
    }
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setValue(`${field}.value`, file);
      setValue(`${field}.type`, "file");

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview((prev) => ({
          ...prev,
          [field]: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      const currentContent = { ...pageContent };

      currentContent.header_text = data.header_text;
      currentContent.header_description = data.header_description;

      if (data.cards && Array.isArray(data.cards)) {
        currentContent.cards = data.cards.map((card, index) => {
          const processedCard = {};

          Object.entries(card).forEach(([cardKey, cardValue]) => {
            if (
              cardKey === "image" &&
              cardValue?.type === "file" &&
              cardValue?.value instanceof File
            ) {
              const fieldName = `cards_${index}_image`;
              formData.append(`files[${fieldName}]`, cardValue.value);
              processedCard.image = {
                type: "file",
                value: `[file:${fieldName}]`,
              };
            } else {
              processedCard[cardKey] = cardValue;
            }
          });

          return processedCard;
        });
      }

      console.log("Submitting content:", currentContent);
      formData.append("dynamic_content", JSON.stringify(currentContent));
      formData.append("is_published", true);

      const response = await axiosInstance.post(
        "pages/by-title/about_us",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Page updated successfully!");
        await fetchPageData();
      }
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  const addNewCard = () => {
    appendCard({
      title: { type: "text", value: "" },
      description: { type: "textarea", value: "" },
      image: { type: "file", value: "" },
    });
  };

  if (loading && Object.keys(pageContent).length === 0) {
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
      <PageBreadcrumb pageTitle="About Us Page Editor" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Page Header</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Header Text
                </label>
                <input
                  type="text"
                  {...register("header_text.value")}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                <input
                  type="hidden"
                  {...register("header_text.type")}
                  value="text"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Header Description
                </label>
                <textarea
                  {...register("header_description.value")}
                  rows={4}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                ></textarea>
                <input
                  type="hidden"
                  {...register("header_description.type")}
                  value="textarea"
                />
              </div>
            </div>
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Content Cards</h2>
              <button
                type="button"
                onClick={addNewCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Card
              </button>
            </div>

            {cardFields.length === 0 && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 text-center text-gray-500">
                No cards added yet. Click "Add New Card" to create one.
              </div>
            )}

            {cardFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Card #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="text-red-600 hover:text-red-800"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Card Title
                    </label>
                    <input
                      type="text"
                      {...register(`cards.${index}.title.value`)}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                    <input
                      type="hidden"
                      {...register(`cards.${index}.title.type`)}
                      value="text"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Card Image
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        handleFileChange(e, `cards.${index}.image`)
                      }
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none p-2.5"
                    />
                    <input
                      type="hidden"
                      {...register(`cards.${index}.image.type`)}
                      value="file"
                    />
                    <input
                      type="hidden"
                      {...register(`cards.${index}.image.value`)}
                    />
                    {imagePreview[`cards.${index}.image`] && (
                      <div className="mt-2">
                        <img
                          src={imagePreview[`cards.${index}.image`]}
                          alt={`Card ${index + 1} preview`}
                          className="max-h-32 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Card Description
                    </label>
                    <textarea
                      {...register(`cards.${index}.description.value`)}
                      rows={3}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    ></textarea>
                    <input
                      type="hidden"
                      {...register(`cards.${index}.description.type`)}
                      value="textarea"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SubmitButton loading={loading} />
        </form>
      </div>
    </div>
  );
}

export default withProtectedRoute(EditPage, ["Admin"]);
