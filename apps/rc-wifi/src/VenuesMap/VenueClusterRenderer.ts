import { Cluster, Renderer } from '@googlemaps/markerclusterer'

import { cssStr } from '@acx-ui/components'

import greenClusterDefaultIcon from '../assets/map/GreenClusterDefault.svg'
import greenClusterHoverIcon   from '../assets/map/GreenClusterHover.svg'

export default class VenueClusterRenderer implements Renderer {
  public render (
    { count, position }: Cluster
  ): google.maps.Marker {

    // create marker using svg icon
    const clusterMarker = new google.maps.Marker({
      position,
      icon: {
        url: greenClusterDefaultIcon,
        scaledSize: new google.maps.Size(40, 40)
      },
      label: {
        text: String(count),
        color: cssStr('--acx-primary-white'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssStr('--acx-body-2-font-size')
      },
      title: `Cluster of ${count} venues`,
      // adjust zIndex to be above other markers
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
    })

    clusterMarker.addListener('mouseover', () => {
      clusterMarker.setIcon({
        url: greenClusterHoverIcon,
        scaledSize: new google.maps.Size(40, 40)
      })
    })
    clusterMarker.addListener('mouseout', () => {
      clusterMarker.setIcon({
        url: greenClusterDefaultIcon,
        scaledSize: new google.maps.Size(40, 40)
      })
    })
    return clusterMarker
  }
}
