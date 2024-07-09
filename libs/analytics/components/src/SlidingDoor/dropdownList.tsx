import React from 'react'

import {  DropdownFooter }   from './dropdownFooter'
import { DropdownHeader }    from './dropdownHeader'
import { ListItemComponent } from './dropdownListItem'
import * as UI               from './styledComponents'

import { Node } from '.'
interface DropdownListProps {
  nodesToShow: Node[];
  breadcrumb: Node[];
  searchText: string;
  currentNode: Node;
  onSelect: (node: Node) => void;
  onCancel: () => void;
  onApply: () => void;
  onBack: () => void;
  onBreadcrumbClick: (index: number) => void;
  animation: 'none' | 'ltr' | 'rtl';
}

export const DropdownList: React.FC<DropdownListProps> = ({
  nodesToShow,
  breadcrumb,
  searchText,
  currentNode,
  onSelect,
  onCancel,
  onApply,
  onBack,
  onBreadcrumbClick,
  animation
}) => {
  const items = [
    {
      label: <UI.StyledList
        split={false}
        header={
          <DropdownHeader
            breadcrumb={breadcrumb}
            searchText={searchText}
            currentNode={currentNode}
            onBack={onBack}
            onBreadcrumbClick={onBreadcrumbClick}
          />
        }
        footer={<DropdownFooter onCancel={onCancel} onApply={onApply} />}
        dataSource={nodesToShow as Node[]}
        renderItem={(node) => (
          <ListItemComponent
            animation={animation}
            currentNode={currentNode}
            node={node as Node}
            onClick={onSelect}
          />
        )}
      />,
      key: '1'
    }
  ]
  return <UI.StyledMenu
    items={items}
  />
}

