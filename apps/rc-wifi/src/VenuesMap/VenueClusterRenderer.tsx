import Icon, {
  CloseOutlined
} from '@ant-design/icons'
import { Cluster,Renderer } from '@googlemaps/markerclusterer'
import { createRoot }       from 'react-dom/client'

import { cssStr, ListWithIconProps, ListWithIcon } from '@acx-ui/components'

import { getClusterSVG, getIcon, getMarkerColor, getVenueInfoMarkerIcon } from './helper'
import { StyledListWithIcon }                                             from './styledComponents'
import { VenueMarkerTooltip }                                             from './VenueMarkerTooltip'
import VenueMarkerWithLabel                                               from './VenueMarkerWithLabel'

declare global {
  interface Window {
    googleMap: any;
  }
}

let currentInfoWindow: google.maps.InfoWindow

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
  const pageSize=3
  const header = <div className='venueInfoHeader'>
    <span style={{ fontWeight: 'bolder' }}>{markers?.length} Venues</span> 
    <span style={{ float: 'right', cursor: 'pointer' }}
      onClick={()=>{
        clusterInfoWindow.close()
      }}>
      <CloseOutlined/>
    </span></div>
  const footer=data.length <= pageSize ? <div></div> : undefined
  const content = <StyledListWithIcon>
    <ListWithIcon 
      data={data}
      isPaginate={true}
      pageSize={pageSize}
      header={header}
      footer={footer}/>
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
    clusterMarker.addListener('mouseover', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.hover), scaledSize).icon)
    })
    clusterMarker.addListener('mouseout', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.default), scaledSize).icon)
    })

    google.maps.event.addListener(clusterMarker, 'click',
      ()=>clusterClickHandler(markers || [new google.maps.Marker({})],
        clusterInfoWindow, clusterMarker))

    google.maps.event.addListener(window.googleMap, 'click',()=>{
      if (typeof(currentInfoWindow) != 'undefined') { 
        currentInfoWindow.close()
      }
    })
    return clusterMarker
  }
}
