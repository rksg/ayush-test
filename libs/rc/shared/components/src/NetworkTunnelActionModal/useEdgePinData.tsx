import { groupBy } from 'lodash'

import { Features }                       from '@acx-ui/feature-toggle'
import { useGetEdgePinViewDataListQuery } from '@acx-ui/rc/services'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

// eslint-disable-next-line max-len
export const useEdgePinScopedNetworkVenueMap = (networkId: string | undefined, refetchFnRef?: React.MutableRefObject<{ [key: string]: () => void }>) => {
  const venuePinsQueryResult = useEdgeAllPinData({ networkId }, !networkId)
  if (refetchFnRef && !venuePinsQueryResult.isUninitialized)
    refetchFnRef.current.pin = venuePinsQueryResult.refetch

  return groupBy(venuePinsQueryResult.venuePins, 'venueId')
}
export const useEdgePinByVenue = (venueId: string | undefined) => {
  const venuePinsQueryResult = useEdgeAllPinData({ venueId }, !venueId)
  return venuePinsQueryResult.venuePins?.[0]
}

// get all pins: `props == undefined` or `props === {}`
// eslint-disable-next-line max-len
export const useEdgeAllPinData = (
  props?: { networkId?: string, venueId?: string },
  skip?: boolean
) => {
  const networkId = props?.networkId
  const networkVenueId = props?.venueId
  const isEdgePinEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  const venuePinsQueryResult = useGetEdgePinViewDataListQuery({
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
    selectFromResult: ({ data, isUninitialized }) => ({
      venuePins: data?.data,
      isUninitialized
    })
  })

  return venuePinsQueryResult
}