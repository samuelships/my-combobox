import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

export function createContext<ContextType extends any>(
  value?: ContextType,
  parentName?: string
) {
  const Context = React.createContext<ContextType | null>(value ?? null);

  function useContext(component: string) {
    const context = React.useContext(Context);
    if (!context)
      throw new Error(`${component} is missing parent ${parentName}`);
    return context;
  }

  return [Context.Provider, useContext] as [
    React.Provider<ContextType>,
    typeof useContext
  ];
}

export function createRefCollection<
  ItemType extends HTMLElement,
  ItemData extends Record<any, any>
>(): [typeof Item, typeof Provider, typeof useCollectionContext] {
  type RefMap = Map<
    React.RefObject<ItemType>,
    { ref: React.RefObject<ItemType> } & ItemData
  >;

  const [ProviderA, useContextA] = createContext<{
    refs: RefMap;
  }>();

  const Item = React.forwardRef<
    ItemType,
    React.PropsWithChildren<{ data: ItemData }>
  >(({ children, data, ...props }, forwardRef) => {
    const ref = React.useRef<ItemType>(null);
    const composedRefs = useComposedRefs(forwardRef, ref);
    const context = useContextA("CollectionItem");

    React.useLayoutEffect(() => {
      context.refs.set(ref, { ref, ...data });
      return () => {
        context.refs.delete(ref);
      };
    });

    return (
      <Slot {...props} ref={composedRefs}>
        {children}
      </Slot>
    );
  });

  function Provider({ children }: React.PropsWithChildren<{}>) {
    const [refs] = React.useState<RefMap>(new Map());

    return <ProviderA value={{ refs: refs }}>{children}</ProviderA>;
  }

  function useCollectionContext() {
    const context = useContextA("");

    const getItems = () => {
      const allNodes = context.refs;
      const allNodesArray = Array.from(allNodes.values());

      allNodesArray.sort((a, b) => {
        const nodeA = a.ref.current as HTMLElement;
        const nodeB = b.ref.current as HTMLElement;

        return nodeA.compareDocumentPosition(nodeB) &
          Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });

      return allNodesArray;
    };

    return getItems;
  }

  return [Item, Provider, useCollectionContext];
}

export function useLayoutWatch<T extends any[]>(
  callback: (prevValues: [...T], curValues: [...T]) => void,
  deps: [...T]
) {
  const prevValuesRef = React.useRef<[...T]>([] as unknown as [...T]);

  React.useLayoutEffect(() => {
    for (let i = 0; i < deps.length; i++) {
      const index = i;
      const prevValue = prevValuesRef.current[i];
      const currValue = deps[index];

      if (prevValue !== currValue) {
        callback(prevValuesRef.current, deps);
        prevValuesRef.current = deps;
        return;
      }
    }
  }, deps);
}
