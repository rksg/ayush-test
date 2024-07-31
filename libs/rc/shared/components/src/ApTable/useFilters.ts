import { useEffect, useState } from 'react'

import { Params } from 'react-router-dom'

import { useWifiNetworkListQuery }                      from '@acx-ui/rc/services'
import { NewApGroupViewModelResponseType, TableResult } from '@acx-ui/rc/utils'

export const useFilters = (params: Params) => {
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({})
  const { data: networkData, isLoading: isNetworkLoading } = useWifiNetworkListQuery({
    payload: {
      fields: ['id', 'apSerialNumbers'],
      filters: {
        id: [params.networkId]
      }
    }
  }, { skip: !params.networkId })

  const targetNetworkData = (networkData as TableResult<NewApGroupViewModelResponseType>)?.data?.[0]

  useEffect(() => {
    setFilters({
      ...filters,
      ...(targetNetworkData ? { serialNumber: targetNetworkData.apSerialNumbers } : {}),
      ...(params.venueId ? { venueId: [params.venueId] } : {}),
      ...(params.apGroupId ? { apGroupId: [params.apGroupId] } : {})
    })
  }, [targetNetworkData])

  return { filters, isNetworkLoading }
}