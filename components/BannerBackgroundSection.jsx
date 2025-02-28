import React from "react";
import ImageUploadField from "./ImageUploadField";

const BannerBackgroundSection = ({
  register,
  watch,
  setValue,
  getImageUrl,
  handleFileChange,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Banner Background</h2>
      <div className="p-4 bg-gray-50 dark:bg-gray-800">
        <div className="mb-4">
          <div className="space-y-4 mt-2">
            <ImageUploadField
              field="banner_bg"
              label="Banner Background Image"
              value={watch("banner_bg.value")}
              register={register}
              setValue={setValue}
              getImageUrl={getImageUrl}
              handleFileChange={handleFileChange}
            />

            {watch("banner_bg.value") && (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Banner background image selected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue("banner_bg.value", "");
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <input type="hidden" {...register(`banner_bg.type`)} value="file" />
        </div>
      </div>
    </div>
  );
};

export default BannerBackgroundSection;
