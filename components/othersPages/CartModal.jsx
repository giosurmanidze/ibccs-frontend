"use client";
import React from "react";

export default function CartModal({}) {
  if (!isOpen) return null;

  return (
    <>
      <form
        className={`modal fade ${isModalOpen && !loadingItemId ? "show" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{
          display: isModalOpen ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-lg overflow-hidden">
            <div
              className="modal-header border-0 py-3 text-white"
              style={{
                background: `linear-gradient(to right, #5ca595, #6db8a8)`,
              }}
            >
              <div>
                <h5 className="modal-title font-bold mb-0">
                  Fill Service Requirements
                </h5>
                <p className="font-bold text-black text-sm mb-0 mt-1 opacity-90">
                  {productData?.name}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
              ></button>
            </div>
            {/* Modal Body */}
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                {parsedFields?.map((field, index) => {
                  const displayName = getCleanFieldName(field.name);
                  return (
                    <div
                      key={`${field.name}-${index}`}
                      className="mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h5 className="text-gray-700 font-medium mb-2 border-b pb-2">
                        {field?.title}
                      </h5>

                      {/* Text field */}
                      {field.type === "text" && (
                        <div className="form-group">
                          <label
                            className="text-sm font-medium text-gray-700 mb-1 block"
                            htmlFor={`${field.name}}`}
                          >
                            {displayName}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {renderFieldComment(field)}
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder=""
                            type="text"
                            id={`${field.name}}`}
                            {...register(field.name)}
                          />
                        </div>
                      )}

                      {field.type === "timeslot" && (
                        <div className="timeslot-selector mb-4">
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            {displayName}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {renderFieldComment(field)}

                          {(() => {
                            // Use the improved function
                            const availableSlots =
                              generateAvailableTimeSlots(field);

                            if (availableSlots.length === 0) {
                              return (
                                <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-md mt-2 text-sm">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 inline mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  No available time slots found. Please contact
                                  support.
                                </div>
                              );
                            }

                            // Group slots by date for better UI
                            const slotsByDate = {};
                            availableSlots.forEach((slot) => {
                              if (!slotsByDate[slot.date]) {
                                slotsByDate[slot.date] = [];
                              }
                              slotsByDate[slot.date].push(slot);
                            });

                            return (
                              <div className="timeslot-container mt-2">
                                {/* Date selector */}
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3 bg-white"
                                  onChange={(e) => {
                                    const dateValue = e.target.value;
                                    if (dateValue) {
                                      document
                                        .getElementById(
                                          `time-slots-${field.name}`
                                        )
                                        ?.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                    }
                                  }}
                                >
                                  <option value="">Select a date</option>
                                  {Object.keys(slotsByDate).map((date) => (
                                    <option key={date} value={date}>
                                      {new Date(date).toLocaleDateString([], {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </option>
                                  ))}
                                </select>

                                {/* Time slots grid */}
                                <div
                                  id={`time-slots-${field.name}`}
                                  className="time-slots-grid"
                                >
                                  {Object.entries(slotsByDate).map(
                                    ([date, slots]) => (
                                      <div
                                        key={date}
                                        className="date-slots mb-3"
                                      >
                                        <h6 className="mb-2 text-gray-600 font-medium">
                                          {new Date(date).toLocaleDateString(
                                            [],
                                            {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            }
                                          )}
                                        </h6>
                                        <div className="slots-grid flex flex-wrap gap-2">
                                          {slots.map((slot, idx) => {
                                            const isSelected =
                                              selectedTimeSlots[field.name]
                                                ?.timestamp === slot.timestamp;
                                            return (
                                              <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                  handleTimeSlotSelection(
                                                    field.name,
                                                    slot
                                                  )
                                                }
                                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                                  isSelected
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                                }`}
                                              >
                                                {slot.startTime} -{" "}
                                                {slot.endTime}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>

                                {selectedTimeSlots[field.name] && (
                                  <div className="selected-slot bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                                    <div className="font-medium text-blue-700">
                                      Selected time slot:
                                    </div>
                                    <div className="mt-1 text-blue-800">
                                      {selectedTimeSlots[field.name].display}
                                    </div>
                                    <button
                                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline focus:outline-none"
                                      type="button"
                                      onClick={() =>
                                        handleTimeSlotSelection(
                                          field.name,
                                          null
                                        )
                                      }
                                    >
                                      Clear selection
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {errors[field.name] && (
                            <p className="text-red-500 text-sm mt-1">
                              Please select a time slot
                            </p>
                          )}
                        </div>
                      )}
                      {/* Dropdown field */}
                      {field.type === "dropdown" && (
                        <div className="select-input">
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            {displayName}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {renderFieldComment(field)}
                          <select
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              blockingErrors[field.name]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            id={field.name}
                            {...register(field.name)}
                            onChange={(e) =>
                              handleOptionWithValidation(
                                e,
                                field.name,
                                "dropdown"
                              )
                            }
                          >
                            <option value="">Select an option</option>
                            {Object.entries(field.options)?.map(
                              ([key, option], idx) => (
                                <option
                                  key={idx}
                                  value={JSON.stringify(option)}
                                  className={
                                    option.blocks_continuation
                                      ? "text-red-500"
                                      : ""
                                  }
                                >
                                  {option.text}
                                  {option.blocks_continuation
                                    ? " (Not Eligible)"
                                    : ""}
                                  {option.extra_tax
                                    ? ` (Extra Tax: $${option.extra_tax})`
                                    : ""}
                                </option>
                              )
                            )}
                          </select>

                          {blockingErrors[field.name] && (
                            <div className="mt-2 text-sm p-2 bg-red-50 text-red-600 rounded-md">
                              {blockingErrors[field.name].message}
                            </div>
                          )}

                          {renderConditionalDropdowns(field.name)}
                        </div>
                      )}

                      {/* Radio field */}
                      {field.type === "radio" && (
                        <div className="mb-2 radio-group">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            {displayName}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {renderFieldComment(field)}
                          <div className="space-y-2">
                            {Object.entries(field.options)?.map(
                              ([key, option], idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center p-2 rounded-md ${
                                    option.blocks_continuation
                                      ? "bg-red-50"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    id={`${field.name}_${idx}`}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    name={field.name}
                                    value={JSON.stringify(option)}
                                    {...register(field.name)}
                                    onChange={(e) =>
                                      handleOptionWithValidation(
                                        e,
                                        field.name,
                                        "radio"
                                      )
                                    }
                                  />
                                  <label
                                    htmlFor={`${field.name}_${idx}`}
                                    className={`ml-2 block text-sm ${
                                      option.blocks_continuation
                                        ? "text-red-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {option.text}
                                    {option.blocks_continuation && (
                                      <span className="ml-1 text-red-600 font-medium">
                                        (Not Eligible)
                                      </span>
                                    )}
                                    {option.extra_tax && (
                                      <span className="ml-1 text-green-600">
                                        (Extra Tax: ${option.extra_tax})
                                      </span>
                                    )}
                                  </label>
                                </div>
                              )
                            )}
                          </div>

                          {blockingErrors[field.name] && (
                            <div className="mt-2 text-sm p-2 bg-red-50 text-red-600 rounded-md">
                              {blockingErrors[field.name].message}
                            </div>
                          )}
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <div className="checkbox-group">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            {displayName}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {renderFieldComment(field)}
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => {
                              const optionName = option.name || option;
                              const optionValue = option.value || option;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center p-2 rounded-md hover:bg-gray-100"
                                >
                                  <input
                                    type="checkbox"
                                    id={`${field.name}-${optionValue}`}
                                    name={field.name}
                                    value={optionValue}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    {...register(field.name)}
                                    defaultChecked={field.value?.includes(
                                      optionValue
                                    )}
                                  />
                                  <p
                                    htmlFor={`${field.name}-${optionValue}`}
                                    className="block text-sm text-gray-700"
                                    style={{ paddingLeft: "10px" }}
                                  >
                                    {optionName}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* File field */}
                      {field.type === "file" && (
                        <div className="file-upload">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            {displayName}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {renderFieldComment(field)}
                          <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                            {!files[field.name]?.name ? (
                              <>
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 48 48"
                                >
                                  <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="mt-1 flex justify-center">
                                  <label
                                    htmlFor={field.name}
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                  >
                                    <span>Upload a file</span>
                                    <input
                                      type="file"
                                      id={field.name}
                                      className="sr-only"
                                      {...register(field.name)}
                                      onChange={(e) =>
                                        handleFileChange(e, field.name, field)
                                      }
                                    />
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PDF, DOC, DOCX, TXT up to 10MB
                                </p>
                              </>
                            ) : (
                              <div className="text-left">
                                <div className="flex items-center text-sm">
                                  <svg
                                    className="flex-shrink-0 mr-2 h-5 w-5 text-green-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-gray-900 font-medium truncate">
                                    {files[field.name]?.name}
                                  </span>
                                </div>

                                {field?.calculation_fee && (
                                  <div className="mt-3 bg-blue-50 p-2 rounded-md">
                                    <p className="text-sm text-blue-700">
                                      Word Count: {wordCounts[field.name] || 0}
                                    </p>
                                    {wordCounts[field.name] > 0 && (
                                      <p className="text-sm font-medium text-blue-800 mt-1">
                                        Estimated fee: $
                                        {(wordCounts[field.name] * 0.1).toFixed(
                                          2
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <button
                                  onClick={() => {
                                    const fileInput = document.getElementById(
                                      field.name
                                    );
                                    if (fileInput) fileInput.value = "";
                                    const newFiles = { ...files };
                                    delete newFiles[field.name];
                                    setFiles(newFiles);
                                    const newWordCounts = {
                                      ...wordCounts,
                                    };
                                    delete newWordCounts[field.name];
                                    setWordCounts(newWordCounts);
                                  }}
                                  type="button"
                                  className="mt-3 text-sm text-red-600 hover:text-red-800"
                                >
                                  Remove file
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {errors[field.name] && (
                        <p className="text-red-500 text-sm mt-1">
                          This field is required
                        </p>
                      )}
                    </div>
                  );
                })}
              </form>
            </div>
            <div className="modal-footer bg-gray-50 border-t border-gray-200 p-4 flex justify-end space-x-3">
              <button
                // onClick={handleCloseModal}
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: `linear-gradient(to right, #5ca595, #6db8a8)`,
                }}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
