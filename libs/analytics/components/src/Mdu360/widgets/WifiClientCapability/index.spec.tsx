import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockedWifiClientCapability }                      from './__tests__/fixtures'
import { HierarchyNodeData, useWifiClientCapabilityQuery } from './services'

import { getWifiClientCapabilityChartData, WifiClientCapability } from '.'


jest.mock('./services', () => ({
  useWifiClientCapabilityQuery: jest.fn()
}))

const start = '2024-01-01T00:00:00Z'
const end = '2024-01-02T00:00:00Z'

describe('WifiClientCapability', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render device type data correctly', async () => {
    (useWifiClientCapabilityQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: getWifiClientCapabilityChartData(mockedWifiClientCapability[0] as HierarchyNodeData)
    })

    render(<WifiClientCapability startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('Wi-Fi Client Capability')).toBeVisible()
    expect(await screen.findByText('Capability')).toBeVisible()
    expect(await screen.findByText('Distribution')).toBeVisible()
    expect(await screen.findAllByText('Wi-Fi 6')).not.toBeNull()
  })

  it('should render no data when there is no data', async () => {
    (useWifiClientCapabilityQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })
    render(<WifiClientCapability startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})