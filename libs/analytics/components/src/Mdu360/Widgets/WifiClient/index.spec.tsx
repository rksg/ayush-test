import { Provider }                                            from '@acx-ui/store'
import { fireEvent, render, screen }                           from '@acx-ui/test-utils'
import { AnalyticsFilter, DateRange, NodesFilter, SSIDFilter } from '@acx-ui/utils'

import { useTopNWifiClientQuery } from './services'

import { WifiClient } from './index'

jest.mock('./services', () => ({
  useTopNWifiClientQuery: jest.fn()
}))

const mockFilters: AnalyticsFilter = {
  filter: { nodes: ['test-network'], ssids: [] } as NodesFilter & SSIDFilter,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-02T00:00:00Z',
  range: DateRange.custom
}

const mockData = {
  nodes: [
    {
      manufacturer: [
        {
          name: 'Apple',
          value: 50
        },
        {
          name: 'Dell',
          value: 40
        },
        {
          name: 'Samsung',
          value: 30
        },
        {
          name: 'Lenovo',
          value: 20
        },
        {
          name: 'Other',
          value: 10
        }
      ],
      deviceType: [
        {
          name: 'Laptop',
          value: 55
        },
        {
          name: 'Phone',
          value: 45
        },
        {
          name: 'Tablet',
          value: 35
        },
        {
          name: 'Smart TV',
          value: 25
        },
        {
          name: 'IoT Device',
          value: 15
        }
      ]
    }
  ]
}

describe('WifiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render device type data correctly', async () => {
    (useTopNWifiClientQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockData
    })

    render(<WifiClient filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('Wi-Fi Client')).toBeVisible()
    expect(await screen.findByText('Device Type')).toBeVisible()
    expect(await screen.findByText('Manufacturer')).toBeVisible()

    expect(await screen.findByText('175')).toBeVisible()

    expect(await screen.findByText('Laptop:')).toBeVisible()
    expect(await screen.findAllByText('55')).toHaveLength(2)
    expect(await screen.findByText('Phone:')).toBeVisible()
    expect(await screen.findAllByText('45')).toHaveLength(2)
    expect(await screen.findByText('Tablet:')).toBeVisible()
    expect(await screen.findAllByText('35')).toHaveLength(2)
    expect(await screen.findByText('Smart TV:')).toBeVisible()
    expect(await screen.findAllByText('25')).toHaveLength(2)
    expect(await screen.findByText('IoT Device:')).toBeVisible()
    expect(await screen.findAllByText('15')).toHaveLength(2)

    const manufacturer = await screen.findByRole('radio', { name: 'Manufacturer' })
    fireEvent.click(manufacturer)

    expect(await screen.findByText('150')).toBeVisible()

    expect(await screen.findByText('Apple:')).toBeVisible()
    expect(await screen.findAllByText('50')).toHaveLength(2)
    expect(await screen.findByText('Samsung:')).toBeVisible()
    expect(await screen.findAllByText('40')).toHaveLength(2)
    expect(await screen.findByText('Dell:')).toBeVisible()
    expect(await screen.findAllByText('30')).toHaveLength(1)
    expect(await screen.findByText('Lenovo:')).toBeVisible()
    expect(await screen.findAllByText('20')).toHaveLength(2)
    expect(await screen.findByText('Other:')).toBeVisible()
    expect(await screen.findAllByText('10')).toHaveLength(2)
  })

  it('should render no data when there is no data', async () => {
    (useTopNWifiClientQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })
    render(<WifiClient filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should handle when the data is empty', async () => {
    (useTopNWifiClientQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { nodes: [
        {
          manufacturer: [],
          deviceType: []
        }
      ] }
    })
    render(<WifiClient filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
