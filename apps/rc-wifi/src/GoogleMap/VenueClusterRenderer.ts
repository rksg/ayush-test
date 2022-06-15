import { Cluster, Renderer } from '@googlemaps/markerclusterer'

import greenClusterDefaultIcon from '../assets/GreenClusterDefault.svg'
import greenClusterHoverIcon   from '../assets/GreenClusterHover.svg'

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
        color: 'rgb(255,255,255)',
        fontFamily: 'Source Sans Pro',
        fontSize: '16px',
        fontWeight: 'semibold'
      },
      title: `Cluster of ${count} markers`,
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
