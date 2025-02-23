import GridShape from "@/components/common/GridShape";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div
            className="lg:w-1/2 w-full h-full lg:grid items-center hidden relative bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{
              backgroundImage: `url('./images/collections/established.jpg')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative items-center justify-center flex z-10 h-full w-full">
              <div className="absolute inset-0 opacity-20">
                <GridShape />
              </div>
              <div className="flex flex-col items-center max-w-xs relative z-20 px-6">
                <h1 className="text-center text-gray-100 text-3xl font-light leading-relaxed">
                  Tailor-Made Corporate Solutions
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
