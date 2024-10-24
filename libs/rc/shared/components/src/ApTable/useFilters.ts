import { useEffect, useState } from 'react'

import { Params } from 'react-router-dom'

import { useWifiNetworkListQuery } from '@acx-ui/rc/services'

export const useFilters = (params: Params) => {
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({})
  const { data: networkData, isLoading: isNetworkLoading } = useWifiNetworkListQuery({
    payload: {
      fields: ['id', 'venueApGroups'],
      filters: {
        id: [params.networkId]
      }
    }
  }, { skip: !params.networkId })

  const targetNetworkData = networkData?.data?.[0]
  let apGroupIds: string[] = []
  targetNetworkData?.venueApGroups?.forEach(venudApGroup => {
    apGroupIds = apGroupIds.concat(venudApGroup.apGroupIds)
  })

  useEffect(() => {
    setFilters({
      ...filters,
      ...((targetNetworkData && apGroupIds.length > 0) ? { apGroupId: apGroupIds } : {}), // network detail - AP table
      ...(params.venueId ? { venueId: [params.venueId] } : {}), // venue detail - ap table
      ...(params.apGroupId ? { apGroupId: [params.apGroupId] } : {}) // apGroup detail - ap table
    })
  }, [targetNetworkData])

  return { filters, isNetworkLoading }
}