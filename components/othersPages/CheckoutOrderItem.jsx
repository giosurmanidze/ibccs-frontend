import React from "react";
import Image from "next/image";
import Link from "next/link";

const CheckoutOrderItem = ({ item, getCleanFieldName }) => {
  // Extract data from the item
  const serviceData = item.service || item;
  const serviceId = item.service_id || item.id;
  const serviceName = serviceData.name || "Unknown Service";
  const category = serviceData.category.name;
  const serviceIcon = serviceData.icon || "/placeholder-image.jpg";
  const basePrice = parseFloat(serviceData.base_price || 0).toFixed(2);
  const quantity = item.quantity || 1;

  // Extract and format fields for extra taxes
  let extraTaxFields = {};
  let hasExtraTaxes = false;

  // Helper function to extract extra tax fields
  const extractExtraTaxFields = () => {
    // Check if item has fields with extra taxes
    if (item.fields) {
      const fields =
        typeof item.fields === "string" ? JSON.parse(item.fields) : item.fields;

      fields.forEach((field) => {
        // Check if field value contains extra_tax
        if (
          field.value &&
          typeof field.value === "string" &&
          field.value.includes("extra_tax")
        ) {
          try {
            const valueObj = JSON.parse(field.value);
            if (valueObj.extra_tax) {
              extraTaxFields[field.name] = {
                name: field.name,
                value: valueObj.text,
                extra_tax: valueObj.extra_tax,
                displayName: getCleanFieldName
                  ? getCleanFieldName(field.name)
                  : field.name,
              };
              hasExtraTaxes = true;
            }
          } catch (e) {
            console.error("Error parsing field value:", e);
          }
        }
      });
    }

    // If no extra taxes found, check for price difference
    if (!hasExtraTaxes && item.total_price && serviceData.base_price) {
      const baseTotalPrice = parseFloat(serviceData.base_price) * quantity;
      const totalPrice = parseFloat(item.total_price);
      const difference = totalPrice - baseTotalPrice;

      if (difference > 0.01) {
        extraTaxFields["price_difference"] = {
          name: "price_difference",
          value: "Additional services",
          extra_tax: difference.toString(),
          displayName: "Additional services",
        };
        hasExtraTaxes = true;
      }
    }

    return { extraTaxFields, hasExtraTaxes };
  };

  // Process extra tax fields
  const {
    extraTaxFields: processedExtraTaxFields,
    hasExtraTaxes: processedHasExtraTaxes,
  } = extractExtraTaxFields();
  extraTaxFields = processedExtraTaxFields;
  hasExtraTaxes = processedHasExtraTaxes;

  // Calculate the total extra tax amount
  const totalExtraTax = hasExtraTaxes
    ? Object.values(extraTaxFields).reduce(
        (sum, field) => sum + parseFloat(field.extra_tax || 0),
        0
      )
    : 0;

  return (
    <div className="checkout-product-item bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-200">
      <div className="flex items-start p-4 gap-">
        {/* Service image and basic info */}
        <div className="flex items-start space-x-3 gap-2">
          <div className="flex-shrink-0">
            <Image
              alt={serviceName}
              src={serviceIcon}
              width={60}
              height={60}
              className="rounded-md shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-blue-600 text-lg">
              {serviceName}
            </span>
            <span className="text-sm text-gray-500">{category}</span>
          </div>
        </div>
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <h6 className="text-xs font-semibold text-gray-700 mb-2 border-b pb-1">
              Price Breakdown
            </h6>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base price:</span>
                <span className="font-medium">{basePrice} euro</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">× {quantity}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-1 mt-1">
                <span className="text-gray-700 font-semibold">Subtotal:</span>
                <span className="font-semibold">
                  {(basePrice * quantity).toFixed(2)} euro
                </span>
              </div>
            </div>
          </div>

          {/* Extra charges */}
          {hasExtraTaxes && (
            <div className="bg-white p-3 rounded-md shadow-sm">
              <h6 className="text-xs font-semibold text-blue-700 mb-2 border-b border-blue-100 pb-1">
                Extra Charges
              </h6>
              <div className="space-y-1 text-sm">
                {Object.entries(extraTaxFields).map(([fieldName, field]) => (
                  <div
                    key={fieldName}
                    className="flex justify-between items-center"
                  >
                    <span className="text-blue-600  max-w-[170px]">
                      {field.displayName}:
                    </span>
                    <span className="text-green-600 font-medium">
                      +{Number(field.extra_tax).toFixed(2)} euro
                    </span>
                  </div>
                ))}

                {/* Show subtotal if multiple charges */}
                {Object.keys(extraTaxFields).length > 1 && (
                  <div className="flex justify-between items-center border-t border-gray-200 pt-1 mt-1">
                    <span className="text-gray-700 font-medium">
                      Extra charges:
                    </span>
                    <span className="text-green-600 font-medium">
                      +{totalExtraTax.toFixed(2)} euro
                    </span>
                  </div>
                )}

                {/* Show calculation with quantity if > 1 */}
                {quantity > 1 && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-700 font-medium">
                      Extra × {quantity}:
                    </span>
                    <span className="text-green-600 font-medium">
                      +{(totalExtraTax * quantity).toFixed(2)} euro
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Total for this item */}
        <div className="mt-3 bg-blue-50 p-2 rounded-md shadow-sm">
          <div className="flex justify-between items-center font-medium">
            <span className="text-gray-800">Item Total:</span>
            <span className="text-blue-700 text-lg">
              {item.total_price ||
                (
                  parseFloat(basePrice) * quantity +
                  totalExtraTax * quantity
                ).toFixed(2)}{" "}
              euro
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component for checkout order items list
const CheckoutOrderItems = ({ cartProducts, getCleanFieldName }) => {
  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
        <p className="text-gray-500">Your cart is empty</p>
        <Link
          href="/shop-default"
          className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Explore Services
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-products space-y-4">
      <h5 className="font-medium text-lg mb-4">
        Order Summary ({cartProducts.length} items)
      </h5>

      {cartProducts.map((item, index) => (
        <CheckoutOrderItem
          key={index}
          item={item}
          getCleanFieldName={
            getCleanFieldName || ((name) => name.split("_")[0])
          }
        />
      ))}
    </div>
  );
};

export default CheckoutOrderItems;
