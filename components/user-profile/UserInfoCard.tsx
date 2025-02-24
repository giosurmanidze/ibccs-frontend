"use client";
import { useModal } from "@/hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const ALL_SOCIAL_PLATFORMS = ["whatsapp", "telegram", "viber", "botim"];

export default function UserInfoCard({ user }) {
  const { isOpen, openModal, closeModal } = useModal();

  const [socialPlatforms, setSocialPlatforms] = useState(
    user?.platforms_number ? JSON.parse(user.platforms_number) : {}
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

  const queryClient = useQueryClient();

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

      console.log(filteredSocialLinks);

      const formData = {
        ...data,
        social_links: JSON.stringify(filteredSocialLinks),
      };

      const response = await axiosInstance.post(
        `users/update/${user?.id}`,
        formData
      );

      queryClient.invalidateQueries(["user", user?.id]);
      toast.success("Profile updated successfully");
      closeModal();
    } catch (error) {
      if (error.response?.data.errors?.email) {
        toast.error("The email has already been taken");
      }
    }
  };

  useEffect(() => {
    if (user?.platforms_number) {
      const platforms = JSON.parse(user.platforms_number);
      setSocialPlatforms(platforms);
    }
  }, [user?.platforms_number]);

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("lastname", user.lastname);
      setValue("phone_number", user.phone_number);
      setValue("email", user.email);

      if (user.platforms_number) {
        const platforms = JSON.parse(user.platforms_number);
        Object.entries(platforms).forEach(([platform, value]) => {
          setValue(platform, value);
        });
      }
    }
  }, [user, setValue]);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.lastname}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.phone_number}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
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
                  {Object.entries(socialPlatforms).map(([platform, value]) => (
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
                  ))}

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
                  {/* <div>
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
                  </div>
                  <div>
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
                  </div> */}
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
  );
}
