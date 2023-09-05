import React from 'react'

import { Menu } from 'antd'

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
  onBreadcrumbClick
}) => (
  <UI.StyledMenu>
    <Menu.Item key='1'>
      <UI.StyledList
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
        renderItem={(node) => <ListItemComponent node={node as Node} onClick={onSelect} />}
      />
    </Menu.Item>
  </UI.StyledMenu>
)