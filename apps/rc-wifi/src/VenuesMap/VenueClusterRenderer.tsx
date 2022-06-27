/* eslint-disable no-console */
import Icon, {
  CloseOutlined
} from '@ant-design/icons'
import { Cluster,Renderer } from '@googlemaps/markerclusterer'
import ReactDOM             from 'react-dom'

import { cssStr, ListWithIconProps, ListWithIcon, StyledListWithIcon } from '@acx-ui/components'
import { ApVenueStatusEnum }                                           from '@acx-ui/rc/services'

import { getClusterSVG, getIcon, getMarkerColor } from './helper'
import * as UI                                    from './styledComponents'
import { VenueMarkerTooltip }                     from './VenueMarkerTooltip'
import VenueMarkerWithLabel                       from './VenueMarkerWithLabel'

export const getVenueInfoMarkerIcon = (status: string) => {
  switch (status) {
    case ApVenueStatusEnum.IN_SETUP_PHASE:
      return UI.VenueInfoMarkerGreyIcon
    case ApVenueStatusEnum.OFFLINE:
      return UI.VenueInfoMarkerRedIcon
    case ApVenueStatusEnum.OPERATIONAL:
      return UI.VenueInfoMarkerGreenIcon
    case ApVenueStatusEnum.REQUIRES_ATTENTION:
      return UI.VenueInfoMarkerOrangeIcon
    case ApVenueStatusEnum.TRANSIENT_ISSUE:
      return UI.VenueInfoMarkerOrangeIcon
    default:
      return UI.VenueInfoMarkerGreyIcon
  }
}

export default class VenueClusterRenderer implements Renderer {
  public render (
    { count, position, markers }: Cluster
  ): google.maps.Marker {
    const statuses = markers?.map((marker: google.maps.Marker) =>
      (marker as VenueMarkerWithLabel).venueData.status)
    const clusterColor = getMarkerColor(statuses)
    const scaledSize = new google.maps.Size(42, 42)
    const clusterInfoWindow = new google.maps.InfoWindow({})

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
    clusterMarker.addListener('click',() => {
      console.log('Markers:',markers)
      let data: ListWithIconProps['data']=[]
      if(markers)
        data= markers?.map((marker)=>{
          const { venueData } = marker as VenueMarkerWithLabel
          return {
            icon: <Icon component={getVenueInfoMarkerIcon(venueData.status || 'NA')}/>,
            title: venueData.name || 'NA',
            popoverContent: <VenueMarkerTooltip 
              venue={(marker as VenueMarkerWithLabel).venueData} />
          }
        })
      const infoDiv = document.createElement('div')
      const header = <div style={{ color: 'white' }}>
        <span style={{ fontWeight: 'bolder' }}>{markers?.length} Venues</span> 
        <span style={{ float: 'right' }}
          onClick={()=>{
            clusterInfoWindow.close()
          }}>
          <CloseOutlined/>
        </span></div>
      const content = <StyledListWithIcon>
        <ListWithIcon data={data} isPaginate={true} pageSize={2} header={header}/>
      </StyledListWithIcon>

      if(content)
        ReactDOM.render(content, infoDiv)
      
      clusterInfoWindow.setContent(infoDiv)
      
      clusterInfoWindow.open({
        shouldFocus: true,
        anchor: clusterMarker
      })
    })
    return clusterMarker
  }
}
