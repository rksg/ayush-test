import { keys, every, get, uniq } from 'lodash'

import { FILTER, WifiNetwork } from '@acx-ui/rc/utils'

export const getApGroupNetworkVenueNewFieldFromOld = (oldFieldName: string) => {
  switch(oldFieldName) {
    case 'isAllApGroups':
      return 'venueApGroups.isAllApGroups'
    case 'venueId':
      return 'venueApGroups.venueId'
    case 'clients':
      return 'clientCount'
    default:
      return oldFieldName
  }
}

export const transformApGroupNetworkVenueListRbacPayload = (payload: Record<string, unknown>) => {
  const newPayload = { ...payload } as Record<string, unknown>
  if (payload.fields) {
    // eslint-disable-next-line max-len
    newPayload.fields = uniq((payload.fields as string[]).map(f => getApGroupNetworkVenueNewFieldFromOld(f)))
  }

  if (payload.filters) {
    const newFilters = {} as FILTER
    Object.entries(payload.filters as FILTER).map(([fieldId, val]) => {
      newFilters[getApGroupNetworkVenueNewFieldFromOld(fieldId as string)] = val
    })
    newPayload.filters = newFilters
  }

  return newPayload
}

export const getVenueApGroupFilters = (filters: FILTER | undefined): string[] => {
  return keys(filters).filter(k => k.startsWith('venueApGroups.'))
}

export const filterNetworksByVenueApGroupFilters =
(networkList: WifiNetwork[], filters: FILTER | undefined): WifiNetwork[] => {
  if (!filters) return networkList

  const venueApGroupFilterKeys = getVenueApGroupFilters(filters)

  return networkList.filter(item => item.venueApGroups
    ?.some(venueApGroup => every(venueApGroupFilterKeys, fKey => {
      const lastField = fKey.replace('venueApGroups.', '')

      switch(fKey) {
        case 'venueApGroups.apGroupIds':
          return filters[fKey]?.every(fVal => get(venueApGroup, lastField).includes(fVal))
        case 'venueApGroups.venueId':
        case 'venueApGroups.isAllApGroups':
          return get(venueApGroup, lastField) === filters[fKey]?.[0]
        default:
          return false
      }
    })))
}
