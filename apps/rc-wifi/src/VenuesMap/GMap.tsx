import React from 'react'

import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'
import * as _                                     from 'lodash'
import { createRoot }                             from 'react-dom/client'

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
  const ref = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<google.maps.Map>()
  const [markerClusterer, setMarkerClusterer] = React.useState<MarkerClusterer>()
  const venueInfoWindow = new google.maps.InfoWindow({})

  React.useEffect(() => {
    /* istanbul ignore else */
    if (ref.current) {
      const map = new window.google.maps.Map(ref.current, {})
      setMap(map)
    }
    return () => setMap(undefined)
  }, [ref])

  React.useEffect(() => {
    /* istanbul ignore else */
    if(map){
      /* istanbul ignore else */
      if (enableVenueFilter && onFilterChange
        && map.controls[google.maps.ControlPosition.TOP_LEFT].getLength() === 0) {
        const legendControlBoxDiv = document.createElement('div')
        const root = createRoot(legendControlBoxDiv!)
        root.render(<VenueFilterControlBox onChange={onFilterChange} />)
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(legendControlBoxDiv)
      }

      ['click', 'idle', 'zoom_changed'].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      )
      /* istanbul ignore else */
      if (onClick) {
        google.maps.event.addListener(map, 'click', onClick)
      }
      /* istanbul ignore else */
      if (onIdle) {
        /* istanbul ignore next */
        google.maps.event.addListener(map, 'idle', () => onIdle(map))
      }
      /* istanbul ignore next */
      google.maps.event.addListener(map, 'zoom_changed', () => {
        if (venueInfoWindow) {
          venueInfoWindow.close()
        }
      })
    }
    return function cleanup () {
      /* istanbul ignore else */
      if(map) {
        ['click', 'idle', 'zoom_changed'].forEach((eventName) =>
          google.maps.event.clearListeners(map, eventName))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[map, onClick, onIdle])

  React.useEffect(() => {
    /* istanbul ignore else */
    if (map) {
      if(markerClusterer){
        markerClusterer.clearMarkers()
      }
      const maxVenueCountPerVenue = (venues?.length > 0) ?
        _.maxBy(venues, 'apsCount')?.apsCount : null

      // Build the updated markers
      let markers = venues?.map((venue: VenueMarkerOptions) => {
        let markerSize = 32
        // DEFINITIONS: No APs = 32px, minimum # of APs (>0) = 48 px, maximum # of APs = 96px
      
        /* istanbul ignore else */
        if(venue?.apsCount > 0){
          markerSize = 48 + (venue?.apsCount / maxVenueCountPerVenue!) * 48
        }
        const markerColor = getMarkerColor([venue.status])
        const svgMarkerDefault = getMarkerSVG(markerColor.default)
        const svgMarkerHover = getMarkerSVG(markerColor.hover)
        const scaledSize = new google.maps.Size(markerSize, markerSize)

        const marker = new VenueMarkerWithLabel({
          labelContent: '',
          position: (venue.latitude && venue.longitude) ?
            new google.maps.LatLng(venue.latitude, venue.longitude):
            venue.position,
          ...getIcon(svgMarkerDefault, scaledSize),
          visible: venue.visible
        }, {
          venueId: venue.venueId,
          name: venue.name,
          status: venue.status,
          apStat: venue.apStat,
          apsCount: venue.apsCount,
          switchStat: venue.switchStat,
          switchesCount: venue.switchesCount,
          clientsCount: venue.clientsCount,
          switchClientsCount: venue.switchClientsCount
        })

        let closeInfoWindowWithTimeout: NodeJS.Timeout
        /* istanbul ignore next */
        marker.addListener('mouseover', () => {
          marker.setIcon(getIcon(svgMarkerHover, scaledSize).icon)

          const infoDiv = document.createElement('div')
          createRoot(infoDiv).render(<VenueMarkerTooltip venue={venue} onNavigate={onNavigate}/>)
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
        /* istanbul ignore next */
        marker.addListener('mouseout', () => {
          marker.setIcon(getIcon(svgMarkerDefault, scaledSize).icon)
          closeInfoWindowWithTimeout = setTimeout(() => venueInfoWindow.close(), 100)
        })
        /* istanbul ignore next */
        marker.addListener('click', () => {
          onNavigate && onNavigate({
            venueId: venue.venueId,
            path: 'overview'
          })
        })
        return marker
      })

      markers = markers.filter(marker => marker.getVisible())
      /* istanbul ignore else */
      if (markers && markers.length > 0) {
        /* istanbul ignore else */
        if(cluster){
          setMarkerClusterer(new MarkerClusterer({
            map,
            markers,
            renderer: new VenueClusterRenderer(),
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
