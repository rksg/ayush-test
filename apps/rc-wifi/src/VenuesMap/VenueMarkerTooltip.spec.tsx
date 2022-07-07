import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueMarkerTooltip } from './VenueMarkerTooltip'
import { VenueMarkerOptions } from './VenueMarkerWithLabel'

const withCounts = {
  apsCount: 1234,
  switchesCount: 1234,
  clientsCount: 1234,
  switchClientsCount: 1234
}

const withoutCounts = {
  apsCount: 0,
  switchesCount: 0,
  clientsCount: 0,
  switchClientsCount: 0
}

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
  ]
}

describe('Venue Marker Tooltip', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render all charts with counts clickable', async () => {
    const venue: VenueMarkerOptions = {
      ...common,
      ...withCounts
    }
    const onNavigateMock = jest.fn()

    const { asFragment } = render(<VenueMarkerTooltip venue={venue} onNavigate={onNavigateMock} />)
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelectorAll('svg').length).toEqual(2)

    const venueTitle = screen.getByText('Aparna-Venue')
    fireEvent.click(venueTitle)
    expect(onNavigateMock).toHaveBeenCalledWith({
      path: 'overview',
      venueId: '7ae27179b7b84de89eb7e56d9b15943d'
    })

    const links = screen.getAllByText('1234')
    expect(links.length).toEqual(4)
    links.forEach(link => {
      fireEvent.click(link)
      expect(onNavigateMock).lastCalledWith({
        path: 'TBD',
        venueId: '7ae27179b7b84de89eb7e56d9b15943d'
      })
    })

    expect(onNavigateMock).toBeCalledTimes(5)
  })
  it('should not render any data', async () => {
    const venue: VenueMarkerOptions = {
      ...common,
      ...withoutCounts
    }
    const onNavigateMock = jest.fn()
    const { asFragment } = render(
      <VenueMarkerTooltip venue={venue} onNavigate={onNavigateMock} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
