// components/BannerButtonsSection.jsx
import React from "react";
import ButtonItem from "./ButtonItem";

const BannerButtonsSection = ({
  pageContent,
  register,
  watch,
  setValue,
  getImageUrl,
  handleFileChange,
}) => {
  if (
    !pageContent.banner_buttons ||
    !Array.isArray(pageContent.banner_buttons)
  ) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Banner Buttons</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pageContent.banner_buttons.map((button, index) => (
          <ButtonItem
            key={index}
            button={button}
            index={index}
            register={register}
            watch={watch}
            setValue={setValue}
            getImageUrl={getImageUrl}
            handleFileChange={handleFileChange}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerButtonsSection;
