import { initialize }      from '@googlemaps/jest-mocks'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

import { render } from '@acx-ui/test-utils'

import GMap                   from './GMap'
import { VenueMarkerOptions } from './VenueMarkerWithLabel'

export  const common = {
  venueId: '7ae27179b7b84de89eb7e56d9b15943d',
  name: 'Aparna-Venue',
  apStat: [],
  switchStat: []
}

export const withCounts = {
  apsCount: 1234,
  switchesCount: 1234,
  clientsCount: 1234,
  switchClientsCount: 1234
}
const venue1: VenueMarkerOptions = {
  visible: true,
  latitude: 14,
  longitude: 12,
  ...common,      
  ...withCounts
}
const venue2: VenueMarkerOptions = {
  visible: true,
  position: null,
  ...common,      
  ...withCounts
}

xdescribe('GMap', () => {
  beforeEach(() => {
    initialize()
    const map = new google.maps.Map(document.createElement('div'))
    google.maps.Marker = jest.fn() as never
    google.maps.Marker.prototype.getVisible = jest.fn().mockReturnValue(true)
    google.maps.Marker.prototype.getPosition = jest.fn()
    google.maps.Marker.prototype.addListener = jest.fn()
    google.maps.Marker.prototype.setMap = jest.fn().mockImplementation(() => map)
    google.maps.Marker.prototype.getMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.getMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.setMap = jest.fn().mockImplementation(() => map)
    MarkerClusterer.prototype.getProjection = jest.fn()
  })

  it('should render successfully', () => {
    //render with venue 1
    const { rerender } = render(
      <GMap
        mapTypeControl={false}
        streetViewControl={false}
        style={{ height: '100%' }}
        venues={[venue1]}
        enableVenueFilter={true}
        cluster={true}
        onClusterClick={jest.fn()}
        onFilterChange={jest.fn()}
        onNavigate={jest.fn()}
        onClick={jest.fn()}
        onIdle={jest.fn()}
      />
    )
    
    //rerender with venue 2
    rerender(
      <GMap
        mapTypeControl={false}
        streetViewControl={false}
        style={{ height: '100%' }}
        venues={[venue2]}
        enableVenueFilter={true}
        cluster={true}
        onClusterClick={jest.fn()}
        onFilterChange={jest.fn()}
        onNavigate={jest.fn()}
        onClick={jest.fn()}
        onIdle={jest.fn()}
      />
    )

    expect(google.maps.Marker.prototype.getVisible).toHaveBeenCalled()
    expect(google.maps.Marker.prototype.getPosition).toHaveBeenCalled()
    expect(google.maps.Marker.prototype.addListener).toHaveBeenCalledWith(
      'mouseover',
      expect.any(Function)
    )
    expect(google.maps.Marker.prototype.addListener).toHaveBeenCalledWith(
      'mouseout',
      expect.any(Function)
    )
    expect(google.maps.Marker.prototype.addListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    )
    expect(MarkerClusterer.prototype.setMap).toHaveBeenCalled()
  })
})
