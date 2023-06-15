import '@testing-library/jest-dom'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import Wired from '.'
jest.mock('./profiles', () => ({
  ...jest.requireActual('./profiles'),
  ProfilesTab: () => <div data-testid={'profiles-id'} id='profiles-id' />
}))
jest.mock('./onDemandCli', () => ({
  ...jest.requireActual('./onDemandCli'),
  OnDemandCliTab: () => <div data-testid={'onDemandCli-id'} id='onDemandCli-id' />
}))



describe('Wired', () => {

  it('should render profiles correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'profiles'
    }
    render(<Provider><Wired /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Configuration Profiles')).toBeVisible()
  })

  it('should render onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><Wired /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('On-Demand CLI Configuration')).toBeVisible()
  })

  it('should render breadcrumb and title correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'profiles'
    }
    render(<Provider><Wired /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Wired Networks')).toBeVisible()
    expect(screen.queryByText('Wired')).toBeNull()
  })

  it('should render breadcrumb and title correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'profiles'
    }
    render(<Provider><Wired /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Wired Network Profiles')).toBeVisible()
    expect(await screen.findByText('Configuration Profiles (0)')).toBeVisible()
    expect(await screen.findByText('On-Demand CLI Configuration (0)')).toBeVisible()
    expect(await screen.findByText('Wired')).toBeVisible()
  })
})
