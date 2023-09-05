import React from 'react'

import { customCapitalize } from './helpers'
import * as UI              from './styledComponents'

import { Node } from '.'

interface Props {
    node: Node;
    onClick: (node: Node) => void;
    isSelected?: boolean
  }
export const ListItemComponent: React.FC<Props> = ({ node, onClick, isSelected = false }) => {

  const isLeaf = node?.children?.length === 0 || !Boolean(node?.children)
  return (
    <UI.ListItem
      key={`${node?.type}-${node.name}`}
      onClick={() => onClick(node)}
      isSelected={isSelected}>
      <UI.ListItemSpan key={`${node?.type}-${node.name}`}>
        {customCapitalize(node)}
      </UI.ListItemSpan>
      <div>{!isLeaf && <UI.RightArrow />}</div>
    </UI.ListItem>
  )
}