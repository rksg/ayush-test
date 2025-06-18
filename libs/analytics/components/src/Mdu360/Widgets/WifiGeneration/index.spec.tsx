import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockedWifiGeneration }                   from './__tests__/fixtures'
import { ApDistribution, useWifiGenerationQuery } from './services'

import { getWifiGenerationChartData, WifiGeneration } from '.'


jest.mock('./services', () => ({
  useWifiGenerationQuery: jest.fn()
}))

const start = '2024-01-01T00:00:00Z'
const end = '2024-01-02T00:00:00Z'

describe('WifiGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render device type data correctly', async () => {
    (useWifiGenerationQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: getWifiGenerationChartData(mockedWifiGeneration as ApDistribution[])
    })

    render(<WifiGeneration startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('Wi-Fi Generation')).toBeVisible()
    expect(await screen.findByText('Distribution')).toBeVisible()
    expect(await screen.findByText('Upgrade Opportunity')).toBeVisible()
    expect(await screen.findByText('Total APs')).toBeVisible()
  })

  it('should render no data when there is no data', async () => {
    (useWifiGenerationQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })
    render(<WifiGeneration startDate={start} endDate={end} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})