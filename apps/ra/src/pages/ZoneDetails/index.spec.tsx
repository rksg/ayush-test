import { Provider }                           from '@acx-ui/store'
import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import '@testing-library/react'
import ZoneDetails from '.'


jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})

describe('ZoneDetails', () => {
  it('should render correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'analytics'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
  })
  it('should render default tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'awrongtab'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
  })
  it('should render clients tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'clients'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByText('clients tab')).toBeVisible()
  })
  it('should render devices tab correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'devices'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByText('zoneName')).toBeVisible()
    expect(await screen.findByText('devices tab')).toBeVisible()
  })
  it('should render navigate tabs correctly', async () => {
    const params = {
      systemName: 'systemName',
      zoneName: 'zoneName',
      activeTab: 'analytics'
    }
    render(<ZoneDetails />, {
      wrapper: Provider,
      route: {
        params,
        path: '/ai/zones/:systemName/:zoneName/:activeTab'
      }
    })
    expect(await screen.findByPlaceholderText('Start date')).toBeVisible()
    const tab = await screen.findByText('Networks')
    fireEvent.click(tab)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Start date')).toBeNull()
    })
  })
})

