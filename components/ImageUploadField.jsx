import React from "react";
import FileUploadIcon from "./FileUploadIcon";

const ImageUploadField = ({
  field,
  label,
  value,
  getImageUrl,
  handleFileChange,
}) => {
  return (
    <div
      className={`w-full py-9 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed 
        ${value ? "border-indigo-600" : ""}`}
    >
      <div className="grid gap-1">
        {!value ? (
          <FileUploadIcon />
        ) : (
          <div className="w-full flex justify-center">
            <img
              src={getImageUrl(field)}
              alt={label}
              className="max-h-48 object-contain rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <h4 className="text-center text-gray-900 text-sm font-medium leading-snug">
          {value && label}
        </h4>
        <div className="flex items-center justify-center">
          <label>
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange(e, field)}
              accept="image/*"
            />
            <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors focus:outline-none">
              Choose Photo
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
