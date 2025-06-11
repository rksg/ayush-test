import React from 'react'

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
          value: 30
        },
        {
          name: 'Dell',
          value: 30
        },
        {
          name: 'Samsung',
          value: 20
        }
      ],
      deviceType: [
        {
          name: 'Laptop',
          value: 80
        },
        {
          name: 'Phone',
          value: 10
        },
        {
          name: 'Tablet',
          value: 10
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
    expect(await screen.findByText('Manufacture')).toBeVisible()

    expect(await screen.findByText('Total Wi-Fi Clients')).toBeVisible()
    expect(await screen.findByText('100')).toBeVisible()
    expect(await screen.findByText('Laptop: 80')).toBeVisible()
    expect(await screen.findByText('Phone: 10')).toBeVisible()
    expect(await screen.findByText('Tablet: 10')).toBeVisible()

    const manufacturer = await screen.findByRole('radio', { name: 'Manufacture' })
    fireEvent.click(manufacturer)

    expect(await screen.findByText('Total Devices')).toBeVisible()
    expect(await screen.findByText('80')).toBeVisible()
    expect(await screen.findByText('Apple: 30')).toBeVisible()
    expect(await screen.findByText('Samsung: 20')).toBeVisible()
    expect(await screen.findByText('Dell: 30')).toBeVisible()
  })

  it('should render no data when there is no data', async () => {
    (useTopNWifiClientQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })
    render(<WifiClient filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
