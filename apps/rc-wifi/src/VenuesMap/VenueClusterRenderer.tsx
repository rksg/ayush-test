import Icon, {
  CloseOutlined
} from '@ant-design/icons'
import { Cluster,Renderer } from '@googlemaps/markerclusterer'
import { createRoot }       from 'react-dom/client'

import { cssStr, ListWithIconProps, ListWithIcon } from '@acx-ui/components'

import { getClusterSVG, getIcon, getMarkerColor, getVenueInfoMarkerIcon, getVenueStatusSeverity } from './helper'
import { VenueClusterTooltip }                                                                    from './styledComponents'
import { VenueMarkerTooltip }                                                                     from './VenueMarkerTooltip'
import VenueMarkerWithLabel                                                                       from './VenueMarkerWithLabel'

declare global {
  interface Window {
    googleMap: any
  }
}

let currentInfoWindow: google.maps.InfoWindow

export const generateClusterInfoContent = (markers: google.maps.Marker[],
  clusterInfoWindow: google.maps.InfoWindow ) => {
  let data: ListWithIconProps['data']=[]

  markers.sort((a,b)=>{
    const { venueData: dataA } = a as VenueMarkerWithLabel
    const { venueData: dataB } = b as VenueMarkerWithLabel
    return getVenueStatusSeverity(dataA.status as string)
    - getVenueStatusSeverity(dataB.status as string)
  })

  data = markers.map((marker)=>{
    const { venueData } = marker as VenueMarkerWithLabel
    return {
      icon: <Icon component={getVenueInfoMarkerIcon(venueData.status as string)}/>,
      title: venueData.name as string,
      popoverContent: <VenueMarkerTooltip 
        venue={(marker as VenueMarkerWithLabel).venueData}
        needPadding={false}
      />
    }
  })

  const pageSize=5
  const header = <div className='venueInfoHeader'>
    <span>{markers?.length} Venues</span> 
    <span style={{ float: 'right', cursor: 'pointer' }}
      onClick={()=>{
        clusterInfoWindow.close()
      }}>
      <CloseOutlined/>
    </span></div>
    
  return(<VenueClusterTooltip>
    <ListWithIcon 
      data={data}
      isPaginate={true}
      pageSize={pageSize}
      header={header}
      isSimplePagination={data.length > 20}
    />
  </VenueClusterTooltip>)
}

export default class VenueClusterRenderer implements Renderer {
  public render (
    { count, position, markers }: Cluster
  ): google.maps.Marker {
    const statuses = markers?.map((marker: google.maps.Marker) =>
      (marker as VenueMarkerWithLabel)?.venueData?.status)
    const clusterColor = getMarkerColor(statuses)
    const scaledSize = new google.maps.Size(42, 42, 'px')
    const clusterInfoWindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0,5)
    })

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
      ()=>{
        const content=generateClusterInfoContent(markers || [new google.maps.Marker({})],
          clusterInfoWindow)

        const infoDiv = document.createElement('div')
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
      })

    google.maps.event.addListener(window.googleMap, 'click',()=>{
      if (typeof(currentInfoWindow) != 'undefined') { 
        currentInfoWindow.close()
      }
    })
    return clusterMarker
  }
}
