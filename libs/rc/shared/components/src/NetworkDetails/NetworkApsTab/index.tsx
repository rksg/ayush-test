
import { useParams } from 'react-router-dom'

import { useGetApCompatibilitiesNetworkQuery } from '@acx-ui/rc/services'

import { retrievedCompatibilitiesOptions } from '../../ApCompatibility'
import { ApTable }                         from '../../ApTable'
import { useApGroupsFilterOpts }           from '../../useApGroupActions'



export function NetworkApsTab () {
  const { networkId } = useParams()
  const { compatibilitiesFilterOptions } = useGetApCompatibilitiesNetworkQuery(
    {
      params: { networkId },
      payload: { filters: {} }
    },
    {
      selectFromResult: ({ data }) => (retrievedCompatibilitiesOptions(data))
    })

  const apgroupFilterOptions = useApGroupsFilterOpts()

  return (
    <ApTable settingsId='network-ap-table'
      searchable={true}
      enableGroups={false}
      enableApCompatibleCheck={true}
      filterables={{
        deviceGroupId: apgroupFilterOptions,
        featureIncompatible: compatibilitiesFilterOptions
      }}
    />
  )
}
