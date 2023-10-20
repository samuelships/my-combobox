import React from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import {
  ComboboxContent,
  ComboboxRoot,
  ComboboxInput,
  ComboboxOption,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxLabel,
} from "@/components/Combobox/Combobox";

const countryData = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas (the)",
];

export default function Combobox() {
  const [query, setQuery] = React.useState("");

  let filtered =
    query === ""
      ? countryData
      : countryData.filter((country) =>
        country.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="mx-auto w-[300px] mt-6">
      <ComboboxRoot
        onChange={() => {
          setQuery("");
        }}
      >
        <ComboboxLabel className="block text-sm font-medium leading-6 text-gray-900">
          Select country
        </ComboboxLabel>

        <div className="flex relative mt-2">
          <ComboboxInput
            className=" w-full outline-none rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          <ComboboxTrigger className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </ComboboxTrigger>
        </div>

        <ComboboxPortal>
          <ComboboxContent
            sideOffset={4}
            className="w-[300px] z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {filtered.map((country, key) => {
              return (
                <ComboboxOption
                  value={country}
                  key={key}
                  className="relative w-full cursor-default select-none py-2 pl-3 pr-9 data-[highlighted=true]:bg-indigo-600 data-[highlighted=true]:text-white"
                >
                  {(value) => {
                    return (
                      <>
                        {country}
                        {value.selected && (
                          <span
                            className={[
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                              value.highlighted
                                ? "text-white"
                                : "text-indigo-600",
                            ].join(" ")}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    );
                  }}
                </ComboboxOption>
              );
            })}
          </ComboboxContent>
        </ComboboxPortal>
      </ComboboxRoot>
    </div>
  );
}
