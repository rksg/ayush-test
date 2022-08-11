import { NetworkNodeTypeForDisplay } from './constants'

import { incidentSeverities } from '.'

import type {
  IncidentSeverities,
  SeverityRange,
  PathNode
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
