import React from "react";
import CardItem from "./CardItem";

const BannerCardsSection = ({ pageContent, register, watch, setValue }) => {
  if (!pageContent.banner_cards || !Array.isArray(pageContent.banner_cards)) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Banner Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pageContent.banner_cards.map((card, cardIndex) => (
          <CardItem
            key={cardIndex}
            card={card}
            cardIndex={cardIndex}
            register={register}
            watch={watch}
            setValue={setValue}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCardsSection;
