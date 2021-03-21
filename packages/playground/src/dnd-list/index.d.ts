import * as React from 'react';
import { Override } from '../overrides';

export interface StatefulListProps {
  element: HTMLElement;
  removable?: boolean;
  removableByMove?: boolean;
  onChange?: (params: {
    newState: React.ReactNode[];
    oldIndex: number;
    newIndex: number;
  }) => any;
  overrides?: ListOverrides;
}

export interface SharedStylePropsArgT {
  $isDragged: boolean;
  $isSelected: boolean;
  $isRemovable: boolean;
  $isRemovableByMove: boolean;
  $value: React.ReactNode;
}

export interface ListOverrides {
  Root?: Override<SharedStylePropsArgT>;
  List?: Override<SharedStylePropsArgT>;
  Item?: Override<SharedStylePropsArgT>;
  DragHandle?: Override<SharedStylePropsArgT>;
  CloseHandle?: Override<SharedStylePropsArgT>;
  Label?: Override<SharedStylePropsArgT>;
}

export interface ListProps {
  removable?: boolean;
  removableByMove?: boolean;
  items?: React.ReactNode[];
  onChange?: (args: { oldIndex: number; newIndex: number }) => any;
  overrides?: ListOverrides;
}

export class List extends React.Component<ListProps> {}

export const StyledRoot: React.FC<any>;
export const StyledList: React.FC<any>;
export const StyledItem: React.FC<any>;
export const StyledDragHandle: React.FC<any>;
export const StyledCloseHandle: React.FC<any>;
export const StyledLabel: React.FC<any>;
