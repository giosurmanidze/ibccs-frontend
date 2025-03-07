"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import Image from "next/image";
import { WhatsApp } from "@/icons/WhatsApp";
import { Telegram } from "@/icons/Telegram";
import { Botim } from "@/icons/Botim";
import { Viber } from "@/icons/Viber";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";

export default function UserMetaCard({ user, fetchUserData }) {

  const socialPlatforms = user?.platforms_number
    ? JSON.parse(user.platforms_number)
    : [];


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("photo", file);

        const response = await axiosInstance.post(
          `users/update/${user?.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fetchUserData();
      } catch (error) {
        toast.error("Failed to update photo");
      }
    }
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative group">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <Image
                  width={80}
                  height={80}
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL}${user?.photo}`}
                  alt="user"
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>
              </div>
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name} {user?.lastname}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 flex-col ml-auto sm:ml-0 md:ml-auto">
              {Object.entries(socialPlatforms || {}).map(
                ([platform, phone]) => (
                  <div
                    key={platform}
                    className="flex items-center gap-2 w-full sm:w-[150px] md:w-[180px] lg:w-[200px] xl:w-[150px]"
                  >
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                      {platform === "whatsapp" ? (
                        <WhatsApp />
                      ) : platform === "telegram" ? (
                        <Telegram />
                      ) : platform === "botim" ? (
                        <Botim />
                      ) : platform === "viber" ? (
                        <Viber />
                      ) : (
                        ""
                      )}
                    </div>
                    <span className="text-sm sm:text-base truncate">
                      {/* {phone} */}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
