# Combobox

Headless accessible react combobox component (auto complete) <1000LOC

## Example

```js
import {
  ComboboxContent,
  ComboboxRoot,
  ComboboxInput,
  ComboboxOption,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxLabel,
} from "@my-headless-combobox";

<ComboboxRoot>
  <ComboboxLabel>Select a country</ComboboxLabel>
  <div className="flex gap-8">
    <ComboboxInput />
    <ComboboxTrigger>open -</ComboboxTrigger>
  </div>

  <ComboboxPortal>
    <ComboboxContent>
      <ComboboxOption value="Afghanistan">Afghanistan</ComboboxOption>
      <ComboboxOption value="Albania">Albania</ComboboxOption>
      <ComboboxOption value="Algeria">Algeria</ComboboxOption>
      <ComboboxOption value="Andorra">Andorra</ComboboxOption>
      <ComboboxOption value="Angola">Angola</ComboboxOption>
    </ComboboxContent>
  </ComboboxPortal>
</ComboboxRoot>;
```
