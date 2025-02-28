// components/SubmitButton.jsx
import React from "react";

const SubmitButton = ({ loading }) => {
  return (
    <div className="mt-6">
      <button
        type="submit"
        disabled={loading}
        className="text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default SubmitButton;
