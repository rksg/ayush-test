import { Cluster,Renderer } from '@googlemaps/markerclusterer'

import { cssStr } from '@acx-ui/components'

import { getClusterSVG, getIcon, getMarkerColor } from './helper'
import VenueMarkerWithLabel                       from './VenueMarkerWithLabel'

export default class VenueClusterRenderer implements Renderer {
  public render (
    { count, position, markers }: Cluster
  ): google.maps.Marker {
    const statuses = markers?.map((marker: google.maps.Marker) =>
      (marker as VenueMarkerWithLabel).venueData.status)
    const clusterColor = getMarkerColor(statuses)
    const scaledSize = new google.maps.Size(48, 48)

    const clusterMarker = new google.maps.Marker({
      position,
      ...getIcon(getClusterSVG(clusterColor.default), scaledSize),
      label: {
        text: String(count),
        color: cssStr('--acx-primary-white'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssStr('--acx-body-2-font-size'),
        fontWeight: 'semibold'
      },
      title: `Cluster of ${count} Venues`,
      // adjust zIndex to be above other markers
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
    })

    clusterMarker.addListener('mouseover', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.hover), scaledSize).icon)
    })
    clusterMarker.addListener('mouseout', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.default), scaledSize).icon)
    })
    return clusterMarker
  }
}
