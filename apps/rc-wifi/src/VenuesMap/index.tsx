import * as React from 'react'

import { Wrapper, Status } from '@googlemaps/react-wrapper'

import { get }                        from '@acx-ui/config'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import GMap                   from './GMap'
import { FilterStateChange }  from './VenueFilterControlBox'
import { VenueMarkerOptions } from './VenueMarkerWithLabel'

export interface GoogleMapProps {
  data: VenueMarkerOptions[]
  cluster?: boolean,
  enableVenueFilter?: boolean
}

export interface NavigateProps {
  venueId: string,
  path?: string
}

export function VenuesMap ({ cluster, data, enableVenueFilter }: GoogleMapProps) {

  const [venues, setVenues] = React.useState<VenueMarkerOptions[]>([])

  const basePath = useTenantLink('/venues/')
  const navigate = useNavigate()

  /* istanbul ignore next */
  const onNavigate = (params: NavigateProps) => {
    const { venueId, path } = params
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${venueId}/${path}`
    })
  }

  /* istanbul ignore next */
  const onFilterChange = (filter: FilterStateChange) => {
    setVenues((venues) => {
      const filteredVenues = venues?.map((venue: VenueMarkerOptions) => {
        if (filter.key === venue.status)
          venue.visible = filter.value
        return venue
      })
      return filteredVenues
    })
  }

  /* istanbul ignore next */
  const onClusterClick = (event: google.maps.MapMouseEvent): void => {
    // Stop event propagation, to prevent clicks on the cluster
    event.domEvent.stopPropagation()
  }

  React.useEffect(()=>{
    setVenues(data)
  },[data])

  const render = (status: Status) => {
    return <h1>{status}</h1>
  }

  return (
    <Wrapper
      apiKey={get('GOOGLE_MAPS_KEY')}
      libraries={['places']}
      render={render}
    >
      <GMap
        mapTypeControl={false}
        streetViewControl={false}
        style={{ height: '100%' }}
        venues={venues}
        enableVenueFilter={enableVenueFilter}
        cluster={cluster}
        onClusterClick={onClusterClick}
        onFilterChange={onFilterChange}
        onNavigate={onNavigate}
      >
      </GMap>
    </Wrapper>
  )
}
