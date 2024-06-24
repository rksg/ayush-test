
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useGetApCompatibilitiesNetworkQuery } from '@acx-ui/rc/services'

import { retrievedCompatibilitiesOptions } from '../../ApCompatibility'
import { ApTable }                         from '../../ApTable'
import { useApGroupsFilterOpts }           from '../../useApGroupActions'



export function NetworkApsTab () {
  const { networkId } = useParams()
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

  const apgroupFilterOptions = useApGroupsFilterOpts()

  return (
    <ApTable settingsId='network-ap-table'
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
