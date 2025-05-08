import { rest } from 'msw'

import { serviceApi }      from '@acx-ui/rc/services'
import { PortalUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen } from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }                          from '@acx-ui/types'
import { CustomRoleType, getUserProfile, setUserProfile } from '@acx-ui/user'


import { mockDetailResult } from './__tests__/fixtures'

import PortalServiceDetail from '.'

jest.mock('@acx-ui/rc/components', () => ({
  PortalOverview: () => <div data-testid='PortalOverview' />,
  PortalInstancesTable: () => <div data-testid='PortalInstancesTable' />
}))

describe('Portal Detail Page', () => {
  const params = {
    tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
    serviceId: '373377b0cb6e46ea8982b1c80aabe1fa' }
  beforeEach(async () => {
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => res(ctx.json(mockDetailResult))
      )
    )
  })

  it('should render detail page', async () => {
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByTestId('PortalOverview')).toBeVisible()
    expect(await screen.findByTestId('PortalInstancesTable')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><PortalServiceDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Guest Portal'
    })).toBeVisible()
  })

  describe('ABAC permission', () => {
    it('should dispaly with custom scopeKeys', async () => {
      setUserProfile({
        profile: {
          ...getUserProfile().profile,
          customRoleType: CustomRoleType.SYSTEM,
          customRoleName: RolesEnum.ADMINISTRATOR
        },
        allowedOperations: [],
        abacEnabled: true,
        isCustomRole: false,
        hasAllVenues: true
      })

      render(<Provider><PortalServiceDetail /></Provider>, {
        route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
      })
      expect(await screen.findByRole('button', { name: 'Configure' })).toBeVisible()
    })

    it('should correctly hide with custom scopeKeys', async () => {
      setUserProfile({
        profile: {
          ...getUserProfile().profile
        },
        allowedOperations: [],
        abacEnabled: true,
        isCustomRole: true,
        scopes: [WifiScopes.DELETE]
      })

      render(<Provider><PortalServiceDetail /></Provider>, {
        route: { params, path: '/:tenantId/t/services/portal/:serviceId/detail' }
      })
      expect(screen.queryByRole('button', { name: 'Configure' })).toBeNull()
    })
  })
})
