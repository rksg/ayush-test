
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { useApGroupsListQuery, useGetApCompatibilitiesNetworkQuery } from '@acx-ui/rc/services'

import { retrievedCompatibilitiesOptions } from '../../ApCompatibilityDrawer'
import { ApTable }                         from '../../ApTable'



export function NetworkApsTab () {
  const { tenantId, networkId } = useParams()
  const isApCompatibleCheckEnabled = useIsSplitOn(Features.WIFI_COMPATIBILITY_CHECK_TOGGLE)
  const { compatibilitiesFilterOptions } = useGetApCompatibilitiesNetworkQuery(
    {
      params: { networkId },
      payload: { filters: {} }
    },
    {
      skip: !isApCompatibleCheckEnabled,
      selectFromResult: ({ data }) => (retrievedCompatibilitiesOptions(data))
    })

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
