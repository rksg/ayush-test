import _                                       from 'lodash'
import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { Table, TableHighlightFnArgs, Tooltip } from '@acx-ui/components'
import { Event, replaceStrings }                from '@acx-ui/rc/utils'
import { TenantLink, generatePath }             from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay }               from '@acx-ui/utils'

import { typeMapping } from './mapping'
import * as UI         from './styledComponents'

type EntityType = typeof entityTypes[number]
type EntityExistsKey = `is${Capitalize<EntityType>}Exists`
const entityTypes = ['ap', 'client', 'network', 'switch', 'venue', 'transaction', 'edge'] as const
const configurationUpdate = 'Configuration Update' as const

export function EntityLink ({ entityKey, data, highlightFn = val => val }: {
  entityKey: keyof Event, data: Event, highlightFn?: TableHighlightFnArgs
}) {
  const pathSpecs: Record<
    typeof entityTypes[number],
    { path: string, params: Array<keyof Event> }
  > = {
    ap: {
      path: 'devices/wifi/:serialNumber/details/overview',
      params: ['serialNumber']
    },
    client: {
      path: 'users/wifi/clients/:clientMac/details/overview',
      params: ['clientMac']
    },
    network: {
      path: 'networks/wireless/:networkId/network-details/overview',
      params: ['networkId']
    },
    switch: {
      path: 'devices/switch/:switchMac/:serialNumber/details/overview',
      params: ['switchMac', 'serialNumber']
    },
    venue: {
      path: 'venues/:venueId/venue-details/overview',
      params: ['venueId']
    },
    transaction: {
      path: 'devices/switch/:switchMac/:serialNumber/details/configuration/history',
      params: ['switchMac', 'serialNumber']
    },
    edge: {
      path: 'devices/edge/:serialNumber/details/overview',
      params: ['serialNumber']
    }
  }

  const [entity] = _.kebabCase(entityKey).split('-') as [EntityType]
  const name = <>{highlightFn(String(data[entityKey] || extraHandle(entity)))}</>

  if (!entityTypes.includes(entity)) return name

  const existKey = `is${_.capitalize(identifyExistKey(entity))}Exists` as EntityExistsKey
  const exists = data[existKey as keyof typeof data]

  if (!exists) return <Tooltip
    title={<FormattedMessage defaultMessage='Not available' />}
    children={<UI.Disabled>{name}</UI.Disabled>}
  />

  const spec = pathSpecs[entity]
  const params = spec.params.map(key => [key, String(data[key])])

  return <TenantLink
    to={generatePath(spec.path, Object.fromEntries(params))}
    children={name}
  />
}

export function filtersFrom <Mapping extends Record<string, MessageDescriptor>> (
  mapping: Mapping,
  filterables: boolean | string[] = true,
  key?: string
) {
  const showFilters = Array.isArray(filterables) ? filterables.includes(key!) : filterables
  if (!showFilters) return false
  const { $t } = getIntl()
  return Object.entries(mapping).map(([key, value]) => ({ key, value: $t(value) }))
}

export function valueFrom <Mapping extends Record<string, MessageDescriptor>> (
  mapping: Mapping,
  key: string
) {
  const prop = key as keyof Mapping
  return mapping[prop] ? getIntl().$t(mapping[prop]) : noDataDisplay
}

export const getSource = (data: Event, highlightFn?: TableHighlightFnArgs) => {
  const sourceMapping: Record<keyof typeof typeMapping, keyof Event> = {
    AP: 'apName',
    CLIENT: 'clientName',
    NETWORK: 'apName',
    SWITCH: 'switchName',
    ADMINACTIVITY: 'adminName',
    ADMIN: 'adminName',
    NOTIFICATION: 'adminName',
    EDGE: 'edgeName'
  }
  const entityKey = sourceMapping[data.entity_type as keyof typeof sourceMapping]
  return <EntityLink {...{ entityKey, data, highlightFn }} />
}

export const getDescription = (data: Event, highlightFn?: TableHighlightFnArgs) => {
  try {
    let message = String(data.message && JSON.parse(data.message).message_template)
      // escape ' by replacing with ''
      .replaceAll("'", "''")
      // escape < { by replacing with '<' or '{'
      .replaceAll(/([<{])/g, "'$1'")

    const template = replaceStrings(message, data, (key) => `<entity>${key}</entity>`)
    const highlighted = (highlightFn
      ? highlightFn(template, (key) => `<b>${key}</b>`)
      : template) as string

    // rename to prevent it being parse by extraction process
    const FormatMessage = FormattedMessage

    return <FormatMessage
      id='events-description-template'
      defaultMessage={highlighted}
      values={{
        entity: (chunks) => <EntityLink
          entityKey={String(chunks[0]) as keyof Event}
          data={data}
          highlightFn={highlightFn}
        />,
        b: (chunks) => <Table.Highlighter>{chunks}</Table.Highlighter>
      }}
    />
  } catch {
    return noDataDisplay
  }
}

export const getDetail = (data: Event) => {
  try {
    // eslint-disable-next-line max-len
    let detailedDescription = data.detailedDescription && JSON.parse(data.detailedDescription).message_template
    const template = replaceStrings(detailedDescription, data, (key) => `<entity>${key}</entity>`)
    if (!template) return noDataDisplay

    // rename to prevent it being parse by extraction process
    const FormatMessage = FormattedMessage

    return <FormatMessage
      id='events-detailedDescription-template'
      // escape ' by replacing with '' as it is special character of formatjs
      defaultMessage={template.replaceAll("'", "''")}
      values={{
        entity: (chunks) => <EntityLink
          entityKey={String(chunks[0]) as keyof Event}
          data={data}
        />,
        b: (chunks) => <Table.Highlighter>{chunks}</Table.Highlighter>
      }}
    />
  } catch {
    return noDataDisplay
  }
}

const extraHandle = (entityType: EntityType) => {
  return 'transaction' === entityType ? configurationUpdate : noDataDisplay
}

const identifyExistKey = (entityType: EntityType) => {
  return 'transaction' === entityType ? 'switch' : entityType
}
