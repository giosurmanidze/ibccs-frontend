import React from "react";
import CardItem from "./CardItem";

const BannerCardsSection = ({ pageContent, register, watch, setValue }) => {
  const bannerCards =
    watch("banner_cards") ||
    (pageContent.banner_cards && Array.isArray(pageContent.banner_cards)
      ? [...pageContent.banner_cards]
      : []);

  const addNewBannerCard = () => {
    const currentCards = bannerCards || [];

    const newCard = {
      top_text: {
        type: "text",
        value: `No ${currentCards.length + 1}`,
      },
      top_text_color: {
        type: "color",
        value: "#fcfcfc",
      },
      header_text: {
        type: "text",
        value: "New Card",
      },
      header_text_color: {
        type: "color",
        value: "#fcfcfc",
      },
      smaller_text: {
        type: "text",
        value: "Add your description here",
      },
      smaller_text_color: {
        type: "color",
        value: "#fcfcfc",
      },
    };

    setValue("banner_cards", [...currentCards, newCard]);
  };

  const removeBannerCard = (indexToRemove) => {
    const updatedCards = bannerCards.filter(
      (_, index) => index !== indexToRemove
    );
    setValue("banner_cards", updatedCards);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Banner Cards</h2>
        <button
          type="button"
          onClick={addNewBannerCard}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Add New Card
        </button>
      </div>

      {bannerCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bannerCards.map((card, cardIndex) => (
            <div key={cardIndex} className="relative">
              <CardItem
                card={card}
                cardIndex={cardIndex}
                register={register}
                watch={watch}
                setValue={setValue}
              />
              {bannerCards.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBannerCard(cardIndex)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove Card"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No banner cards. Click Add New Card to create one.
        </div>
      )}
    </div>
  );
};

export default BannerCardsSection;
