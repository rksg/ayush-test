
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useGetApCompatibilitiesNetworkQuery,
  useGetNetworkApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import { IncompatibleFeatureLevelEnum } from '@acx-ui/rc/utils'

import {
  retrievedApCompatibilitiesOptions,
  retrievedCompatibilitiesOptions
} from '../../ApCompatibility'
import { ApTable }               from '../../ApTable'
import { useApGroupsFilterOpts } from '../../useApGroupActions'


const useGetCompatibilitiesOptions = (networkId: string) => {
  const isSupportApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const oldFilterData = useGetApCompatibilitiesNetworkQuery(
    {
      params: { networkId },
      payload: { filters: {} }
    },
    {
      selectFromResult: ({ data }) => (retrievedApCompatibilitiesOptions(data))
    })


  const newFilterData = useGetNetworkApCompatibilitiesQuery(
    {
      params: { networkId },
      payload: {
        filters: {
          wifiNetworkIds: [ networkId ],
          featureLevels: [IncompatibleFeatureLevelEnum.WIFI_NETWORK]
        },
        page: 1,
        pageSize: 10
      }
    }, {
      skip: !isSupportApCompatibilitiesByModel,
      selectFromResult: ({ data }) => retrievedCompatibilitiesOptions(data)
    }
  )

  const filterData = isSupportApCompatibilitiesByModel? newFilterData : oldFilterData
  return filterData

}


export function NetworkApsTab () {
  const { networkId } = useParams()

  const { compatibilitiesFilterOptions } = useGetCompatibilitiesOptions(networkId!)

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
