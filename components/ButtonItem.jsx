import React from "react";
import Image from "next/image";
import ColorField from "./ColorField";
import FileUploadIcon from "./FileUploadIcon";

const ButtonItem = ({
  button,
  index,
  register,
  watch,
  setValue,
  getImageUrl,
  handleFileChange,
}) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-medium mb-4">Button {index + 1}</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Button Text
          </label>
          <input
            type="text"
            {...register(`banner_buttons.${index}.text`, {
              required: "Button text is required",
            })}
            defaultValue={button.text}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Button URL
          </label>
          <input
            type="text"
            {...register(`banner_buttons.${index}.url`)}
            defaultValue={button.url}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Button Name
          </label>
          <input
            type="text"
            {...register(`banner_buttons.${index}.name`, {
              required: "Button name is required",
            })}
            defaultValue={button.name}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
          />
        </div>

        <ColorField
          label="Text Color"
          colorFieldName={`banner_buttons.${index}.text_color`}
          defaultValue={button.text_color}
          register={register}
          watch={watch}
          setValue={setValue}
        />

        <ColorField
          label="Background Color"
          colorFieldName={`banner_buttons.${index}.background_color`}
          defaultValue={button.background_color}
          register={register}
          watch={watch}
          setValue={setValue}
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Banner Image
          </label>

          <div className="space-y-4 mt-2">
            <div
              className={`w-full py-9 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed 
              ${
                watch(`banner_buttons.${index}.banner_img.value`)
                  ? "border-indigo-600"
                  : ""
              }`}
            >
              <div className="grid gap-1">
                {!watch(`banner_buttons.${index}.banner_img.value`) &&
                !button.banner_img?.value ? (
                  <FileUploadIcon />
                ) : (
                  <div className="w-full flex justify-center">
                    <Image
                      src={getImageUrl(`banner_buttons.${index}.banner_img`)}
                      alt={`Banner Button ${index + 1}`}
                      width={300}
                      height={200}
                      className="max-h-48 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <h4 className="text-center text-gray-900 text-sm font-medium leading-snug">
                  {(watch(`banner_buttons.${index}.banner_img.value`) ||
                    button.banner_img?.value) &&
                    `Button ${index + 1} Image`}
                </h4>
                <div className="flex items-center justify-center">
                  <label>
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          `banner_buttons.${index}.banner_img`
                        )
                      }
                      accept="image/*"
                    />
                    <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors focus:outline-none">
                      Choose Photo
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {(watch(`banner_buttons.${index}.banner_img.value`) ||
              button.banner_img?.value) && (
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
                    Button image selected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue(`banner_buttons.${index}.banner_img.value`, "");
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <input
            type="hidden"
            {...register(`banner_buttons.${index}.banner_img.type`)}
            value="file"
          />
        </div>
      </div>
    </div>
  );
};

export default ButtonItem;
