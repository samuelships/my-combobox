import React from "react";
import { useId } from "@radix-ui/react-id";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Primitive } from "@radix-ui/react-primitive";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Portal as PortalPrimitive } from "@radix-ui/react-portal";
import { Presence } from "@radix-ui/react-presence";
import * as PopperPrimitive from "@radix-ui/react-popper";
import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import { createContext, createRefCollection, useLayoutWatch } from "./utils";

const [CollectionItem, CollectionProvider, useCollection] = createRefCollection<
  ComboboxOptionElement,
  ComboboxOptionProps
>();

type Value = string | Array<string>;

type ComboboxContextType = {
  value?: Value,
  defaultValue?: Value,
  onValueChange: (value: string) => void;

  open: boolean;
  onOpenChange(value: boolean): void;
  onOpenToggle: () => void;

  highlightedOption?: string;
  onHighlightedOptionChange: (value: string) => void;

  contentId: string;
  inputId: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<ComboboxContentElement>;
  inputRef: React.RefObject<HTMLInputElement>;

  setCurrentHighlightedToValue: () => void;
  multiple?: boolean;
};

const [ComboboxProvider, useComboboxContext] =
  createContext<ComboboxContextType>();

//-- Root
type ComboboxRootProps = React.PropsWithChildren<{
  value?: Value,
  defaultValue?: Value,
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  onChange?: (value: Value) => void;
  multiple?: boolean
}>;

export function ComboboxRoot(props: ComboboxRootProps) {
  const {
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    value: valueProp,
    defaultValue,
    onChange,
    multiple = false
  } = props;

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<ComboboxContentElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const contentId = `combobox-content-${useId()}`;
  const inputId = `combobox-input-${useId()}`;

  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [value, setValue] = useControllableState<Value>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange,
  });

  const [highlightedOption, setHighlightedOption] =
    useControllableState<string>({});

  const onValueChange = React.useCallback((newValue: string | undefined) => {
    if (!newValue) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const final = currentValues.includes(newValue) ? currentValues.filter((val) => val != newValue) : [...currentValues, newValue];
      setValue(final);
    } else {
      setValue(newValue);
    }
  }, [multiple, setValue, value])

  return (
    <ComboboxProvider
      value={{
        multiple: multiple,
        triggerRef,
        contentRef,
        inputRef,
        contentId,
        inputId,
        open,
        onOpenChange: setOpen,
        onOpenToggle: React.useCallback(() => {
          setOpen((open) => !open);
        }, [setOpen]),
        value,
        defaultValue,
        onValueChange,
        highlightedOption,
        onHighlightedOptionChange: setHighlightedOption,
        setCurrentHighlightedToValue: React.useCallback(() => {
          onValueChange(highlightedOption)
        }, [highlightedOption, onValueChange]),
      }}
    >
      <CollectionProvider>
        <PopperPrimitive.Root>{children} </PopperPrimitive.Root>
      </CollectionProvider>
    </ComboboxProvider>
  );
}

// -- Content
type ComboboxContentElement = React.ElementRef<typeof PopperPrimitive.Content>;
type PrimitivePopperProps = React.ComponentProps<
  typeof PopperPrimitive.Content
>;
type ComboboxContentProps = PrimitivePopperProps;
type DismissableLayerProps = React.ComponentProps<typeof DismissableLayer>;

const ComboboxContent = React.forwardRef<
  ComboboxContentElement,
  ComboboxContentProps
>((props, forwardRef) => {
  type PointerDownOutside = NonNullable<
    DismissableLayerProps["onPointerDownOutside"]
  >;
  const defaultId = `combobox-popper-${useId()}`;
  const context = useComboboxContext("ComboboxContent");
  const contentRef = context.contentRef;
  const composedRef = useComposedRefs(forwardRef, contentRef);

  const onPointerDownOutside = React.useCallback<PointerDownOutside>(
    (e) => {
      const input = context.inputRef.current;
      const trigger = context.triggerRef.current;

      const target = e.target as HTMLElement;
      if (!target) return;

      const contains = [input, trigger].some((node) =>
        (node as HTMLElement)?.contains(target)
      );

      if (!contains) {
        context.onOpenChange(false);
      }
    },
    [context]
  );

  const getItems = useCollection();
  const open = context.open;
  const cValue = context.value;
  const value = Array.isArray(cValue) ? cValue[0] : cValue;

  // Highlighted option logic
  useLayoutWatch(
    ([oldOpen, oldValue], [newOpen, newValue]) => {
      // don't update highlight when value changes
      if (oldValue && oldValue != newValue) return

      if (!newOpen) {
        return;
      }
      function highlightFirstNonDisabled() {
        const items = getItems();
        const selectedItem = items.find((item) => !item.disabled);
        if (!selectedItem) {
          return;
        }

        context.onHighlightedOptionChange(selectedItem?.value);
      }

      // highlight selected when menu opens for first time
      if (oldOpen != newOpen) {
        if (value && newValue) {
          context.onHighlightedOptionChange(value);
        } else {
          highlightFirstNonDisabled();
        }
        // highlight first option when options change (children)
      } else if (oldOpen == newOpen) {
        highlightFirstNonDisabled();
      }
    },
    [open, cValue, props.children]
  );

  return (
    <DismissableLayer
      asChild
      onPointerDownOutside={onPointerDownOutside}
      onEscapeKeyDown={React.useCallback(() => {
        context.onOpenChange(false);
        const inputNode = context.inputRef
          .current as unknown as HTMLInputElement;
        const value = context.value;
        if (!inputNode) return;

        // TODO : allow user to configure the display value
        if (!Array.isArray(value) && value) {
          inputNode.value = value;
        } else {
          inputNode.value = "";
        }
      }, [context])}
    >
      <PopperPrimitive.Content
        data-open={context.open}
        ref={composedRef}
        {...props}
        asChild
        role="listbox"
        id={props.id ?? defaultId}
        aria-label="States"
      >
        <Primitive.ul>{props.children}</Primitive.ul>
      </PopperPrimitive.Content>
    </DismissableLayer>
  );
});

// -- Option
type ComboboxOptionElement = React.ElementRef<typeof Primitive.li>;
type PrimitiveLiProps = React.ComponentProps<typeof Primitive.li>;
type ComboboxOptionDataProps = {
  value: string;
  disabled?: boolean;
};
type ComboboxOptionRenderValues = { selected: boolean; highlighted: boolean };
type ComboboxOptionProps = Omit<PrimitiveLiProps, "children" | "value"> &
  ComboboxOptionDataProps & {
    children?:
    | React.ReactNode
    | ((value: ComboboxOptionRenderValues) => React.ReactNode);
  };

const ComboboxOption = React.forwardRef<
  ComboboxOptionElement,
  ComboboxOptionProps
>((props, forwardRef) => {
  const defaultId = `combobox-option-${useId()}`;
  const ref = React.useRef<HTMLLIElement>(null);
  const composedRef = useComposedRefs(forwardRef, ref);
  const context = useComboboxContext("ComboboxOption");
  const { value, disabled = false, children, id } = props;

  const highlightedOption = context.highlightedOption;
  const highlighted = highlightedOption == value;
  const selected = React.useMemo(() => {
    const cVal = context.value;

    if (Array.isArray(cVal)) {
      return cVal.includes(value);
    } else {
      return value == cVal;
    }
  }, [context.value, value])
  const inputRef = context.inputRef;

  /* Auto Scroll into view */
  React.useEffect(() => {
    if (!highlighted) return;
    const node = ref.current as HTMLElement;
    const container = context.contentRef.current as HTMLElement;
    if (!node || !container) return;

    const offsetTop = node.offsetTop;
    const nodeHeight = node.clientHeight;
    const containerHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const isAtTop = offsetTop < scrollTop;

    if (isAtTop) {
      node.scrollIntoView({ block: "start" });
      return;
    }

    const isAtBottom = offsetTop + nodeHeight > scrollTop + containerHeight;
    if (isAtBottom) {
      node.scrollIntoView({ block: "end" });
    }
  }, [context.contentRef, highlighted]);

  const onPointerMove = React.useCallback(() => {
    if (highlighted) return;
    context.onHighlightedOptionChange(value);
  }, [highlighted, context, value]);

  const onClick = React.useCallback(() => {
    if (disabled) return;

    context.onValueChange(value);
    const inputNode = inputRef.current as HTMLInputElement;
    if (!inputNode) return;

    if (!context.multiple) {
      context.onOpenChange(false);
      requestAnimationFrame(() => {
        inputRef?.current?.focus();
        const valueLength = value?.length;
        inputNode.selectionStart = valueLength;
        inputNode.selectionEnd = valueLength;
        inputNode.value = value;
      });
    } {
      inputRef.current?.focus();
    }

  }, [context, disabled, inputRef, value]);

  return (
    <CollectionItem
      data={{
        value,
        disabled,
      }}
    >
      <Primitive.li
        {...props}
        ref={composedRef}
        id={id ?? defaultId}
        aria-selected={highlighted}
        data-highlighted={highlighted}
        data-selected={selected}
        onPointerMove={composeEventHandlers(props.onPointerMove, onPointerMove)}
        onClick={composeEventHandlers(props.onClick, onClick)}
      >
        {typeof children == "function"
          ? children({ selected, highlighted })
          : children}
      </Primitive.li>
    </CollectionItem>
  );
});

// -- Trigger
type ComboboxTriggerElement = React.ElementRef<typeof Primitive.button>;
type PrimitiveButtonProps = React.ComponentProps<typeof Primitive.button>;
type ComboboxTriggerProps = {} & PrimitiveButtonProps;

const ComboboxTrigger = React.forwardRef<
  ComboboxTriggerElement,
  ComboboxTriggerProps
>((props, forwardRef) => {
  const triggerId = `combobox-trigger-${useId()}`;
  const id = props.id ?? triggerId;
  const context = useComboboxContext("Trigger");
  const composedRefs = useComposedRefs(forwardRef, context.triggerRef);

  const open = context.open;
  const onClick = React.useCallback(() => {
    if (open) {
      context.onOpenChange(false);
    } else {
      context.onOpenChange(true);
    }

    requestAnimationFrame(() => {
      context.inputRef.current?.focus();
    });
  }, [context, open]);

  return (
    <Primitive.button
      {...props}
      id={id}
      tabIndex={-1}
      aria-label="States"
      aria-controls={context.contentId}
      aria-expanded={context.open}
      ref={composedRefs}
      onClick={composeEventHandlers(props.onClick, onClick)}
    />
  );
});

// -- Label
type ComboboxLabelElement = React.ElementRef<typeof Primitive.label>;
type PrimitiveLabelProps = React.ComponentProps<typeof Primitive.label>;
type ComboboxLabelProps = PrimitiveLabelProps;

const ComboboxLabel = React.forwardRef<
  ComboboxLabelElement,
  ComboboxLabelProps
>((props, forwardRef) => {
  return <Primitive.label {...props} ref={forwardRef} />;
});

// -- Input
type ComboboxInputElement = React.ElementRef<typeof Primitive.input>;
type PrimitiveInputProps = React.ComponentProps<typeof Primitive.input>;
type ComboboxInputProps = {} & PrimitiveInputProps;

const ComboboxInput = React.forwardRef<
  ComboboxInputElement,
  ComboboxInputProps
>((props, forwardRef) => {
  const context = useComboboxContext("ComboboxInput");
  const composedRefs = useComposedRefs(forwardRef, context.inputRef);
  const getItems = useCollection();

  const handleOnChange = React.useCallback(() => {
    if (!context.open) context.onOpenChange(true);
  }, [context]);

  const goTo = React.useCallback(
    (dir: 1 | -1) => {
      const items = getItems();
      const ho = context.highlightedOption;
      if (!ho) return;

      const hoIndex = items.findIndex((item) => item.value == ho);
      if (hoIndex == -1) return;

      let nextIndex = 0;

      if (dir == 1) {
        nextIndex = Math.min(items.length - 1, hoIndex + dir);
      } else {
        nextIndex = Math.max(0, hoIndex + dir);
      }

      context.onHighlightedOptionChange(items[nextIndex].value);
    },
    [context, getItems]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;
      const open = (e: any) => {
        e.preventDefault();
        context.onOpenChange(true);
      };
      const isOpen = context.open;

      switch (key) {
        case "ArrowDown": {
          if (!isOpen) {
            open(e);
            return;
          }

          e.preventDefault();
          goTo(1);
          break;
        }

        case "ArrowUp": {
          if (!isOpen) {
            open(e);
            return;
          }

          e.preventDefault();
          goTo(-1);
          break;
        }

        case "Enter": {
          if (!isOpen) {
            open(e);
            return;
          }

          e.preventDefault();
          context.setCurrentHighlightedToValue();

          const inputNode = context.inputRef.current;
          if (!inputNode) return;

          if (!context.multiple) {
            context.onOpenChange(false);
            inputNode.value = String(context.highlightedOption);
          } {
            const value = inputNode.value;
            const valueLength = value?.length;
            inputNode.selectionStart = valueLength;
            inputNode.selectionEnd = valueLength;
            inputNode.value = value;
          }

          break;
        }
      }
    },
    [context, goTo]
  );

  const highlightedOption = context.highlightedOption;

  const activeDescendantId = React.useMemo(() => {
    if (!highlightedOption) return;
    const items = getItems();
    const found = items.find((item) => item.value == highlightedOption);
    if (!found) return;

    const foundNode = found.ref.current as unknown as HTMLElement;
    if (!foundNode) return;

    return foundNode.id;
  }, [getItems, highlightedOption]);

  return (
    <Primitive.input
      ref={composedRefs}
      {...props}
      onKeyDown={composeEventHandlers(props.onKeyDown, handleKeyDown)}
      onChange={composeEventHandlers(props.onChange, handleOnChange)}
      role="combobox"
      aria-autocomplete="list"
      aria-controls={context.contentId}
      aria-expanded={context.open}
      id={context.inputId}
      aria-activedescendant={activeDescendantId}
    />
  );
});

// -- Portal
type PortalContextProps = {
  forceMount: boolean;
};
const [PortalProvider] = createContext<PortalContextProps>();

type PrimitivePortalProps = React.ComponentProps<typeof PortalPrimitive>;

type PortalProps = {
  forceMount?: boolean;
  children?: React.ReactNode;
} & PrimitivePortalProps;

export function ComboboxPortal({
  children,
  forceMount = false,
  container,
}: PortalProps) {
  const context = useComboboxContext("Portal");

  return (
    <PortalProvider value={{ forceMount }}>
      <Presence present={forceMount || context.open}>
        <PortalPrimitive asChild container={container}>
          {children}
        </PortalPrimitive>
      </Presence>
    </PortalProvider>
  );
}

const ComboboxAnchor = PopperPrimitive.Anchor

export { ComboboxInput };
export { ComboboxOption };
export { ComboboxTrigger };
export { ComboboxLabel };
export { ComboboxContent };
export { ComboboxAnchor }
