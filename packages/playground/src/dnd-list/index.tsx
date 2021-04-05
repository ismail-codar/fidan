import { StatefulListProps } from './types';
import { createDndLabelOverrides, createSortable } from './dnd-list';

export const StatefulList = (props: StatefulListProps) => {
  const {
    initialState: { items },
    overrides,
  } = props;
  const labelMetadata: {
    $isdragging: boolean;
  }[] = [];

  const { Label, labelProps, labelRenderClassName } = createDndLabelOverrides(
    (_props, _children) => {
      return <li {..._props}>{_children()}</li>;
    },
    overrides
  );

  const element = (
    <ul>
      {items.map((value, index) => {
        labelMetadata[index] = {
          $isdragging: false,
        };
        return <Label {...labelProps}>{value}</Label>;
      })}
    </ul>
  );

  createSortable(element, ({ oldIndex, newIndex }) => {
    console.log(oldIndex, newIndex);
    labelMetadata[oldIndex].$isdragging = false;
    labelMetadata[newIndex].$isdragging = true;
    // labelRenderClassName({});
  });

  return element as JSX.Element;
};
