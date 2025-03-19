import React from "react";

export default function FlatTitle({ pageContent }) {
  const header_text = pageContent.header_text?.value;
  const header_description = pageContent.header_description?.value;

  return (
    <section className="flat-spacing-9">
      <div className="container">
        <div className="flat-title my-0">
          <span className="title">{header_text}</span>
          <p className="sub-title text_black-2">{header_description}</p>
        </div>
      </div>
    </section>
  );
}
