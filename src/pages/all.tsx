import SingleSelect from "@/components/demos/SingleSelect";
import MultiSelect from "@/components/demos/MultiSelect";

export default function AllPage() {
  return (
    <div className="flex flex-col gap-y-[300px]">
      <SingleSelect />
      <MultiSelect />
    </div>
  )
}
