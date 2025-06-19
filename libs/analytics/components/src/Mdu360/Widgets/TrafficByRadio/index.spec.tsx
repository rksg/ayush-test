import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { TrafficByRadioData, useTrafficByRadioQuery } from './services'

import { TrafficByRadio, TrafficByRadioFilters } from '.'

const mockUseTrafficByRadioQuery = useTrafficByRadioQuery as jest.Mock

jest.mock('./services', () => ({
  useTrafficByRadioQuery: jest.fn()
}))

const mockFilters: TrafficByRadioFilters = {
  startDate: '2025-06-16T07:23:00+05:30',
  endDate: '2025-06-17T07:23:00+05:30'
}

const mockTrafficByRadioData: TrafficByRadioData = {
  time: [
    '2025-06-16T01:00:00.000Z', '2025-06-16T02:00:00.000Z', '2025-06-16T03:00:00.000Z',
    '2025-06-16T04:00:00.000Z', '2025-06-16T05:00:00.000Z', '2025-06-16T06:00:00.000Z'
  ],
  userTraffic_all: [
    2615523126,
    5508161716,
    7194585327,
    6221988591,
    4840994186,
    6525469926
  ],
  userTraffic_6: [
    1, 2, 3,
    4, 5, 6
  ],
  userTraffic_5: [
    2585534418, 5484309526, 7173649642,
    6194367059, 4820896515, 6372347756
  ],
  userTraffic_24: [
    29988707, 23852188, 20935682,
    27621528, 20097666, 153122164
  ]
}

const mockEmptyTrafficByRadioData: TrafficByRadioData = {
  time: [], userTraffic_all: [], userTraffic_24: [], userTraffic_5: [], userTraffic_6: []
}

function getContainerWithNoChartId (container: HTMLElement) {
  const echartsInstances = container.querySelectorAll('[_echarts_instance_]')
  echartsInstances.forEach((element) =>
    element.removeAttribute('_echarts_instance_')
  )
  const sizeSensorElements = container.querySelectorAll('[size-sensor-id]')
  sizeSensorElements.forEach(element => element.removeAttribute('size-sensor-id'))

  return container
}

describe('TrafficByRadioWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render TrafficByRadio snapshot and trend widgets correctly', async () => {
    mockUseTrafficByRadioQuery.mockReturnValue({
      data: mockTrafficByRadioData
    })

    const { container } = render(
      <TrafficByRadio filters={mockFilters} />, { wrapper: Provider }
    )
    expect(getContainerWithNoChartId(container)).toMatchSnapshot('Snapshot')
    const trafficTrendSwitch = await screen.findByRole('radio', { name: 'Trend' })
    fireEvent.click(trafficTrendSwitch)
    expect(getContainerWithNoChartId(container)).toMatchSnapshot('Trend')
  })

  it('should return no data when query response is undefined', async () => {
    mockUseTrafficByRadioQuery.mockReturnValue({
      data: undefined
    })

    render(<TrafficByRadio filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should return no data when query response data is empty', async () => {
    mockUseTrafficByRadioQuery.mockReturnValue({
      data: mockEmptyTrafficByRadioData
    })

    render(<TrafficByRadio filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})