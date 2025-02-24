"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import * as yup from "yup";

import React, { useCallback, useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/button/Button";
import { useGetUsers } from "@/hooks/useGetUsers";
import Image from "next/image";
import axiosInstance from "@/config/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUser } from "@/hooks/useGetUser";

const ALL_SOCIAL_PLATFORMS = ["whatsapp", "telegram", "viber", "botim"];

export default function BasicTables() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const { data: users } = useGetUsers();
  const { data: AuthUser } = useGetUser();
  const queryClient = useQueryClient();

  const [socialPlatforms, setSocialPlatforms] = useState(
    selectedUser?.platforms_number
      ? JSON.parse(selectedUser?.platforms_number)
      : {}
  );

  const availablePlatforms = ALL_SOCIAL_PLATFORMS.filter(
    (platform) => !Object.keys(socialPlatforms).includes(platform)
  );

  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    lastname: yup.string().required("Lastname is required"),
    email: yup.string().required("Email is required"),
    phone_number: yup.string().required("Phone number is required"),

    ...Object.keys(socialPlatforms || {}).reduce(
      (acc, platform) => ({
        ...acc,
        [platform]: yup.string().nullable(),
      }),
      {}
    ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const openModal = useCallback((user) => {
    setValue("name", user.name);
    setValue("lastname", user.lastname);
    setValue("phone_number", user.phone_number);
    setValue("email", user.email);
    setSelectedUser(user);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    reset();
  }, [reset]);

  const handleSave = async (data) => {
    try {
      const socialLinks = {
        whatsapp: data.whatsapp || "",
        telegram: data.telegram || "",
        viber: data.viber || "",
        botim: data.botim || "",
      };

      const filteredSocialLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([_, value]) => value)
      );

      const formData = {
        ...data,
        social_links: JSON.stringify(filteredSocialLinks),
      };

      const response = await axiosInstance.post(
        `users/update/${selectedUser.id}?from_user_list`,
        formData
      );

      closeModal();
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile updated successfully");
    } catch (error) {
      if (error.response?.data.errors?.email) {
        toast.error("The email has already been taken");
      }
    }
  };

  useEffect(() => {
    if (selectedUser?.platforms_number) {
      const platforms = JSON.parse(selectedUser.platforms_number);
      setSocialPlatforms(platforms);
    }
  }, [selectedUser?.platforms_number]);

  useEffect(() => {
    if (selectedUser.platforms_number) {
      const platforms = JSON.parse(selectedUser.platforms_number);
      Object.entries(platforms).forEach(([platform, value]) => {
        setValue(platform, value);
      });
    }
  }, [selectedUser, setValue]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Users List" />
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div class="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900 p-4">
          <div>
            <button
              id="dropdownActionButton"
              data-dropdown-toggle="dropdownAction"
              class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              type="button"
            >
              <span class="sr-only">Action button</span>
              Action
              <svg
                class="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            <div
              id="dropdownAction"
              class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul
                class="py-1 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownActionButton"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Reward
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Promote
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Activate account
                  </a>
                </li>
              </ul>
              <div class="py-1">
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                  Delete User
                </a>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex p-2 items-center  ps-3 pointer-events-none">
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="table-search-users"
              class="block ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search for users"
            />
          </div>
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="p-4">
                <div class="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label for="checkbox-all-search" class="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th scope="col" class="px-6 py-3">
                Name
              </th>
              <th scope="col" class="px-6 py-3">
                Role
              </th>
              <th scope="col" class="px-6 py-3">
                Phone number
              </th>
              <th scope="col" class="px-6 py-3">
                Edit
              </th>
              <th scope="col" class="px-6 py-3">
                Delete
              </th>
              <th scope="col" class="px-6 py-3">
                Deactivate
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr
                key={user.id}
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td class="w-4 p-4">
                  <div class="flex items-center">
                    <input
                      id="checkbox-table-search-1"
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label for="checkbox-table-search-1" class="sr-only">
                      checkbox
                    </label>
                  </div>
                </td>
                <th
                  scope="row"
                  class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <div className="w-14 h-14 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                    <Image
                      width={60}
                      height={60}
                      src={`${process.env.NEXT_PUBLIC_STORAGE_URL}${user.photo}`}
                      alt="user"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div class="ps-3">
                    <div class="text-base font-semibold">
                      {user.name} {user.lastname}
                    </div>
                    <div class="font-normal text-gray-500">{user.email}</div>
                  </div>
                </th>
                <td class="px-6 py-4">{user.role.name}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center">{user?.phone_number}</div>
                </td>
                <td class="px-6 py-4">
                  <button
                    href="#"
                    type="button"
                    disabled={AuthUser?.role.name !== "Admin"}
                    class="font-medium text-green-600 dark:text-green-500 hover:underline"
                    onClick={() => openModal(user)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke={` ${
                        AuthUser?.role.name !== "Admin"
                          ? "grey"
                          : "currentColor"
                      }`}
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                </td>
                <td class="px-6 py-4">
                  <a
                    href="#"
                    type="button"
                    class="font-medium text-red-600 dark:text-red-500 hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke={` ${
                        AuthUser?.role.name !== "Admin"
                          ? "grey"
                          : "currentColor"
                      }`}
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </a>
                </td>
                <td class="px-6 py-4">
                  <a
                    href="#"
                    type="button"
                    class="font-medium text-orange-600 dark:text-orange-500 hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke={` ${
                        AuthUser?.role.name !== "Admin"
                          ? "grey"
                          : "currentColor"
                      }`}
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                      />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] m-4"
        >
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Personal Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update your details to keep your profile up-to-date.
              </p>
            </div>
            <form onSubmit={handleSubmit(handleSave)} className="flex flex-col">
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Social Links
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    {Object.entries(socialPlatforms).map(
                      ([platform, value]) => (
                        <div key={platform} className="mb-5">
                          <label
                            htmlFor={platform}
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {platform}
                          </label>
                          <input
                            type="text"
                            id={platform}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder={`Enter ${platform} number`}
                            {...register(platform)}
                          />
                          <p className="error">{errors[platform]?.message}</p>
                        </div>
                      )
                    )}

                    {availablePlatforms.map((platform) => (
                      <div key={platform} className="mb-5">
                        <button
                          type="button"
                          onClick={() => {
                            setSocialPlatforms((prev) => ({
                              ...prev,
                              [platform]: "",
                            }));
                            setValue(platform, "");
                          }}
                          className="flex items-center gap-2 p-2.5 w-full border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span className="capitalize">Add {platform}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Personal Information
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="mb-5">
                      <label
                        for="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Firstname
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Please enter firstname"
                        {...register("name")}
                      />
                      <p className="error">{errors.name?.message}</p>
                    </div>
                    <div className="mb-5">
                      <label
                        for="lastname"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Lastname
                      </label>
                      <input
                        type="lastname"
                        id="lastname"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Please enter lastname"
                        {...register("lastname")}
                      />
                      <p className="error">{errors.lastname?.message}</p>
                    </div>
                    <div className="mb-5">
                      <label
                        for="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Please enter email"
                        {...register("email")}
                      />
                      <p className="error">{errors.email?.message}</p>
                    </div>
                    <div className="mb-5">
                      <label
                        for="phone_number"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Phone number
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Please enter Phone number"
                        {...register("phone_number")}
                      />
                      <p className="error">{errors.phone_number?.message}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
