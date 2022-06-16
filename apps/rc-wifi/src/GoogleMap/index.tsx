import * as React from 'react'

import { Wrapper, Status } from '@googlemaps/react-wrapper'

import GMap                   from './GMap'
import { FilterStateChange }  from './VenueFilterControlBox'
import { VenueMarkerOptions } from './VenueMarkerWithLabel'

const render = (status: Status) => {
  return <h1>{status}</h1>
}

export interface GoogleMapProps {
  data: VenueMarkerOptions[]
  cluster?: boolean
}

export function GoogleMap ({ cluster, data }: GoogleMapProps) {
  const [center] = React.useState<google.maps.LatLngLiteral>({
    lat: 13.03,
    lng: 77.692032
  })

  const [venues, setVenues] = React.useState<VenueMarkerOptions[]>([])

  const onClusterClick = (event: google.maps.MapMouseEvent): void => {
    // Stop event propagation, to prevent clicks on the cluster
    event.domEvent.stopPropagation()
  }

  React.useEffect(()=>{
    setVenues(data)
  },[data])

  function onFilterChange (filter: FilterStateChange) {
    setVenues((venues) => {
      const filteredVenues = venues?.map((venue: VenueMarkerOptions) => {
        if (filter.key === venue.status)
          venue.visible = filter.value
        return venue
      })
      return filteredVenues
    })
  }

  return (
    <Wrapper
      //TODO: apiKey should be picked from secrets.
      apiKey='AIzaSyB42fd7gibpZ4cW_kP2md8ajCQbT8HsXFs'
      libraries={['places']}
      render={render}
    >
      <GMap
        center={center}
        mapTypeControl={false}
        streetViewControl={false}
        zoom={3}
        style={{ height: '100%' }}
        venues={venues}
        cluster={cluster}
        onClusterClick={onClusterClick}
        onFilterChange={onFilterChange}
      >
      </GMap>
    </Wrapper>
  )
}
