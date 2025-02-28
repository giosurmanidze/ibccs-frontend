import React from "react";

const ColorField = ({
  label,
  colorFieldName,
  typeFieldName,
  defaultValue,
  register,
  watch,
  setValue,
}) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          {...register(colorFieldName)}
          defaultValue={defaultValue}
          className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg dark:bg-gray-700"
        />
        <input
          type="text"
          value={watch(colorFieldName) || defaultValue}
          onChange={(e) => setValue(colorFieldName, e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex-1 p-2.5 dark:bg-gray-700"
        />
      </div>
      {typeFieldName && (
        <input type="hidden" {...register(typeFieldName)} value="color" />
      )}
    </div>
  );
};

export default ColorField;
