import React from 'react'

import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'

import greenMarkerDefaultIcon from '../assets/map/GreenMarkerDefault.svg'
import greenMarkerHoverIcon   from '../assets/map/GreenMarkerHover.svg'

import VenueClusterRenderer                         from './VenueClusterRenderer'
import VenueMarkerWithLabel, { VenueMarkerOptions } from './VenueMarkerWithLabel'

interface MapProps extends google.maps.MapOptions {
  style: React.CSSProperties;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onClusterClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  venues: VenueMarkerOptions[]
  cluster?: boolean
}

const GMap: React.FC<MapProps> = ({
  onClick,
  onClusterClick,
  onIdle,
  venues,
  cluster,
  children,
  style,
  ...options
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<google.maps.Map>()
  const [markerClusterer, setMarkerClusterer] = React.useState<MarkerClusterer>()

  React.useEffect(() => {
    if (ref.current) {
      setMap(new window.google.maps.Map(ref.current, {}))
    }
    return () => setMap(undefined)
  }, [ref])

  React.useEffect(() => {
    if(map){
      ['click', 'idle'].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      )
      if (onClick) {
        map.addListener('click', onClick)
      }

      if (onIdle) {
        map.addListener('idle', () => onIdle(map))
      }
    }
    return function cleanup () {
      if(map) {
        google.maps.event.clearListeners(map, 'click')
        google.maps.event.clearListeners(map, 'idle')
      }
    }
  },[map, onClick, onIdle])

  React.useEffect(() => {
    if (map) {
      if(markerClusterer){
        markerClusterer.clearMarkers()
      }

      // Build the updated markers
      const markers = venues?.map((venue: VenueMarkerOptions) => {
        const marker = new VenueMarkerWithLabel({
          labelContent: '',
          position: (venue.latitude && venue.longitude) ?
            new google.maps.LatLng(venue.latitude, venue.longitude):
            venue.position,
          icon: {
            url: greenMarkerDefaultIcon,
            scaledSize: new google.maps.Size(34, 48)
          }
        }, {
          name: venue.name,
          status: venue.status
        })

        const venueInfoWindow = new google.maps.InfoWindow({
          content: venue.name
        })

        marker.addListener('mouseover', () => {
          marker.setIcon({
            url: greenMarkerHoverIcon,
            scaledSize: new google.maps.Size(34, 48)
          })
          venueInfoWindow.open({
            shouldFocus: false,
            anchor: marker
          })
        })
        marker.addListener('mouseout', () => {
          marker.setIcon({
            url: greenMarkerDefaultIcon,
            scaledSize: new google.maps.Size(34, 48)
          })
          venueInfoWindow.close()
        })
        marker.addListener('click', () => {
          // TODO Navigate to venue page
          // eslint-disable-next-line no-console
          console.log('#TODO - Clicked on marker')
        })
        return marker
      })

      if (markers && markers.length > 1) {
        const bounds = new google.maps.LatLngBounds()
        markers.map((marker: { getPosition: () => any }) =>
          bounds.extend(marker.getPosition())
        )
        map.fitBounds(bounds)
      }

      if(cluster && markers){
        setMarkerClusterer(new MarkerClusterer({
          map,
          markers,
          renderer: new VenueClusterRenderer(),
          algorithm: new SuperClusterAlgorithm({ maxZoom: 22 }),
          onClusterClick: onClusterClick
        }))
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
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          return React.cloneElement(child, { map })
        }
        return child
      })}
    </>
  )
}

export default GMap
