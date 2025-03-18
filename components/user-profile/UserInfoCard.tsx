"use client";
import axiosInstance from "@/config/axios";
import { useState, useEffect, useRef } from "react";
import { WhatsApp } from "@/icons/WhatsApp";
import { Telegram } from "@/icons/Telegram";
import { Botim } from "@/icons/Botim";
import { Viber } from "@/icons/Viber";
import { toast, ToastContainer } from "react-toastify";

export default function MyProfile({ fetchUserData }) {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone_number: "",
    Identification_number: "",
    passport_number: "",
    whatsapp: "",
    telegram: "",
    viber: "",
    botim: "",
    organization_name: "",
  });

  const isOrganization = !!formData.organization_name;

  const activePlatforms = {
    whatsapp: formData.whatsapp,
    telegram: formData.telegram,
    viber: formData.viber,
    botim: formData.botim,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance("/user");
        const userData = response.data.user;

        if (response.data.user.id) {
          setUserId(response.data.user.id);
        }
        if (userData.platforms_number) {
          try {
            const platforms = JSON.parse(userData.platforms_number);
            if (platforms.whatsapp) userData.whatsapp = platforms.whatsapp;
            if (platforms.telegram) userData.telegram = platforms.telegram;
            if (platforms.viber) userData.viber = platforms.viber;
            if (platforms.botim) userData.botim = platforms.botim;
          } catch (e) {
            console.error("Error parsing platforms:", e);
          }
        }
        if (userData.photo) {
          setPhotoPreview(userData.photo);
        }

        setFormData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        !file.type.match("image/jpeg") &&
        !file.type.match("image/png") &&
        !file.type.match("image/jpg")
      ) {
        alert("Please select a valid image file (JPEG, JPG, or PNG)");
        return;
      }

      setProfilePhoto(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (!userId) {
        throw new Error("User ID not found");
      }

      const formDataToSend = new FormData();

      const platforms = {
        whatsapp: formData.whatsapp || null,
        telegram: formData.telegram || null,
        viber: formData.viber || null,
        botim: formData.botim || null,
      };

      const hasPlatformData = Object.values(platforms).some(
        (val) => val !== null && val !== ""
      );

      Object.keys(formData).forEach((key) => {
        if (
          key !== "whatsapp" &&
          key !== "telegram" &&
          key !== "viber" &&
          key !== "botim" &&
          key !== "photo" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (hasPlatformData) {
        formDataToSend.append("platforms_number", JSON.stringify(platforms));
      }

      if (profilePhoto) {
        formDataToSend.append("photo", profilePhoto);
      }
      await axiosInstance.post(`/users/update/${userId}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchUserData();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const platformIcons = {
    whatsapp: <WhatsApp height={30} width={30} />,
    telegram: <Telegram height={30} width={30} />,
    viber: <Viber height={30} width={30} />,
    botim: <Botim height={30} width={30} />,
  };

  return (
    <section className="!py-10 my-auto dark:bg-gray-900">
      <ToastContainer />
      <div className="lg:w-[80%] md:w-[90%] w-[96%] mx-auto flex gap-4">
        <div className="lg:w-[88%] sm:w-[88%] w-full mx-auto shadow-2xl p-4 rounded-xl h-fit self-center dark:bg-gray-800/40">
          <div className="">
            <h1 className="!lg:text-3xl !md:text-2xl !text-xl font-serif font-extrabold !mb-2 dark:text-white">
              My Account
            </h1>
            <h2 className="text-grey !text-sm !mb-4 dark:text-gray-400">
              {isOrganization ? "Organization Profile" : "Personal Profile"}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="relative group">
                    <div
                      className="w-[141px] h-[141px] bg-blue-300/20 rounded-full bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: photoPreview
                          ? `url(${photoPreview})`
                          : "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw4fHxwcm9maWxlfGVufDB8MHx8fDE3MTEwMDM0MjN8MA&ixlib=rb-4.0.3&q=80&w=1080')",
                      }}
                    >
                      <div className="absolute bottom-1 right-1 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                        <input
                          type="file"
                          name="photo"
                          id="upload_profile"
                          accept="image/jpeg,image/png,image/jpg"
                          hidden
                          ref={fileInputRef}
                          onChange={handlePhotoChange}
                        />

                        <label
                          htmlFor="upload_profile"
                          className="cursor-pointer"
                        >
                          <svg
                            data-slot="icon"
                            className="w-5 h-5 text-blue-700"
                            fill="none"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                            ></path>
                          </svg>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 !mt-4 !md:mt-0">
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(activePlatforms).some(
                        ([_, value]) => value
                      ) ? (
                        Object.entries(activePlatforms).map(
                          ([platform, value]) =>
                            value && (
                              <div
                                key={platform}
                                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
                              >
                                <div className="flex h-8 w-8 min-w-8 items-center justify-center text-sm">
                                  {platformIcons[platform]}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {value}
                                </span>
                              </div>
                            )
                        )
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No contact platforms added yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {isOrganization ? (
                  <div className="flex flex-col !lg:flex-row !gap-2 justify-center w-full">
                    <div className="w-full !mb-4 !mt-6">
                      <label
                        htmlFor="organization_name"
                        className="!mb-2 block dark:text-gray-300"
                      >
                        Organization Name
                      </label>
                      <input
                        type="text"
                        id="organization_name"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleInputChange}
                        className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="Organization Name"
                      />
                    </div>
                    <div className="w-full !mb-4 !lg:mt-6">
                      <label
                        htmlFor="Identification_number"
                        className="!mb-2 block dark:text-gray-300"
                      >
                        Organization ID Number
                      </label>
                      <input
                        type="text"
                        id="Identification_number"
                        name="Identification_number"
                        value={formData.Identification_number}
                        onChange={handleInputChange}
                        className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                        placeholder="Organization ID Number"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col !lg:flex-row !gap-2 justify-center w-full">
                      <div className="w-full !mb-4 !mt-6">
                        <label
                          htmlFor="name"
                          className="!mb-2 block dark:text-gray-300"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                          placeholder="First Name"
                        />
                      </div>
                      <div className="w-full !mb-4 !lg:mt-6">
                        <label
                          htmlFor="lastname"
                          className="block dark:text-gray-300"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastname"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col !lg:flex-row !gap-2 justify-center w-full">
                      <div className="w-full !mb-4">
                        <label
                          htmlFor="passport_number"
                          className="!mb-2 block dark:text-gray-300"
                        >
                          Passport Number
                        </label>
                        <input
                          type="text"
                          id="passport_number"
                          name="passport_number"
                          value={formData.passport_number}
                          onChange={handleInputChange}
                          className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                          placeholder="Passport Number"
                        />
                      </div>
                      <div className="w-full !mb-4">
                        <label
                          htmlFor="Identification_number"
                          className="!mb-2 block dark:text-gray-300"
                        >
                          ID Number
                        </label>
                        <input
                          type="text"
                          id="Identification_number"
                          name="Identification_number"
                          value={formData.Identification_number}
                          onChange={handleInputChange}
                          className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                          placeholder="Identification Number"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common fields for both account types */}
                <div className="flex flex-col !lg:flex-row !gap-2 justify-center w-full">
                  <div className="w-full !mb-4">
                    <label
                      htmlFor="email"
                      className="!mb-2 block dark:text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="w-full !mb-4">
                    <label
                      htmlFor="phone_number"
                      className="!mb-2 block dark:text-gray-300"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Communication platforms section */}
                <h3 className="text-lg font-medium mt-6 mb-4 dark:text-white">
                  Communication Platforms
                </h3>
                <div className="flex flex-col !lg:flex-row !gap-2 justify-center w-full">
                  <div className="w-full !mb-4">
                    <label
                      htmlFor="whatsapp"
                      className="!mb-2 block dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <WhatsApp height={30} width={30} />
                        WhatsApp
                      </div>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      placeholder="WhatsApp Number"
                    />
                  </div>
                  <div className="w-full !mb-4">
                    <label
                      htmlFor="telegram"
                      className="!mb-2 block dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <Telegram height={30} width={30} />
                        Telegram
                      </div>
                    </label>
                    <input
                      type="tel"
                      id="telegram"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleInputChange}
                      className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      placeholder="Telegram Number"
                    />
                  </div>
                </div>

                <div className="flex flex-col !lg:flex-row !gap-2 justify-center w-full">
                  <div className="w-full !mb-4">
                    <label
                      htmlFor="viber"
                      className="!mb-2 block dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <Viber height={30} width={30} />
                        Viber
                      </div>
                    </label>
                    <input
                      type="tel"
                      id="viber"
                      name="viber"
                      value={formData.viber}
                      onChange={handleInputChange}
                      className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      placeholder="Viber Number"
                    />
                  </div>
                  <div className="w-full !mb-4">
                    <label
                      htmlFor="botim"
                      className="!mb-2 block dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2">
                        <Botim height={30} width={30} />
                        Botim
                      </div>
                    </label>
                    <input
                      type="tel"
                      id="botim"
                      name="botim"
                      value={formData.botim}
                      onChange={handleInputChange}
                      className="!mt-2 !p-4 w-full border-2 rounded-lg dark:text-gray-200 dark:border-gray-600 dark:bg-gray-800"
                      placeholder="Botim Number"
                    />
                  </div>
                </div>

                <div className="flex flex-col bg-black text-white !lg:flex-row !gap-2 justify-center w-full rounded-lg mt-6">
                  <button
                    type="submit"
                    className="w-full !p-4 flex justify-center items-center"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white !mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
