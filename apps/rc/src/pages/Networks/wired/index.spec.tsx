import '@testing-library/jest-dom'

import { rest } from 'msw'

import { switchApi }                  from '@acx-ui/rc/services'
import { SwitchUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

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

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(SwitchUrlsInfo.getCliTemplates.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(SwitchUrlsInfo.getProfiles.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

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

  it('should render breadcrumb and title correctly', async () => {
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
