import { initialize, mockInstances } from '@googlemaps/jest-mocks'
import { Cluster,MarkerClusterer }   from '@googlemaps/markerclusterer'

import VenueClusterRenderer from './VenueClusterRenderer'





describe('VenueClusterRenderer', () => {
  beforeAll(() => {
    initialize()
  })
  // Clear all mocks
  beforeEach(() => {
    mockInstances.clearAll()
  })

  it('should call render for the markercluster', ()=>{
    const renderer = new VenueClusterRenderer()
    const spyRender = jest.spyOn(renderer, 'render')
    
    const map = new google.maps.Map(document.createElement('div'))

    const markers: google.maps.Marker[] = [
      new google.maps.Marker(),
      new google.maps.Marker()
    ]
    
    const markerClusterer = new MarkerClusterer({
      markers,
      renderer
    })

    markerClusterer.getMap = jest.fn().mockImplementation(() => map)
    
    const clusters = [new Cluster({ markers }), new Cluster({ markers })]
    
    markerClusterer['clusters'] = clusters
    markerClusterer['renderClusters']()
    
    clusters.forEach((cluster) => {
      expect(cluster.marker.setMap).toBeCalledWith(map)
      // expect(cluster.marker.addListener).toHaveBeenCalledWith(
      //   'mouseover',
      //   expect.any(Function)
      // )
      // expect(cluster.marker.addListener).toHaveBeenCalledWith(
      //   'mouseout',
      //   expect.any(Function)
      // )
    })
    expect(spyRender).toHaveBeenCalled()
  })
})

