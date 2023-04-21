import {  useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { useApListQuery }           from '@acx-ui/rc/services'

export function useInjectVenuePath (filters: AnalyticsFilter) {
  const { tenantId } = useParams()
  const { type, name: apName } = filters.path[filters.path.length - 1]
  const isApInPath = (type === 'ap' || type === 'AP') && filters.path.length === 1

  const apList = useApListQuery(
    {
      params: { tenantId },
      payload: {
        fields: ['venueId'],
        searchTargetFields: ['apMac', 'serialNumber', 'apName'],
        searchString: apName
      }
    },
    {
      skip: !isApInPath,
      selectFromResult: ({ data, ...rest }) => ({
        data: data?.data,
        ...rest
      })
    }
  )
  return useMemo(() => {
    if (isApInPath && apList && apList.data) {
      const { venueId } = apList.data[0] as unknown as { venueId: string }
      const venuePath = { type: 'zone' as 'zone', name: venueId }
      const copy = [...filters.path]
      copy.unshift(venuePath)
      return copy
    }
    return filters.path
  }, [isApInPath, apList, apList.data, filters.path])
}

