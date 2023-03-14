import _                    from 'lodash'
import { FormattedMessage } from 'react-intl'

import { TableHighlightFnArgs, Tooltip } from '@acx-ui/components'
import { Event, noDataDisplay }          from '@acx-ui/rc/utils'
import { TenantLink, generatePath }      from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

type EntityType = typeof entityTypes[number]
type EntityExistsKey = `is${Capitalize<EntityType>}Exists`
const entityTypes = ['ap', 'client', 'network', 'switch', 'venue'] as const

export function EntityLink ({ entityKey, data, highlightFn = val => val }: {
  entityKey: keyof Event, data: Event, highlightFn?: TableHighlightFnArgs
}) {
  const pathSpecs: Record<
    typeof entityTypes[number],
    { path: string, params: Array<keyof Event>, disabled?: boolean }
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
    }
  }

  const [entity] = _.kebabCase(entityKey).split('-') as [EntityType]
  const name = <>{highlightFn(String(data[entityKey] || noDataDisplay))}</>

  if (!entityTypes.includes(entity)) return name

  const existKey = `is${_.capitalize(entity)}Exists` as EntityExistsKey
  const exists = data[existKey as keyof typeof data]

  if (!exists) return <Tooltip
    title={<FormattedMessage defaultMessage='Not available' />}
    children={<UI.Disabled>{name}</UI.Disabled>}
  />

  const spec = pathSpecs[entity]
  if (!spec) return name

  const params = spec.params.map(key => [key, String(data[key])])

  if (spec.disabled) return name

  return <TenantLink
    to={generatePath(spec.path, Object.fromEntries(params))}
    children={name}
  />
}
