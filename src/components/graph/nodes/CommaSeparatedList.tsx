import { ReactElement } from "react";
import { Fragment } from "react/jsx-runtime";

function CommaSeparatedList<T>({ items, component }: { items: T[], component: ({ item }: { item: T }) => ReactElement<{ item: T }> }) {
  return (
    <>
      {items.map((item, index) => {
        const value = component({ item });
        return (
          <Fragment key={index}>
            {value}
            {index < items.length - 1 && <>, </>}
          </Fragment>
        );
      })}
    </>
  )
}

export function SpanItem({ item }: { item: string }) {
  return (<span>{item}</span>)
}

export default CommaSeparatedList;