import React from 'react'


import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'
import * as _                                     from 'lodash'
import { createRoot }                             from 'react-dom/client'
import { useIntl }                                from 'react-intl'

import { ConfigProvider } from '@acx-ui/components'

import { getMarkerSVG, getMarkerColor, getIcon }    from './helper'
import VenueClusterRenderer                         from './VenueClusterRenderer'
import VenueFilterControlBox, { FilterStateChange } from './VenueFilterControlBox'
import { VenueMarkerTooltip }                       from './VenueMarkerTooltip'
import VenueMarkerWithLabel, { VenueMarkerOptions } from './VenueMarkerWithLabel'

import { NavigateProps } from './index'

interface MapProps extends google.maps.MapOptions {
  style: React.CSSProperties;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onClusterClick?: (e: google.maps.MapMouseEvent) => void;
  onFilterChange?: (e: FilterStateChange) => void;
  onNavigate?: (params: NavigateProps) => void;
  onIdle?: (map: google.maps.Map) => void;
  venues: VenueMarkerOptions[]
  cluster?: boolean
  enableVenueFilter?: boolean
  children?: React.ReactNode
}

const GMap: React.FC<MapProps> = ({
  onClick,
  onClusterClick,
  onIdle,
  onFilterChange,
  onNavigate,
  venues,
  cluster,
  enableVenueFilter,
  children,
  style,
  ...options
}) => {
  const intl = useIntl()
  const ref = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<google.maps.Map>()
  const [markerClusterer, setMarkerClusterer] = React.useState<MarkerClusterer>()
  const venueInfoWindow = new google.maps.InfoWindow({})

  React.useEffect(() => {
    if (ref.current) {
      setMap(new window.google.maps.Map(ref.current, {}))
    }
    return () => setMap(undefined)
  }, [ref])

  React.useEffect(() => {
    if(map) {
      if (enableVenueFilter && onFilterChange
        && map.controls[google.maps.ControlPosition.TOP_LEFT].getLength() === 0) {
        const legendControlBoxDiv = document.createElement('div')
        const root = createRoot(legendControlBoxDiv!)
        root.render(
          <ConfigProvider lang='en-US'>
            <VenueFilterControlBox onChange={onFilterChange} />
          </ConfigProvider>
        )
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(legendControlBoxDiv)
      }
      if (onClick) {
        google.maps.event.addListener(map, 'click', onClick)
      }
      if (onIdle) {
        google.maps.event.addListener(map, 'idle', () => onIdle(map))
      }
      google.maps.event.addListener(map, 'zoom_changed', () => {
        if (venueInfoWindow) {
          venueInfoWindow.close()
        }
      })
    }
    return function cleanup () {
      if(map) {
        ['click', 'idle', 'zoom_changed'].forEach((eventName) =>
          google.maps.event.clearListeners(map, eventName))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[map, onClick, onIdle])

  React.useEffect(() => {
    if (map) {
      if(markerClusterer){
        markerClusterer.clearMarkers()
      }
      const maxVenueCountPerVenue = (venues?.length > 0) ?
        _.maxBy(venues, 'apsCount')?.apsCount : null

      // Build the updated markers
      let markers = venues?.map((venueMarker: VenueMarkerOptions) => {
        let markerSize = 32
        // DEFINITIONS: No APs = 32px, minimum # of APs (>0) = 48 px, maximum # of APs = 96px

        if(venueMarker?.apsCount > 0){
          markerSize = 48 + (venueMarker?.apsCount / maxVenueCountPerVenue!) * 48
        }
        const markerColor = getMarkerColor([venueMarker.status])
        const svgMarkerDefault = getMarkerSVG(markerColor.default)
        const svgMarkerHover = getMarkerSVG(markerColor.hover)
        const scaledSize = new google.maps.Size(markerSize, markerSize)

        const marker = new VenueMarkerWithLabel({
          labelContent: '',
          position: (venueMarker.latitude && venueMarker.longitude) ?
            new google.maps.LatLng(venueMarker.latitude, venueMarker.longitude):
            venueMarker.position,
          ...getIcon(svgMarkerDefault, scaledSize),
          visible: venueMarker.visible
        }, venueMarker)

        let closeInfoWindowWithTimeout: NodeJS.Timeout
        marker.addListener('mouseover', () => {
          marker.setIcon(getIcon(svgMarkerHover, scaledSize).icon)

          const infoDiv = document.createElement('div')
          createRoot(infoDiv).render(
            <ConfigProvider lang='en-US'>
              <VenueMarkerTooltip
                venueMarker={venueMarker}
                onNavigate={onNavigate}
              />
            </ConfigProvider>
          )
          infoDiv.addEventListener('mouseover', () => {
            clearTimeout(closeInfoWindowWithTimeout)
          })
          infoDiv.addEventListener('mouseout', () => {
            closeInfoWindowWithTimeout = setTimeout(() => {
              venueInfoWindow.close()
            }, 100)
          })
          venueInfoWindow.setContent(infoDiv)
          venueInfoWindow.open({
            shouldFocus: true,
            anchor: marker
          })
        })
        marker.addListener('mouseout', () => {
          marker.setIcon(getIcon(svgMarkerDefault, scaledSize).icon)
          closeInfoWindowWithTimeout = setTimeout(() => venueInfoWindow.close(), 100)
        })
        marker.addListener('click', () => {
          onNavigate && onNavigate({
            venueId: venueMarker.venueId,
            path: 'overview'
          })
        })
        return marker
      })

      markers = markers.filter(marker => marker.getVisible())
      if (markers && markers.length > 0) {
        if(cluster){
          setMarkerClusterer(new MarkerClusterer({
            map,
            markers,
            renderer: new VenueClusterRenderer(map, intl, onNavigate),
            algorithm: new SuperClusterAlgorithm({ maxZoom: 22 }),
            onClusterClick: onClusterClick
          }))
        }

        const bounds = new google.maps.LatLngBounds()
        markers.map((marker) => bounds.extend(marker.getPosition()!))
        map.fitBounds(bounds)
      }

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, cluster, onClusterClick, venues])

  React.useEffect(() => {
    if (map) {
      map.setOptions(options)
    }
  }, [map, options])

  return (
    <div id='map' ref={ref} style={style} />
  )
}

export default GMap
