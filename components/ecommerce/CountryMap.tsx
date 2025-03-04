import React, { useMemo } from "react";
import { worldMill } from "@react-jvectormap/world";
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

interface CountryMapProps {
  countries: { countryCode: string; customers: number }[];
}

const CountryMap: React.FC<CountryMapProps> = ({ countries }) => {
  const selectedCountryCodes = useMemo(() => {
    return countries.map((country) => country.countryCode);
  }, [countries]);

  const seriesData = useMemo(() => {
    const data: Record<string, number> = {};
    countries.forEach((country) => {
      data[country.countryCode] = country.customers;
    });
    return data;
  }, [countries]);

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      selectedRegions={selectedCountryCodes}
      series={{
        regions: [
          {
            values: seriesData,
            scale: ["#FF0000"], // Use red color
            normalizeFunction: "polynomial",
          },
        ],
      }}
      regionStyle={{
        initial: {
          fill: "#D0D5DD",
          fillOpacity: 1,
          stroke: "none",
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#FF0000",
        },
        selected: {
          fill: "#c4971a",
        },
        selectedHover: {
          fill: "#CC0000",
        },
      }}
      regionLabelStyle={{
        initial: {
          fill: "#35373e",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
      }}
    />
  );
};

export default CountryMap;
