/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { ApTable, ApCompatibilityQueryTypes }                            from '@acx-ui/rc/components'
import { useApGroupsListQuery, useLazyGetApCompatibilitiesNetworkQuery } from '@acx-ui/rc/services'


export function NetworkApsTab () {
  const { tenantId, networkId } = useParams()
  const [ compatibilitiesFilterOptions, setCompatibilitiesFilterOptions ] = useState<{ key: string[], value: string }[]>([])
  const isApCompatibleCheckEnabled = useIsSplitOn(Features.WIFI_COMPATIBILITY_CHECK_TOGGLE)
  const [ getApCompatibilitiesNetwork ] = useLazyGetApCompatibilitiesNetworkQuery()

  const { apgroupFilterOptions } = useApGroupsListQuery(
    {
      params: { tenantId },
      payload: {
        fields: ['name', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC',
        filters: { isDefault: [false] }
      }
    },
    {
      selectFromResult: ({ data }) => ({
        apgroupFilterOptions: data?.data.map((v) => ({ key: v.id, value: v.name })) || true
      })
    }
  )

  useEffect(() => {
    const fetchApCompatibilities = async () => {
      try {
        const apCompatibilitiesResponse = await getApCompatibilitiesNetwork({
          params: { networkId },
          payload: { filters: {}, queryType: ApCompatibilityQueryTypes.CHECK_NETWORK }
        }).unwrap()

        if (apCompatibilitiesResponse[0]) {
          const { incompatibleFeatures, incompatible } = apCompatibilitiesResponse[0]
          const filterOptions: { key: string[]; value: string }[] = []
          if (incompatible > 0) {
            incompatibleFeatures?.forEach((feature) => {
              const { featureName, incompatibleDevices } = feature
              const fwVersions: string[] = []
              incompatibleDevices?.forEach((device) => {
                fwVersions.push(device.firmware)
              })
              filterOptions.push({ key: fwVersions, value: featureName })
            })
            setCompatibilitiesFilterOptions(filterOptions)
          }
        }
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }
    if (isApCompatibleCheckEnabled) fetchApCompatibilities()
  }, [])


  return (
    <ApTable
      searchable={true}
      enableGroups={false}
      enableApCompatibleCheck={isApCompatibleCheckEnabled}
      filterables={{
        deviceGroupId: apgroupFilterOptions,
        featureIncompatible: compatibilitiesFilterOptions
      }}
    />
  )
}
