import { groupBy } from 'lodash'

import { Features }                         from '@acx-ui/feature-toggle'
import { useGetEdgePinViewDataListQuery }   from '@acx-ui/rc/services'
import { PersonalIdentityNetworksViewData } from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

export const useEdgePinScopedNetworkVenueMap = (networkId: string | undefined) => {
  const allPins = useEdgeAllPinData({ networkId }, !networkId)
  return groupBy(allPins, 'venueId')
}
export const useEdgePinByVenue = (venueId: string | undefined) => {
  const allPins = useEdgeAllPinData({ venueId }, !venueId)
  return allPins?.[0]
}

// get all pins: `props == undefined` or `props === {}`
// eslint-disable-next-line max-len
export const useEdgeAllPinData = (props?: { networkId?: string, venueId?: string }, skip?: boolean): (PersonalIdentityNetworksViewData[] | undefined) => {
  const networkId = props?.networkId
  const networkVenueId = props?.venueId
  const isEdgePinEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  const { venuePins } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: [
        'id', 'name',
        'venueId',
        'edgeClusterInfo',
        'tunneledWlans'],
      filters: {
        ...(networkVenueId ? { 'tunneledWlans.venueId': [networkVenueId] } : {}),
        ...(networkId ? { 'tunneledWlans.networkId': [networkId] } : {})
      },
      page: 1,
      pageSize: 10000
    }
  }, {
    skip: !isEdgePinEnabled || skip,
    selectFromResult: ({ data }) => ({
      venuePins: data?.data
    })
  })

  return venuePins
}