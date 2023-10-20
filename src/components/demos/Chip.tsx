import Cross from "@/assets/Cross";
import React from "react";

const Chip = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span"> & { onDelete: () => void }>((props, forwardRef) => {
  const { children, ...rest } = props;

  return (
    <span className="flex gap-x-1 items-center h-6 px-2 rounded-md bg-[#FAFAFA] ring-1 ring-[#F4F4F5] text-xs leading-4 font-medium text-[#71717A]" ref={forwardRef} {...rest} >
      {children}
      <Cross className="h-full text-[#71717A]" onClick={props.onDelete} />
    </span>
  )
})
export default Chip;
