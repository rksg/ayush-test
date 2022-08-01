import { ReactNode } from 'react'

import { useIntl } from 'react-intl'

import Icon                     from '@ant-design/icons'
import { Cluster,Renderer }     from '@googlemaps/markerclusterer'
import { List, Space, Popover } from 'antd'
import { createRoot }           from 'react-dom/client'

import { cssStr } from '@acx-ui/components'

import { getClusterSVG, getIcon, getMarkerColor, getVenueInfoMarkerIcon, getVenueSeverityByStatus } from './helper'
import { VenueClusterTooltip, CloseIcon }                                                           from './styledComponents'
import { VenueMarkerTooltip }                                                                       from './VenueMarkerTooltip'
import VenueMarkerWithLabel                                                                         from './VenueMarkerWithLabel'

let currentInfoWindow: google.maps.InfoWindow

export interface VenueClusterTooltipData {
  icon: ReactNode,
  title: string,
  popoverContent: ReactNode
}

export const renderItemForList = (item:VenueClusterTooltipData) => (
  <Popover
    content={item.popoverContent}
    placement='right'
    trigger='hover'
  >
    <List.Item>
      <Space>
        {item.icon}
        <div className='ListWithIcon-item-title'>
          {item.title}
        </div>
      </Space>
    </List.Item>
  </Popover>
)

export const generateClusterInfoContent = (markers: google.maps.Marker[],
  clusterInfoWindow: google.maps.InfoWindow ) => {
  let data: VenueClusterTooltipData[] = []

  const sortedMarkers = Array.from(markers).sort((a,b) => {
    const { venueData: dataA } = a as VenueMarkerWithLabel
    const { venueData: dataB } = b as VenueMarkerWithLabel
    return getVenueSeverityByStatus(dataA.status as string)
      - getVenueSeverityByStatus(dataB.status as string)
  })

  data = sortedMarkers.map((marker)=>{
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

  const pageSize = 5
  const header = <div className='venueInfoHeader'>
    <span>{sortedMarkers?.length} Venues</span>
    <span style={{ float: 'right', cursor: 'pointer' }}
      onClick={() => {
        clusterInfoWindow.close()
      }}>
      <Icon component={CloseIcon}/>
    </span>
  </div>

  return(
    <VenueClusterTooltip>
      <List
        header={header}
        itemLayout='vertical'
        dataSource={data}
        bordered
        pagination={data.length > pageSize ? {
          pageSize,
          size: 'small',
          simple: data.length > 20
        } : undefined}
        renderItem={renderItemForList}
      />
    </VenueClusterTooltip>)
}

export default class VenueClusterRenderer implements Renderer {
  private map:google.maps.Map
  constructor (map:google.maps.Map) {
    this.map = map
  }
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
    
    const { $t } = useIntl()
    
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
      title: $t({ defaultMessage: 'Cluster of {count} Venues'}, {count}),
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

    google.maps.event.addListener(this.map, 'click', () => {
      if (typeof(currentInfoWindow) != 'undefined') {
        currentInfoWindow.close()
      }
    })
    return clusterMarker
  }
}
