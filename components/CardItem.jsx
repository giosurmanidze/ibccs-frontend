import React from "react";
import ColorField from "./ColorField";

const CardItem = ({ card, cardIndex, register, watch, setValue }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-medium mb-4">Card {cardIndex + 1}</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <input
            type="text"
            {...register(`banner_cards.${cardIndex}.top_text.value`)}
            defaultValue={card.top_text?.value}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
          />
          <input
            type="hidden"
            {...register(`banner_cards.${cardIndex}.top_text.type`)}
            value="text"
          />
        </div>

        <ColorField
          label="Top Text Color"
          colorFieldName={`banner_cards.${cardIndex}.top_text_color.value`}
          typeFieldName={`banner_cards.${cardIndex}.top_text_color.type`}
          defaultValue={card.top_text_color?.value}
          register={register}
          watch={watch}
          setValue={setValue}
        />

        <div>
          <input
            type="text"
            {...register(`banner_cards.${cardIndex}.header_text.value`)}
            defaultValue={card.header_text?.value}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
          />
          <input
            type="hidden"
            {...register(`banner_cards.${cardIndex}.header_text.type`)}
            value="text"
          />
        </div>

        <ColorField
          label="Header Text Color"
          colorFieldName={`banner_cards.${cardIndex}.header_text_color.value`}
          typeFieldName={`banner_cards.${cardIndex}.header_text_color.type`}
          defaultValue={card.header_text_color?.value}
          register={register}
          watch={watch}
          setValue={setValue}
        />

        <div>
          <textarea
            {...register(`banner_cards.${cardIndex}.smaller_text.value`)}
            defaultValue={card.smaller_text?.value}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700"
            rows={3}
          />
          <input
            type="hidden"
            {...register(`banner_cards.${cardIndex}.smaller_text.type`)}
            value="text"
          />
        </div>

        <ColorField
          label="Description Text Color"
          colorFieldName={`banner_cards.${cardIndex}.smaller_text_color.value`}
          typeFieldName={`banner_cards.${cardIndex}.smaller_text_color.type`}
          defaultValue={card.smaller_text_color?.value}
          register={register}
          watch={watch}
          setValue={setValue}
        />
      </div>
    </div>
  );
};

export default CardItem;
