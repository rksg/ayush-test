import React from 'react'

import { PathNode }                                from '@acx-ui/analytics/utils'

import { NetworkNodeTypeForDisplay } from '@acx-ui/analytics/utils'

import type { IncidentAttributesProps } from '../types'

export const formattedNodeName = (node: PathNode, sliceValue: string) =>
  ['ap', 'controller', 'switch'].includes(node.type.toLowerCase()) && sliceValue !== node.name
    ? `${sliceValue} (${node.name})`
    : node.name

export const formattedSliceType = (type: string) =>
  NetworkNodeTypeForDisplay[type as keyof typeof NetworkNodeTypeForDisplay] || type

export const formattedPath = (path: IncidentAttributesProps['path'], sliceValue: string) => path
  .map(node => `${formattedNodeName(node, sliceValue)} (${formattedSliceType(node.type)})`)
  .join('\n> ')

export const getImpactedArea = (path: IncidentAttributesProps['path'], sliceValue: string) => {
  const lastNode = path[path.length - 1]
  return lastNode
    ? formattedNodeName(lastNode, sliceValue)
    : sliceValue
}

export const IncidentAttributes = (props: IncidentAttributesProps) => {
  return <>IncidentAttributes</>
}
