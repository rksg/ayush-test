import { initialize, mockInstances } from '@googlemaps/jest-mocks'
import { Cluster, MarkerClusterer }  from '@googlemaps/markerclusterer'
import { useIntl }                   from 'react-intl'

import { ApVenueStatusEnum } from '@acx-ui/rc/utils'
import { renderHook }        from '@acx-ui/test-utils'

import VenueClusterRenderer,
{ generateClusterInfoContent,
  renderItemForList,
  VenueClusterTooltipData } from './VenueClusterRenderer'

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
const venueMarker = {
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
  edgeStat: [{
    category: 'Edges',
    series: [
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
        value: 2
      },
      {
        name: '4 Operational',
        value: 3
      }
    ]
  }],
  switchesCount: 2,
  clientsCount: 20,
  edgesCount: 5,
  switchClientsCount: 10,
  edgeClientsCount: 0
}

describe('VenueClusterRenderer', () => {
  beforeAll(() => {
    initialize()
    google.maps.Marker.prototype.set = jest.fn()
  })

  beforeEach(() => {
    // Clear all mocks
    mockInstances.clearAll()
  })

  it('should call render for the markercluster', ()=>{
    const map = new google.maps.Map(document.createElement('div'))
    const { result } = renderHook(() => {
      return new VenueClusterRenderer(map, useIntl(), true)
    })
    const spyRender = jest.spyOn(result.current, 'render')

    const marker1 = new google.maps.Marker()
    marker1.get = jest.fn().mockImplementation(() => (venueMarker))
    const marker2 = new google.maps.Marker()
    marker2.get = jest.fn().mockImplementation(() => (venueMarker))

    const markers: google.maps.Marker[] = [
      marker1, marker2
    ]

    const markerClusterer = new MarkerClusterer({
      markers,
      renderer: result.current
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

  it('should match with snapshot for venue cluster tooltip',() => {
    const markers = Array.from(Array(15).keys()).map(index => {
      const marker = new google.maps.Marker()
      marker.get = jest.fn().mockImplementation(() => ({
        ...venueMarker,
        venueId: `venueId#${index+1}`,name: `Venue #${index+1}`,
        status: index % 2 === 0 ? ApVenueStatusEnum.TRANSIENT_ISSUE : venueMarker.status
      }))
      return marker
    })
    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv = generateClusterInfoContent(markers, clusterInfoWindow, true)
    expect(infoDiv).toMatchSnapshot()
  })
  it('should match with snapshot for venue cluster tooltip when edge disabled',() => {
    const markers = Array.from(Array(15).keys()).map(index => {
      const marker = new google.maps.Marker()
      marker.get = jest.fn().mockImplementation(() => ({
        ...venueMarker,
        venueId: `venueId#${index+1}`,name: `Venue #${index+1}`,
        status: index % 2 === 0 ? ApVenueStatusEnum.TRANSIENT_ISSUE : venueMarker.status
      }))
      return marker
    })
    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv = generateClusterInfoContent(markers, clusterInfoWindow, false)
    expect(infoDiv).toMatchSnapshot()
  })
  it('should match with snapshot for venue cluster tooltip for more than 20 venues',()=>{
    const markers = Array.from(Array(25).keys()).map(index => {
      const marker = new google.maps.Marker()
      marker.get = jest.fn().mockImplementation(() => ({
        ...venueMarker,
        venueId: `venueId#${index+1}`,name: `Venue #${index+1}`,
        status: index % 2 === 0 ? ApVenueStatusEnum.REQUIRES_ATTENTION : venueMarker.status
      }))
      return marker
    })

    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv=generateClusterInfoContent(markers,clusterInfoWindow, true)
    expect(infoDiv).toMatchSnapshot()
  })
  it('should match with snapshot for venue cluster tooltip without pagination',()=>{
    const markers = Array.from(Array(3).keys()).map(index => {
      const marker = new google.maps.Marker()
      marker.get = jest.fn().mockImplementation(() => ({
        ...venueMarker,
        venueId: `venueId#${index+1}`,name: `Venue #${index+1}`
      }))
      return marker
    })

    const clusterInfoWindow = new google.maps.InfoWindow({})
    const infoDiv=generateClusterInfoContent(markers,clusterInfoWindow, true)
    expect(infoDiv).toMatchSnapshot()
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
