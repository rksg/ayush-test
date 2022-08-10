import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { incidentSeverities } from '.'

import type {
  IncidentSeverities,
  SeverityRange,
  PathNode,
  NodeType
} from './types/incidents'

export function calculateSeverity (severity: number): IncidentSeverities | void {
  const severityMap = new Map(
    Object
      .keys(incidentSeverities)
      .map(key => [key, incidentSeverities[key as IncidentSeverities]])
      .sort((a: (string | SeverityRange)[], b: (string | SeverityRange)[]) => {
        const [, { lte }] = a as SeverityRange[]
        const [, { lte: lte2 }] = b as SeverityRange[]
        return lte2 - lte
      }) as Iterable<readonly [string, SeverityRange]>
  ) as Map<string, SeverityRange>

  for (let [p, filter] of severityMap) {
    if (severity > filter.gt) {
      return p as IncidentSeverities
    }
  }
}

type NormalizedNodeType = 'network'
  | 'zone'
  | 'switchGroup'
  | 'apGroup'
  | 'switch'
  | 'AP'

export function normalizeNodeType (nodeType: NodeType): NormalizedNodeType {
  switch (nodeType) {
    case 'ap': return 'AP'
    case 'apMac': return 'AP'
    case 'apGroupName': return 'apGroup'
    case 'zoneName': return 'zone'
    default: return nodeType
  }
}

/**
 * Returns message descriptor to the matching `nodeType`
 */
export function nodeTypes (nodeType: NodeType): MessageDescriptor {
  switch (normalizeNodeType(nodeType)) {
    case 'network': return defineMessage({ defaultMessage: 'Entire Organization' })
    case 'apGroup': return defineMessage({ defaultMessage: 'AP Group' })
    case 'zone': return defineMessage({ defaultMessage: 'Venue' })
    case 'switchGroup': return defineMessage({ defaultMessage: 'Venue' })
    case 'switch': return defineMessage({ defaultMessage: 'Switch' })
    case 'AP': return defineMessage({ defaultMessage: 'Access Point' })
  }
}

export function formattedNodeName (node: PathNode, sliceValue: string): string | undefined {
  return (
    ['ap', 'controller', 'switch'].includes(node.type.toLowerCase())
      && sliceValue !== node.name
  )
    ? `${sliceValue} (${node.name})`
    : node.name
}

export function formattedSliceType (type: string) {
  return NetworkNodeTypeForDisplay[type as keyof typeof NetworkNodeTypeForDisplay] || type
}

export function formattedPath (path: PathNode[], sliceValue: string) {
  return path
    .map(node => `${formattedNodeName(node, sliceValue)} (${formattedSliceType(node.type)})`)
    .join('\n> ')
}

export function impactedArea (path: PathNode[], sliceValue: string) {
  const lastNode = path[path.length - 1]
  return lastNode
    ? formattedNodeName(lastNode, sliceValue)
    : sliceValue
}
