"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function Nav({ bottom_header_buttons = [] }) {
  const pathname = usePathname();

  return (
    <>
      {bottom_header_buttons.length > 0 &&
        bottom_header_buttons.map((button, index) => (
          <li key={index} className="menu-item">
            <a
              href={button.url}
              className={`item-link w-max ${
                pathname === button.url ? "activeMenu" : ""
              }`}
              style={{ color: button.text_color }}
            >
              {button.text}
            </a>
          </li>
        ))}
    </>
  );
}
