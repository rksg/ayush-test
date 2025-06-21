import { Provider }                                            from '@acx-ui/store'
import { fireEvent, render, screen }                           from '@acx-ui/test-utils'
import { AnalyticsFilter, DateRange, NodesFilter, SSIDFilter } from '@acx-ui/utils'

import { mockTopApplications } from '../fixtures'

import { useTopNApplicationsQuery } from './services'

import { TopApplications } from './index'

jest.mock('./services', () => ({
  useTopNApplicationsQuery: jest.fn()
}))

const mockFilters: AnalyticsFilter = {
  filter: { nodes: ['test-network'], ssids: [] } as NodesFilter & SSIDFilter,
  startDate: '2025-06-15T00:00:00Z',
  endDate: '2025-06-16T00:00:00Z',
  range: DateRange.custom
}

describe('TopApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render client count data correctly', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockTopApplications.network.hierarchyNode
    })

    render(<TopApplications filters={mockFilters} />, { wrapper: Provider })

    expect(await screen.findByText('Top 10 Applications')).toBeVisible()
    expect(await screen.findByText('Client Count')).toBeVisible()
    expect(await screen.findByText('Data Usage')).toBeVisible()

    expect(await screen.findByText('Google Chrome')).toBeVisible()
    expect(await screen.findByText('1250')).toBeVisible()
    expect(await screen.findByText('Microsoft Teams')).toBeVisible()
    expect(await screen.findByText('890')).toBeVisible()
    expect(await screen.findByText('Slack')).toBeVisible()
    expect(await screen.findByText('756')).toBeVisible()
    expect(await screen.findByText('Zoom')).toBeVisible()
    expect(await screen.findByText('634')).toBeVisible()
    expect(await screen.findByText('Spotify')).toBeVisible()
    expect(await screen.findByText('523')).toBeVisible()
    expect(await screen.findByText('Discord')).toBeVisible()
    expect(await screen.findByText('445')).toBeVisible()
    expect(await screen.findByText('Netflix')).toBeVisible()
    expect(await screen.findByText('398')).toBeVisible()
    expect(await screen.findByText('YouTube')).toBeVisible()
    expect(await screen.findByText('367')).toBeVisible()
    expect(await screen.findByText('GitHub')).toBeVisible()
    expect(await screen.findByText('289')).toBeVisible()
    expect(await screen.findByText('Twitch')).toBeVisible()
    expect(await screen.findByText('234')).toBeVisible()

    const dataUsage = await screen.findByRole('radio', { name: 'Data Usage' })
    fireEvent.click(dataUsage)

    expect(await screen.findByText('3 GB')).toBeVisible()
    expect(await screen.findByText('2 GB')).toBeVisible()
    expect(await screen.findByText('1.46 GB')).toBeVisible()
    expect(await screen.findByText('1.5 GB')).toBeVisible()
    expect(await screen.findByText('1 GB')).toBeVisible()
    expect(await screen.findByText('512 MB')).toBeVisible()
    expect(await screen.findByText('256 MB')).toBeVisible()
    expect(await screen.findByText('128 MB')).toBeVisible()
    expect(await screen.findByText('64 MB')).toBeVisible()
    expect(await screen.findByText('32 MB')).toBeVisible()

  })

  it('should render no data when there is no data', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })

    render(<TopApplications filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should handle when the data is empty', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { nodes: [
        {
          manufacturer: [],
          deviceType: []
        }
      ] }
    })
    render(<TopApplications filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should handle when topNApplicationByTraffic is undefined', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: {
        topNApplicationByClient: [
          {
            name: 'Google Chrome',
            clientCount: 1250
          }
        ],
        topNApplicationByTraffic: undefined
      }
    })

    render(<TopApplications filters={mockFilters} />, { wrapper: Provider })

    const dataUsage = await screen.findByRole('radio', { name: 'Data Usage' })
    fireEvent.click(dataUsage)

    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
