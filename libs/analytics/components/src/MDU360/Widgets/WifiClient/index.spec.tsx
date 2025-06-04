import React from 'react'

import { Provider }                                            from '@acx-ui/store'
import { fireEvent, render, screen }                           from '@acx-ui/test-utils'
import { AnalyticsFilter, DateRange, NodesFilter, SSIDFilter } from '@acx-ui/utils'

import { useTopNDeviceTypeQuery } from './services'

import { WifiClient } from './index'

jest.mock('./services', () => ({
  useTopNDeviceTypeQuery: jest.fn()
}))

const mockFilters: AnalyticsFilter = {
  filter: { nodes: ['test-network'], ssids: [] } as NodesFilter & SSIDFilter,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-02T00:00:00Z',
  range: DateRange.custom
}

const mockData = {
  nodes: [
    { osType: 'iOS', manufacturer: 'Apple', count: 50 },
    { osType: 'Android', manufacturer: 'Samsung', count: 30 },
    { osType: 'Windows', manufacturer: 'Dell', count: 20 }
  ]
}

describe('WifiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render device type data correctly', async () => {
    (useTopNDeviceTypeQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockData
    })

    render(<WifiClient filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('Wi-Fi Client')).toBeVisible()
    expect(await screen.findByText('Total Wi-Fi Clients')).toBeVisible()
    expect(await screen.findByText('100')).toBeVisible()

    expect(await screen.findByText('iOS - 50')).toBeVisible()
    expect(await screen.findByText('Android - 30')).toBeVisible()
    expect(await screen.findByText('Windows - 20')).toBeVisible()

    const radio = await screen.findByRole('radio', { name: 'Manufacture' })
    fireEvent.click(radio)

    expect(await screen.findByText('Device Type')).toBeVisible()
    expect(await screen.findByText('Total Devices')).toBeVisible()
    expect(await screen.findByText('100')).toBeVisible()
    expect(await screen.findByText('Apple - 50')).toBeVisible()
    expect(await screen.findByText('Samsung - 30')).toBeVisible()
    expect(await screen.findByText('Dell - 20')).toBeVisible()
  })

  it('should render no data when there is no data', async () => {
    (useTopNDeviceTypeQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })
    render(<WifiClient filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
