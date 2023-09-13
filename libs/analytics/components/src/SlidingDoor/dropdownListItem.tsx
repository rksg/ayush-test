import React from 'react'

import { customCapitalize } from './helpers'
import * as UI              from './styledComponents'

import { Node } from '.'

interface Props {
  node: Node;
  onClick: (node: Node) => void;
  currentNode: Node;
  isAnimationSlideIn: boolean
}

export const ListItemComponent: React.FC<Props> = ({
  node,
  onClick,
  currentNode,
  isAnimationSlideIn
}) => {
  const isLeaf = node?.children?.length === 0 || !Boolean(node?.children)
  const isItemSelected = node === currentNode
  return (
    <UI.ListItem
      key={`${node?.type}-${node.name}`}
      onClick={() => onClick(node)}
      $isSelected={isItemSelected}
      $isAnimationSlideIn={isAnimationSlideIn}
    >
      <UI.ListItemSpan
        hasArrow={!node?.mac}
        key={`${node?.type}-${node.name}`}
        title={customCapitalize(node)}
      >
        {customCapitalize(node)}
      </UI.ListItemSpan>
      <div>{!isLeaf && <UI.RightArrow />}</div>
    </UI.ListItem>
  )
}
