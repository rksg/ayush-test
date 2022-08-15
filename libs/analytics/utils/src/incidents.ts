import { defineMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl'

import { formatter } from '@acx-ui/utils'

import { noDataSymbol }        from './constants'
import { incidentInformation } from './incidentInformation'
import incidentSeverities      from './incidentSeverities.json'

import type {
  IncidentSeverities,
  SeverityRange,
  PathNode,
  NodeType,
  Incident
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

/**
 * Uses to normalize various node types we have between server & UI
 */
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
    default:
      return defineMessage({ defaultMessage: 'Unknown' })
  }
}

export function useFormattedNodeType (nodeType: NodeType) {
  const { $t } = useIntl()
  return $t(nodeTypes(nodeType))
}

export function useImpactValues (type: string, count?: number, impactedCount?: number): 
  Record<string, unknown> {
  const intl = useIntl()
  if (typeof count !== 'number' || typeof impactedCount != 'number') {
    return {
      [`${type}Impact`]: null,
      [`${type}ImpactFormatted`]: '',
      [`${type}ImpactCountFormatted`]: '',
      [`${type}ImpactDescription`]: intl.$t(defineMessage({ defaultMessage: 'Calculating...' }))
    }
  } else if (count === -1 || impactedCount === -1 ||
      count === 0 || impactedCount === -1
  ) {
    return {
      [`${type}Impact`]: intl.formatMessage({ defaultMessage: '{noDataSymbol}' }, { noDataSymbol }),
      [`${type}ImpactFormatted`]: intl.formatMessage(
        { defaultMessage: '{noDataSymbol}' }, { noDataSymbol }
      ),
      [`${type}ImpactCountFormatted`]: intl.formatMessage(
        { defaultMessage: '{noDataSymbol}' }, { noDataSymbol }
      ),
      [`${type}ImpactDescription`]: intl.formatMessage(
        { defaultMessage: '{noDataSymbol}' }, { noDataSymbol }
      )
    }
  } else {
    const impact = impactedCount / count
    const formattedImpact = formatter('percentFormat')(impact)

    return {
      [`${type}Impact`]: impact,
      [`${type}ImpactFormatted`]: formattedImpact,
      [`${type}ImpactCountFormatted`]: formatter('countFormat')(impactedCount),
      [`${type}ImpactDescription`]: intl.$t(
        defineMessage({ defaultMessage: '{impactedCount} of {count} {type}{isPlural} ({impact})' }),
        {
          impactedCount,
          count,
          type: type === 'ap' ? type.toUpperCase() : type,
          isPlural: count > 1 ? 's' : '',
          impact: formattedImpact
        }
      )
    }
  }
}

function formattedNodeName (
  intl: IntlShape,
  node: PathNode,
  sliceValue: string
): string | undefined {
  const type = node.type.toLocaleLowerCase()
  const isComplexName = ['ap', 'switch'].includes(type) && sliceValue !== node.name
  return intl.$t({
    defaultMessage: `{isComplexName, select,
      true {{name} ({nodeName})}
      other {{nodeName}}
    }`,
    // eslint-disable-next-line max-len
    description: 'Uses to format path node name, when isComplexName = true the nodeName would be something like AP or Switch MAC address'
  }, { isComplexName, name: sliceValue, nodeName: node.name })
}

export function useFormattedPath (path: PathNode[], sliceValue: string) {
  const intl = useIntl()
  return path
    .filter(node => node.type !== 'network')
    .map(node => ({
      nodeName: formattedNodeName(intl, node, sliceValue),
      nodeType: intl.$t(nodeTypes(node.type))
    }))
    .map(node => intl.$t({
      defaultMessage: '{nodeName} ({nodeType})',
      description: 'FormattedPath: Uses to show path node name & type'
    }, node))
    .reduce((nodeA, nodeB) => intl.$t({
      defaultMessage: '{nodeA} > {nodeB}',
      description: 'FormattedPath: Uses to join path nodes together in a chain'
    }, { nodeA, nodeB }))
}

export function useImpactedArea (path: PathNode[], sliceValue: string) {
  const intl = useIntl()
  const lastNode = path[path.length - 1]
  return lastNode
    ? formattedNodeName(intl, lastNode, sliceValue)
    : sliceValue
}

export const useIncidentScope = (incident: Incident) => {
  const { $t } = useIntl()

  return $t({
    defaultMessage: '{nodeType}: {nodeName}',
    description: 'Uses to generate incident impacted scope for various incident descriptions'
  }, {
    nodeType: useFormattedNodeType(incident.sliceType),
    nodeName: useImpactedArea(incident.path, incident.sliceValue)
  })
}

export const useShortDescription = (incident: Incident) => {
  const { $t } = useIntl()
  const { shortDescription } = incidentInformation[incident.code]
  const scope = useIncidentScope(incident)
  return $t(shortDescription, { scope })
}

export const useLongDesription = (incident: Incident, rootCauses: string) => {
  const { $t } = useIntl()
  const shortDesc = useShortDescription(incident)
  const scope = useIncidentScope(incident)
  
  const { metadata: { dominant }, clientCount, impactedClientCount } = incident
  const { clientImpact, clientImpactFormatted } = 
    useImpactValues('client', clientCount, impactedClientCount)
  
  if (clientImpact === null) {
    return shortDesc
  } else {
    const incidentInfo = incidentInformation[incident.code]

    return [
      $t(incidentInfo.longDescription, { scope, impact: clientImpactFormatted as string }),
      // eslint-disable-next-line max-len
      (dominant && dominant.ssid) ? $t(defineMessage({ defaultMessage: 'Most impacted WLAN: {ssid}' }), { ssid: dominant.ssid }) : '',
      $t(defineMessage({ defaultMessage: 'Root cause: {rootCauses}' }), { rootCauses })
    ].filter(Boolean).join('\n\n')
  }
}