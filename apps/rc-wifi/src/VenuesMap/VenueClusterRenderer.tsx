import Icon, {
  CloseOutlined
} from '@ant-design/icons'
import { Cluster,Renderer } from '@googlemaps/markerclusterer'
import { createRoot }       from 'react-dom/client'

import { cssStr, ListWithIconProps, ListWithIcon, StyledListWithIcon } from '@acx-ui/components'
import { ApVenueStatusEnum }                                           from '@acx-ui/rc/services'

import { getClusterSVG, getIcon, getMarkerColor } from './helper'
import * as UI                                    from './styledComponents'
import { VenueMarkerTooltip }                     from './VenueMarkerTooltip'
import VenueMarkerWithLabel                       from './VenueMarkerWithLabel'

let currentInfoWindow: google.maps.InfoWindow

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

export const clusterClickHandler = (markers: google.maps.Marker[],
  clusterInfoWindow: google.maps.InfoWindow, clusterMarker: google.maps.Marker ) => {
  let data: ListWithIconProps['data']=[]
  data = markers?.map((marker)=>{
    const { venueData } = marker as VenueMarkerWithLabel
    return {
      icon: <Icon component={getVenueInfoMarkerIcon(venueData.status || 'NA')}/>,
      title: venueData.name || 'NA',
      popoverContent: <VenueMarkerTooltip 
        venue={(marker as VenueMarkerWithLabel).venueData} />
    }
  })
  
  const infoDiv = document.createElement('div')
  const header = <div className='venueInfoHeader'>
    <span style={{ fontWeight: 'bolder' }}>{markers?.length} Venues</span> 
    <span style={{ float: 'right', cursor: 'pointer' }}
      onClick={()=>{
        clusterInfoWindow.close()
      }}>
      <CloseOutlined/>
    </span></div>
  const footer=<div></div>
  const content = <StyledListWithIcon>
    <ListWithIcon data={data} isPaginate={true} pageSize={3} header={header} footer={footer}/>
  </StyledListWithIcon>

  createRoot(infoDiv).render(content)
  
  clusterInfoWindow.setContent(infoDiv)

  if (typeof(currentInfoWindow) != 'undefined') { 
    currentInfoWindow.close()
  } 
  
  clusterInfoWindow.open({
    shouldFocus: true,
    anchor: clusterMarker
  })
  currentInfoWindow = clusterInfoWindow
  return content
}

export default class VenueClusterRenderer implements Renderer {
  public render (
    { count, position, markers }: Cluster
  ): google.maps.Marker {
    const statuses = markers?.map((marker: google.maps.Marker) =>
      (marker as VenueMarkerWithLabel)?.venueData?.status)
    const clusterColor = getMarkerColor(statuses)
    const scaledSize = new google.maps.Size(42, 42, 'px')
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
    /* istanbul ignore next */
    clusterMarker.addListener('mouseover', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.hover), scaledSize).icon)
    })
    /* istanbul ignore next */
    clusterMarker.addListener('mouseout', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.default), scaledSize).icon)
    })

    /* istanbul ignore next */
    google.maps.event.addListener(clusterMarker, 'click',
      ()=>clusterClickHandler(markers || [new google.maps.Marker({})],
        clusterInfoWindow, clusterMarker))

    // google.maps.event.addListener(map, 'click',()=>{
    //   if (typeof(currentInfoWindow) != 'undefined') { 
    //     currentInfoWindow.close()
    //   }
    // })
    return clusterMarker
  }
}
