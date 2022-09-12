import { ReactNode } from 'react'

import Icon                     from '@ant-design/icons'
import { Cluster,Renderer }     from '@googlemaps/markerclusterer'
import { List, Space, Popover } from 'antd'
import { createRoot }           from 'react-dom/client'
import { IntlShape }            from 'react-intl'

import { ConfigProvider, cssStr } from '@acx-ui/components'

import {
  getClusterSVG,
  getIcon, getMarkerColor,
  getVenueInfoMarkerIcon,
  getVenueSeverityByStatus
} from './helper'
import {
  VenueClusterTooltip,
  CloseIcon } from './styledComponents'
import { VenueMarkerTooltip } from './VenueMarkerTooltip'
import VenueMarkerWithLabel   from './VenueMarkerWithLabel'

import { NavigateProps } from '.'

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
  clusterInfoWindow: google.maps.InfoWindow, onNavigate?: (params: NavigateProps) => void) => {
  let data: VenueClusterTooltipData[] = []

  const sortedMarkers = Array.from(markers).sort((a,b) => {
    const { venueMarker: dataA } = a as VenueMarkerWithLabel
    const { venueMarker: dataB } = b as VenueMarkerWithLabel
    return getVenueSeverityByStatus(dataA.status as string)
      - getVenueSeverityByStatus(dataB.status as string)
  })

  data = sortedMarkers.map((marker)=>{
    const { venueMarker } = marker as VenueMarkerWithLabel
    return {
      icon: <Icon component={getVenueInfoMarkerIcon(venueMarker.status as string)}/>,
      title: venueMarker.name as string,
      popoverContent: <VenueMarkerTooltip
        venueMarker={(marker as VenueMarkerWithLabel).venueMarker}
        needPadding={false}
        onNavigate={onNavigate}
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
  private map: google.maps.Map
  private intl: IntlShape
  private onNavigate?: (params: NavigateProps) => void

  constructor (
    map: google.maps.Map,
    intl: IntlShape,
    onNavigate?: (params: NavigateProps) => void) {
    this.map = map
    this.intl = intl
    this.onNavigate = onNavigate
  }

  public render (
    { count, position, markers }: Cluster
  ): google.maps.Marker {
    const statuses = markers?.map((marker: google.maps.Marker) =>
      (marker as VenueMarkerWithLabel)?.venueMarker?.status)
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
      title: this.intl.$t({ defaultMessage: 'Cluster of {count} Venues' }, { count }),
      // adjust zIndex to be above other markers
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
    })
    clusterMarker.addListener('mouseover', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.hover), scaledSize).icon)
    })
    clusterMarker.addListener('mouseout', () => {
      clusterMarker.setIcon(getIcon(getClusterSVG(clusterColor.default), scaledSize).icon)
    })

    google.maps.event.addListener(clusterMarker, 'click', () => {
      const content = generateClusterInfoContent(markers || [new google.maps.Marker({})],
        clusterInfoWindow, this.onNavigate)

      const infoDiv = document.createElement('div')
      createRoot(infoDiv).render(<ConfigProvider lang='en-US' children={content} />)

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
