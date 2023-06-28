import { rest } from 'msw'

import { useIsTierAllowed, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, MacRegListUrlsInfo, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                    from '@acx-ui/store'
import { mockServer, render, screen }                                  from '@acx-ui/test-utils'

import MacRegistrationListDetails from './MacRegistrarionListDetails'

const policySet = {
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'testPolicySet1',
  description: 'for test'
}

const macRegList = {
  id: '373377b0cb6e46ea8982b1c80aabe1fa',
  autoCleanup: true,
  description: '',
  enabled: true,
  expirationEnabled: false,
  name: 'Registration pool',
  defaultAccess: 'ACCEPT',
  policySetId: policySet.id,
  networkIds: ['test_network_id']
}

const networkList = {
  totalCount: 10,
  page: 1,
  data: [
    {
      aps: 1,
      clients: 0,
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      nwSubType: 'psk',
      ssid: '01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      count: 3,
      names: ['pingtung', 'My-Venue', '101'],
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'ClickThrough',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8798',
      name: 'network-02',
      nwSubType: 'guest',
      ssid: '02',
      venues: { count: 0, names: [] },
      vlan: 1
    }
  ]
}

describe('MacRegistrationListDetails', () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)

  beforeEach(() => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(macRegList))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(networkList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySet.url,
        (req, res, ctx) => res(ctx.json(policySet))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'overview'
    }

    render(<Provider><MacRegistrationListDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/:policyId/:activeTab' }
    })

    const names = await screen.findAllByText('Registration pool')
    expect(names[0]).toBeVisible()
    expect(names[1]).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(await screen.findByText('Overview')).toBeVisible()
    expect(await screen.findByText('MAC Registrations')).toBeVisible()

    expect(await screen.findByText('Never expires')).toBeVisible()
    expect(await screen.findByText('Yes')).toBeVisible()
    expect(await screen.findByText('ACCEPT')).toBeVisible()

    expect(await screen.findByText(networkList.data[0].name)).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'overview'
    }

    render(<Provider><MacRegistrationListDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/:policyId/:activeTab' }
    })

    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'MAC Registration Lists'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'overview'
    }

    render(<Provider><MacRegistrationListDetails /></Provider>, {
      // eslint-disable-next-line max-len
      route: { params, path: '/:tenantId/t/:policyId/:activeTab' }
    })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'MAC Registration Lists'
    })).toBeVisible()
  })

  it('should not have active tab if it does not exist', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
      activeTab: 'not-exist'
    }
    render(<Provider><MacRegistrationListDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:policyId/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })
})

