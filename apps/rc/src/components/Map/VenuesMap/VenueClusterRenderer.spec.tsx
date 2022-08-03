import { initialize, mockInstances } from '@googlemaps/jest-mocks'
import { Cluster, MarkerClusterer }  from '@googlemaps/markerclusterer'
import { useIntl }                   from 'react-intl'

import { ApVenueStatusEnum } from '@acx-ui/rc/services'

import VenueClusterRenderer, { generateClusterInfoContent, renderItemForList, VenueClusterTooltipData } from './VenueClusterRenderer'
import VenueMarkerWithLabel                                                                             from './VenueMarkerWithLabel'

const series=[
  {
    name: '1 Requires Attention',
    value: 0
  },
  {
    name: '2 Transient Issue',
    value: 0
  },
  {
    name: '3 In Setup Phase',
    value: 0
  },
  {
    name: '4 Operational',
    value: 1
  }
]
const venueData = {
  venueId: 'someVenueId',
  name: 'someVenueName',
  status: ApVenueStatusEnum.OPERATIONAL,
  apStat: [{
    category: 'APs',
    series
  }],
  apsCount: 50,
  switchStat: [{
    category: 'Switches',
    series
  }],
  switchesCount: 2,
  clientsCount: 20,
  switchClientsCount: 10
}


xdescribe('VenueClusterRenderer', () => {
  beforeAll(() => {
    initialize()
  })

  beforeEach(() => {
    // Clear all mocks
    mockInstances.clearAll()
  })

  it('should call render for the markercluster', ()=>{
    const intl = useIntl()

    const map = new google.maps.Map(document.createElement('div'))
    const renderer = new VenueClusterRenderer(map, intl)
    const spyRender = jest.spyOn(renderer, 'render')
    
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
      expect(cluster.marker.addListener).toHaveBeenCalledWith(
        'mouseover',
        expect.any(Function)
      )
      expect(cluster.marker.addListener).toHaveBeenCalledWith(
        'mouseout',
        expect.any(Function)
      )
    })
    expect(spyRender).toHaveBeenCalled()
  })

  it('should match with snapshot for venue cluster tooltip',()=>{
    const markerSpy:any = jest.fn()
    google.maps.Marker = markerSpy
    const markers = Array.from(Array(15).keys()).map(index=>{
      return new VenueMarkerWithLabel({
        labelContent: ''
      },{ ...venueData,
        venueId: `venueId#${index+1}`,name: `Venue #${index+1}`,
        status: index % 2 === 0 ? ApVenueStatusEnum.TRANSIENT_ISSUE : venueData.status })
    })
    
    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv=generateClusterInfoContent(markers,clusterInfoWindow)
    expect(infoDiv).toMatchSnapshot()
    expect(markerSpy).toBeCalled()
  })
  it('should match with snapshot for venue cluster tooltip for more than 20 venues',()=>{
    const markerSpy:any = jest.fn()
    google.maps.Marker = markerSpy
    const markers = Array.from(Array(25).keys()).map(index=>{
      return new VenueMarkerWithLabel({
        labelContent: ''
      },{ ...venueData,
        venueId: `venueId#${index+1}`,name: `Venue #${index+1}`,
        status: index % 2 === 0 ? ApVenueStatusEnum.REQUIRES_ATTENTION : venueData.status })
    })
    
    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv=generateClusterInfoContent(markers,clusterInfoWindow)
    expect(infoDiv).toMatchSnapshot()
    expect(markerSpy).toBeCalled()
  })
  it('should match with snapshot for venue cluster tooltip without pagination',()=>{
    const markerSpy:any = jest.fn()
    google.maps.Marker = markerSpy
    const markers = Array.from(Array(3).keys()).map(index=>{
      return new VenueMarkerWithLabel({
        labelContent: ''
      },{ ...venueData,venueId: `venueId#${index+1}`,name: `Venue #${index+1}` })
    })
    
    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv=generateClusterInfoContent(markers,clusterInfoWindow)
    expect(infoDiv).toMatchSnapshot()
    expect(markerSpy).toBeCalled()
  })
  it('should match with snapshot for renderItemForList',()=>{
    const item: VenueClusterTooltipData = {
      icon: <h3>Some React node instead of icon</h3>,
      title: 'Some Title',
      popoverContent: <h2>Popover content</h2>
    }
    expect(renderItemForList(item)).toMatchSnapshot()
  })
})

