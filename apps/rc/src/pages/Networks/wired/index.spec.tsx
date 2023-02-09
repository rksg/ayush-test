import '@testing-library/jest-dom'

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

})
