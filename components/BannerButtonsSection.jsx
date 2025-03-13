import React from "react";
import ButtonItem from "./ButtonItem";

const BannerButtonsSection = ({
  pageContent,
  register,
  watch,
  setValue,
  getImageUrl,
  handleFileChange,
  addNewBannerButton,
  removeBannerButton, // Add this prop
}) => {
  const bannerButtons =
    watch("banner_buttons") ||
    (pageContent.banner_buttons && Array.isArray(pageContent.banner_buttons)
      ? [...pageContent.banner_buttons]
      : []);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Banner Buttons</h2>
        <button
          type="button"
          onClick={addNewBannerButton}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Add New Button
        </button>
      </div>

      {bannerButtons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bannerButtons.map((button, index) => (
            <div key={index} className="relative">
              <ButtonItem
                button={button}
                index={index}
                register={register}
                watch={watch}
                setValue={setValue}
                getImageUrl={getImageUrl}
                handleFileChange={handleFileChange}
              />
              {bannerButtons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBannerButton(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove Button"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No banner buttons. Click Add New Button to create one.
        </div>
      )}
    </div>
  );
};

export default BannerButtonsSection;