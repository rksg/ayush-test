import { capitalize }                                           from 'lodash'
import { defineMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl'

import { intlFormats } from '@acx-ui/utils'

import { noDataSymbol }        from './constants'
import { incidentInformation } from './incidentInformation'
import incidentSeverities      from './incidentSeverities.json'

import type { IncidentInformation } from './incidentInformation'
import type {
  IncidentSeverities,
  SeverityRange,
  PathNode,
  NodeType,
  Incident
} from './types/incidents'

/**
 * Uses to transform incident record loaded from API and
 * adds incident infomation into it
 */
export function transformIncidentQueryResult (
  incident: Omit<Incident, keyof IncidentInformation>
): Incident {
  const info = incidentInformation[incident.code]
  return { ...incident, ...info }
}

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

export const useImpactValues = 
  <Type extends 'ap' | 'client'> (type: Type, incident: Incident): 
  Record<string, string | number | null | {}> => {
    const intl = useIntl()
    const values = impactValues(intl, type, incident)
    return values
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
      defaultMessage: '{nodeA}{newline}> {nodeB}',
      description: 'FormattedPath: Uses to join path nodes together in a chain'
    }, { nodeA, nodeB, newline: '\n' }))
}

export function useImpactedArea (path: PathNode[], sliceValue: string) {
  const intl = useIntl()
  const lastNode = 
    (path && path.length > 0 && path[path.length - 1]) ? path[path.length - 1] : false
  return lastNode
    ? formattedNodeName(intl, lastNode, sliceValue)
    : sliceValue
}

export const useIncidentScope = (incident: Incident) => {
  const { $t } = useIntl()
  const scope = $t({
    defaultMessage: '{nodeType}: {nodeName}',
    description: 'Uses to generate incident impacted scope for various incident descriptions'
  }, {
    nodeType: useFormattedNodeType(incident.sliceType),
    nodeName: useImpactedArea(incident.path, incident.sliceValue)
  })
  return $t(incident.shortDescription, { scope })
}

export const useShortDescription = (incident: Incident) => {
  const { $t } = useIntl()
  const scope = useIncidentScope(incident)
  return $t(incident.shortDescription, { scope })
}

export const impactValues = <Type extends 'ap' | 'client'> (
  { $t }: IntlShape,
  type: Type,
  incident: Incident
): (
  Record<`${Type}ImpactRatio`, '-' | number | null> &
  Record<
    `${Type}ImpactRatioFormatted` | `${Type}ImpactCountFormatted` | `${Type}ImpactDescription`,
    string
  >
) => {
  const total = incident[`${type}Count` as const]
  const count = incident[
    `impacted${capitalize(type)}Count` as `impacted${Capitalize<typeof type>}Count`
  ]
  if (total === null || count === null) {
    return {
      [`${type}ImpactRatio`]: null,
      [`${type}ImpactRatioFormatted`]: '',
      [`${type}ImpactCountFormatted`]: '',
      [`${type}ImpactDescription`]: $t({ defaultMessage: 'Calculating...' })
    } as ReturnType<typeof impactValues>
  }

  if ([total, count].some(value => [0, -1].includes(value!))) {
    return {
      [`${type}ImpactRatio`]: noDataSymbol,
      [`${type}ImpactRatioFormatted`]: noDataSymbol,
      [`${type}ImpactCountFormatted`]: noDataSymbol,
      [`${type}ImpactDescription`]: noDataSymbol
    } as ReturnType<typeof impactValues>
  }

  const ratio = count! / total!
  const formattedRatio = $t(intlFormats.percentFormat, { value: ratio })
  const formattedTotal = $t(intlFormats.countFormat, { value: total })
  const formattedCount = $t(intlFormats.countFormat, { value: count })
  const formattedType = $t({
    defaultMessage: `{type, select,
      ap {{value, plural, one {AP} other {APs}}}
      client {{value, plural, one {client} other {clients}}}
      other {Unknown}
    }`
  }, { type, value: total })

  return {
    [`${type}ImpactRatio`]: ratio,
    [`${type}ImpactRatioFormatted`]: formattedRatio,
    [`${type}ImpactCountFormatted`]: formattedCount,
    [`${type}ImpactDescription`]: $t({
      defaultMessage: '{formattedCount} of {formattedTotal} {formattedType} ({formattedRatio})',
      description: 'E.g. 1 of 10 clients (10%)'
    }, { formattedCount, formattedTotal, formattedType, formattedRatio })
  } as ReturnType<typeof impactValues>
}
