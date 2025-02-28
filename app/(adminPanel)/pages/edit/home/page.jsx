"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useForm } from "react-hook-form";
import axiosInstance from "@/config/axios";
import BannerBackgroundSection from "@/components/BannerBackgroundSection";
import BannerCardsSection from "@/components/BannerCardsSection";
import BannerButtonsSection from "@/components/BannerButtonsSection";
import SubmitButton from "@/components/SubmitButton";

function EditPage() {
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`pages/home`);
      const content = JSON.parse(response.data?.dynamic_content || "{}");
      setPageContent(content);
      return content;
    } catch (error) {
      console.error("Error fetching page data:", error);
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
    if (pageContent) {
      initializeFormData();
    }
  }, [pageContent]);

  const initializeFormData = () => {
    if (pageContent.banner_cards && Array.isArray(pageContent.banner_cards)) {
      pageContent.banner_cards.forEach((card, index) => {
        Object.entries(card).forEach(([key, fieldData]) => {
          setValue(`banner_cards.${index}.${key}.value`, fieldData.value);
          setValue(`banner_cards.${index}.${key}.type`, fieldData.type);
        });
      });
    }

    if (pageContent.banner_bg) {
      setValue("banner_bg.value", pageContent.banner_bg.value);
      setValue("banner_bg.type", pageContent.banner_bg.type);
    }

    if (
      pageContent.banner_buttons &&
      Array.isArray(pageContent.banner_buttons)
    ) {
      pageContent.banner_buttons.forEach((button, index) => {
        setValue(`banner_buttons.${index}.url`, button.url);
        setValue(`banner_buttons.${index}.name`, button.name);
        setValue(`banner_buttons.${index}.text`, button.text);
        setValue(`banner_buttons.${index}.text_color`, button.text_color);
        setValue(
          `banner_buttons.${index}.background_color`,
          button.background_color
        );

        if (button.banner_img) {
          setValue(
            `banner_buttons.${index}.banner_img.value`,
            button.banner_img.value
          );
          setValue(
            `banner_buttons.${index}.banner_img.type`,
            button.banner_img.type
          );
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
        setImagePreview({
          field: field,
          url: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();

      const currentContent = { ...pageContent };

      if (data.banner_cards) {
        currentContent.banner_cards = processCardData(data.banner_cards);
      }

      if (data.banner_bg) {
        processBannerBackground(data.banner_bg, formData, currentContent);
      }

      if (data.banner_buttons) {
        processButtonData(data.banner_buttons, formData, currentContent);
      }

      formData.append("dynamic_content", JSON.stringify(currentContent));
      formData.append("is_published", true);

      const response = await axiosInstance.post(
        "pages/by-title/home",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Home page updated successfully!");
        await fetchPageData();
      }
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update home page");
    } finally {
      setLoading(false);
    }
  };

  const processCardData = (bannerCards) => {
    return bannerCards.map((card) => {
      const processedCard = {};
      Object.entries(card).forEach(([key, fieldData]) => {
        processedCard[key] = {
          type: fieldData.type,
          value: fieldData.value,
        };
      });
      return processedCard;
    });
  };

  const processBannerBackground = (bannerBg, formData, currentContent) => {
    if (bannerBg.value instanceof File) {
      formData.append("files[banner_bg]", bannerBg.value);
      currentContent.banner_bg = {
        type: "file",
        value: "[file:banner_bg]",
      };
    } else {
      currentContent.banner_bg = {
        type: "file",
        value: bannerBg.value || "",
      };
    }
  };

  const processButtonData = (bannerButtons, formData, currentContent) => {
    currentContent.banner_buttons = bannerButtons.map((button, index) => {
      const processedButton = {
        url: button.url || "",
        name: button.name,
        text: button.text,
        text_color: button.text_color,
        background_color: button.background_color,
      };

      if (button.banner_img && button.banner_img.value instanceof File) {
        formData.append(
          `files[banner_buttons_${index}_img]`,
          button.banner_img.value
        );
        processedButton.banner_img = {
          type: "file",
          value: `[file:banner_buttons_${index}_img]`,
        };
      } else if (button.banner_img) {
        processedButton.banner_img = {
          type: "file",
          value: button.banner_img.value || "",
        };
      }

      return processedButton;
    });
  };

  const getImageUrl = (fieldPath) => {
    if (imagePreview?.field === fieldPath) {
      return imagePreview.url;
    }

    const value = watch(`${fieldPath}.value`);

    if (
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"))
    ) {
      return value;
    }

    return "/placeholder-image.jpg";
  };

  if (loading && !pageContent.banner_cards) {
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
      <PageBreadcrumb pageTitle="Home Page Editor" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:py-7 xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <BannerBackgroundSection
            register={register}
            watch={watch}
            setValue={setValue}
            getImageUrl={getImageUrl}
            handleFileChange={handleFileChange}
          />

          <BannerCardsSection
            pageContent={pageContent}
            register={register}
            watch={watch}
            setValue={setValue}
          />

          <BannerButtonsSection
            pageContent={pageContent}
            register={register}
            watch={watch}
            setValue={setValue}
            getImageUrl={getImageUrl}
            handleFileChange={handleFileChange}
          />
          <SubmitButton loading={loading} />
        </form>
      </div>
    </div>
  );
}

export default withProtectedRoute(EditPage, ["Admin"]);
