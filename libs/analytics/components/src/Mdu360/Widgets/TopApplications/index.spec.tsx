import React from 'react'

import { Provider }                                            from '@acx-ui/store'
import { fireEvent, render, screen }                           from '@acx-ui/test-utils'
import { AnalyticsFilter, DateRange, NodesFilter, SSIDFilter } from '@acx-ui/utils'

import { mockTopApplications } from '../fixtures'

import { useTopNApplicationQuery } from './services'
import { formatBytes }             from './utils'

import { TopApplications } from './index'

jest.mock('./services', () => ({
  useTopNApplicationQuery: jest.fn()
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
    (useTopNApplicationQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockTopApplications
    })

    render(<TopApplications filters={mockFilters} />, { wrapper: Provider })

    expect(await screen.findByText('Top 10 Applications')).toBeVisible()
    expect(await screen.findByText('Client Count')).toBeVisible()
    expect(await screen.findByText('Data Usage')).toBeVisible()

    expect(await screen.findByText('Facebook_test')).toBeVisible()
    expect(await screen.findByText('10')).toBeVisible()
    expect(await screen.findByText('Twitter_update')).toBeVisible()
    expect(await screen.findByText('9')).toBeVisible()
    expect(await screen.findByText('new_Google_test')).toBeVisible()
    expect(await screen.findByText('8')).toBeVisible()
    expect(await screen.findByText('Whatsapp-101')).toBeVisible()
    expect(await screen.findByText('7')).toBeVisible()
    expect(await screen.findByText('YouTube_search')).toBeVisible()
    expect(await screen.findByText('6')).toBeVisible()
    expect(await screen.findByText('Netflix_stream')).toBeVisible()
    expect(await screen.findByText('5')).toBeVisible()
    expect(await screen.findByText('LinkedIn')).toBeVisible()
    expect(await screen.findByText('4')).toBeVisible()
    expect(await screen.findByText('Chrome')).toBeVisible()
    expect(await screen.findByText('3')).toBeVisible()
    expect(await screen.findByText('Apple')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    expect(await screen.findByText('new_website')).toBeVisible()
    expect(await screen.findByText('1')).toBeVisible()

    const dataUsage = await screen.findByRole('radio', { name: 'Data Usage' })
    fireEvent.click(dataUsage)

    const dataUsageValues = await screen.findAllByText(/[0-9]+ (B|KB|MB|GB)/)
    const expectedValues = [
      formatBytes(9157432),
      formatBytes(5235759),
      formatBytes(2190550),
      formatBytes(1627108),
      formatBytes(316055),
      formatBytes(131222),
      formatBytes(115551),
      formatBytes(16184),
      formatBytes(1509),
      formatBytes(456)
    ]

    expectedValues.forEach(value => {
      expect(dataUsageValues.some(el => el.textContent === value)).toBe(true)
    })
  })

  it('should render no data when there is no data', async () => {
    (useTopNApplicationQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: null
    })

    render(<TopApplications filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
