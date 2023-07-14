import { VenueMarkerOptions }        from '@acx-ui/rc/utils'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueMarkerTooltip } from './VenueMarkerTooltip'

const withCounts = {
  apsCount: 1234,
  switchesCount: 1234,
  edgesCount: 1234,
  clientsCount: 1234,
  switchClientsCount: 1234,
  edgeClientsCount: 1234
}

const withoutCounts = {
  apsCount: 0,
  switchesCount: 0,
  edgesCount: 0,
  clientsCount: 0,
  switchClientsCount: 0,
  edgeClientsCount: 0
}

const paths = [
  'venue-details/devices',
  'venue-details/clients/wifi',
  'venue-details/devices/switch',
  'venue-details/clients/switch',
  'venue-details/devices/edge',
  'venue-details/clients/edge'
]

const common = {
  venueId: '7ae27179b7b84de89eb7e56d9b15943d',
  name: 'Aparna-Venue',
  apStat: [
    {
      category: 'APs',
      series: [
        {
          name: '1 Requires Attention',
          value: 1
        },
        {
          name: '2 Transient Issue',
          value: 1
        },
        {
          name: '3 In Setup Phase',
          value: 1
        },
        {
          name: '4 Operational',
          value: 1
        }
      ]
    }
  ],
  switchStat: [
    {
      category: 'Switches',
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
          value: 0
        },
        {
          name: '4 Operational',
          value: 0
        }
      ]
    }
  ],
  edgeStat: [
    {
      category: 'Edges',
      series: [
        {
          name: '1 Requires Attention',
          value: 2
        },
        {
          name: '2 Transient Issue',
          value: 2
        },
        {
          name: '3 In Setup Phase',
          value: 2
        },
        {
          name: '4 Operational',
          value: 2
        }
      ]
    }
  ]
}

describe('Venue Marker Tooltip', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not render edge data if feature flag is off', async () => {
    const venue: VenueMarkerOptions = {
      ...common,
      ...withCounts
    }
    const onNavigateMock = jest.fn()

    const { asFragment } = render(
      <VenueMarkerTooltip
        venueMarker={venue}
        onNavigate={onNavigateMock}
        isEdgeEnabled={false} />)
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelectorAll('svg').length).toEqual(2)

    const venueTitle = screen.getByText('Aparna-Venue')
    fireEvent.click(venueTitle)
    expect(onNavigateMock).toHaveBeenCalledWith({
      path: 'venue-details/overview',
      venueId: '7ae27179b7b84de89eb7e56d9b15943d'
    })

    const links = screen.getAllByText('1234')
    expect(links.length).toEqual(4)
    links.forEach((link, i) => {
      fireEvent.click(link)
      expect(onNavigateMock).lastCalledWith({
        path: paths[i],
        venueId: '7ae27179b7b84de89eb7e56d9b15943d'
      })
    })

    expect(onNavigateMock).toBeCalledTimes(5)
  })
  it('should render all charts with counts clickable', async () => {
    const venue: VenueMarkerOptions = {
      ...common,
      ...withCounts
    }
    const onNavigateMock = jest.fn()

    const { asFragment } = render(
      <VenueMarkerTooltip
        venueMarker={venue}
        onNavigate={onNavigateMock}
        isEdgeEnabled={true} />)
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelectorAll('svg').length).toEqual(3)

    const venueTitle = screen.getByText('Aparna-Venue')
    fireEvent.click(venueTitle)
    expect(onNavigateMock).toHaveBeenCalledWith({
      path: 'venue-details/overview',
      venueId: '7ae27179b7b84de89eb7e56d9b15943d'
    })

    const links = screen.getAllByText('1234')
    expect(links.length).toEqual(5)
    links.forEach((link, i) => {
      fireEvent.click(link)
      expect(onNavigateMock).lastCalledWith({
        path: paths[i],
        venueId: '7ae27179b7b84de89eb7e56d9b15943d'
      })
    })

    expect(onNavigateMock).toBeCalledTimes(6)
  })

  it('should not render any data', async () => {
    const venue: VenueMarkerOptions = {
      ...common,
      ...withoutCounts
    }
    const onNavigateMock = jest.fn()
    const { asFragment } = render(
      <VenueMarkerTooltip venueMarker={venue} onNavigate={onNavigateMock} isEdgeEnabled={true} />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render tooltip without padding', async () => {
    const venue: VenueMarkerOptions = {
      ...common,
      ...withoutCounts
    }
    const onNavigateMock = jest.fn()
    const { asFragment } = render(
      <VenueMarkerTooltip
        venueMarker={venue}
        onNavigate={onNavigateMock}
        needPadding={false}
        isEdgeEnabled={true} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
