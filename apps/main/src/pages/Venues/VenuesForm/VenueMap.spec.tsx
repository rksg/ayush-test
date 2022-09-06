import { initialize }      from '@googlemaps/jest-mocks'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

import { render } from '@acx-ui/test-utils'

import VenueMap from './VenueMap'

import { Marker } from '.'

describe('Venue map', () => {
  beforeEach(() => {
    initialize()
    const map = new google.maps.Map(document.createElement('div'))
    google.maps.Marker = jest.fn() as never
    google.maps.Marker.prototype.getVisible = jest.fn().mockReturnValue(true)
    google.maps.Marker.prototype.getPosition = jest.fn()
    google.maps.Marker.prototype.addListener = jest.fn()
    google.maps.Marker.prototype.setOptions = jest.fn()
    google.maps.Marker.prototype.setMap = jest.fn().mockImplementation(() => map)
    google.maps.Marker.prototype.getMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.getMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.setMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.getProjection = jest.fn()
  })

  it('should render successfully', () => {
    //render with venue 1
    render(
      <VenueMap
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        zoom={1}
        center={{
          lat: 0,
          lng: 0
        }}
      >
        <Marker />
      </VenueMap>
    )

    expect(google.maps.Marker.prototype.setOptions).toHaveBeenCalled()
  })
})
