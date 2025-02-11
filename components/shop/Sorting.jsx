"use client";
import { sortingOptions } from "@/data/shop";
import React, { useEffect, useState } from "react";

export default function Sorting({ category, setFinalSorted }) {
  const [selectedOptions, setSelectedOptions] = useState(sortingOptions[0]);

  // useEffect(() => {
  //   if (selectedOptions.text == "Default") {
  //     setFinalSorted([...category]);
  //   } else if (selectedOptions.text == "Alphabetically, A-Z") {
  //     setFinalSorted(
  //       [...category].sort((a, b) => a.title.localeCompare(b.title))
  //     );
  //   } else if (selectedOptions.text == "Alphabetically, Z-A") {
  //     setFinalSorted(
  //       [...category].sort((a, b) => b.title.localeCompare(a.title))
  //     );
  //   } else if (selectedOptions.text == "Price, low to high") {
  //     setFinalSorted([...category].sort((a, b) => a.price - b.price));
  //   } else if (selectedOptions.text == "Price, high to low") {
  //     setFinalSorted([...category].sort((a, b) => b.price - a.price));
  //   }
  // }, [category, selectedOptions]);

  return (
    <>
      {" "}
      <div className="btn-select">
        <span className="text-sort-value">{selectedOptions.text}</span>
        <span className="icon icon-arrow-down" />
      </div>
      <div className="dropdown-menu">
        {sortingOptions.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedOptions(item)}
            className={`select-item ${item == selectedOptions ? "active" : ""}`}
          >
            <span className="text-value-item">{item.text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
