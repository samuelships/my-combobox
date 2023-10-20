import React from "react";
import {
  ComboboxContent,
  ComboboxRoot,
  ComboboxInput,
  ComboboxOption,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxLabel,
  ComboboxAnchor
} from "@/components/Combobox/Combobox";

import UserIcon from "@/assets/UserIcon";
import CheckIcon from "@/assets/CheckIcon";
import Chip from "./Chip";

const characters = [
  "Peter Parker",
  "Mary Jane",
  "Norman Osborn",
  "Ben Parker",
  "Billy's Mom",
  "Harry Osborn",
  "Flash Thompson",
  "Jonah James",
  "Betty Brant",
  "Bone Saw McGraw",
  "Punk Rock Girl",
  "Fireman",
  "Hoffman",
  "Houseman",
  "Nurse",
  "Marine Corp",
];

export default function MultiSelect() {
  const inputRef = React.useRef(null);
  const [query, setQuery] = React.useState("");
  const [value, setValue] = React.useState<Array<string> | string>([]);
  const [open, setOpen] = React.useState(false);

  let filtered =
    query === ""
      ? characters
      : characters.filter((character) =>
        character.toLowerCase().includes(query.toLowerCase())
      );

  const removeValue = React.useCallback((newValue: string) => {
    setValue((value as Array<string>).filter((val) => val != newValue));
  }, [value]);

  return (
    <div className="mx-auto w-[550px] mt-6">
      <ComboboxRoot
        open={open}
        onOpenChange={(open) => {
          setQuery("");
          setOpen(open);
        }}
        value={value}
        multiple={true}
        onChange={(value) => {
          setValue(value);
        }}
      >
        <ComboboxLabel className="block text-sm leading-5 font-medium text-[#71717A]">
          Select a character *
        </ComboboxLabel>

        <div className="flex relative mt-2">
          <ComboboxAnchor asChild>
            <div className={[
              "w-full flex items-center gap-x-2 px-3 h-10 bg-white shadow-[0_1px_0_2px_rgba(0,0,0,0.05)] rounded-lg bg-clip-border",
              open && "ring-2 ring-[#1D4ED8]",
              !open && "ring-1 ring-[#F4F4F5]"

            ].join(" ")}>
              <UserIcon className="fill-[#71717A]" />

              {Array.isArray(value) && value.length > 0 && <div className="flex gap-x-2">
                {value.slice(0, 2).map((val, key) => <Chip key={key} onDelete={() => removeValue(val)}>{val.split(" ")[0]}</Chip>)}
              </div>
              }

              {Array.isArray(value) && value.length > 2 && <span className="text-xs leading-4 font-medium text-[#A1A1AA]">+{value.length - 2} more</span>}

              <ComboboxInput
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    setQuery("");
                  } else if (e.key == "Backspace") {
                    const inputNode = inputRef.current as unknown as HTMLInputElement;
                    if (!inputNode) return
                    if (inputNode.value.trim() == "") {
                      const newValues = [...value];
                      newValues.pop()
                      setValue(newValues)
                      console.log("its empty")
                    }
                  }
                }}
                onChange={(e) => {
                  setQuery(e.currentTarget.value);
                }}
                className="flex-auto h-full ring-0 outline-none placeholder:text-sm placeholder:text-[#A1A1AA] placeholder:leading-5 text-[#71717A] text-sm"
                placeholder="Placeholder"
              />

              <ComboboxTrigger className="h-full pl-1 flex items-center">
                <span className="inline-flex items-center px-2 text-xs leading-4 text-[#71717A] bg-[#FAFAFA] ring-1 ring-[#E4E4E7] rounded-full">⌘K</span>
              </ComboboxTrigger>
            </div>

          </ComboboxAnchor>
        </div>

        <ComboboxPortal>
          <ComboboxContent
            sideOffset={12}
            className="w-[550px] z-10 mt-1 max-h-[200px] overflow-auto rounded-lg bg-white py-1 shadow-xl ring-1 ring-[#F4F4F5] focus:outline-none wil-change-[transform, opacity] data-[open=true]:animate-slideDownAndFade data-[open=false]:animate-slideUpAndFade"
          >
            {filtered.map((country, key) => {
              return (
                <ComboboxOption
                  value={country}
                  key={key}
                  className="flex items-center gap-x-2 w-full h-10 select-none py-2 pl-3 pr-9 data-[highlighted=true]:bg-[#FAFAFA] text-[#3F3F46] text-sm leading-5"
                >
                  {(value) => {
                    return (
                      <>
                        <div className={[
                          "flex justify-center items-center w-4 h-4 rounded",
                          value.selected && "bg-[#1D4ED8]",
                          !value.selected && "bg-white ring-1 ring-[#F4F4F5] shadow-[0_1px_0_2px_rgba(0,0,0,0.05)]"
                        ].join(" ")}>
                          {value.selected && <CheckIcon className="text-white" />}
                        </div>
                        {country}
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
