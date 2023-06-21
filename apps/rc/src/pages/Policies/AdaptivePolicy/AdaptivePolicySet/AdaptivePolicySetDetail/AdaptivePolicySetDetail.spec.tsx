
import { rest } from 'msw'

import { useIsSplitOn }                                                          from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, DpskUrls, MacRegListUrlsInfo, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                              from '@acx-ui/store'
import { mockServer, render, screen }                                            from '@acx-ui/test-utils'


import { adaptivePolicy, dpskList, macList, networkList, prioritizedPolicies } from './__test__/fixtures'
import AdaptivePolicySetDetail                                                 from './AdaptivePolicySetDetail'

describe('AdaptivePolicySetDetail', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySet.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicy))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.get(
        DpskUrls.getDpskList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(dpskList))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(networkList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macList))
      )
    )
  })

  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
    templateId: '200'
  }

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicySetDetail /></Provider>, {
      route: { params, path: '/:tenantId/:policyId' }
    })

    await screen.findByText('Policy Set Name')

    const names = await screen.findAllByText(adaptivePolicy.name)
    expect(names).toHaveLength(2)
    expect(names[0]).toBeVisible()
    expect(names[1]).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><AdaptivePolicySetDetail /></Provider>, {
      route: { params, path: '/:tenantId/:policyId' }
    })

    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Adaptive Set Policy'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><AdaptivePolicySetDetail /></Provider>, {
      route: { params, path: '/:tenantId/:policyId' }
    })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Adaptive Policy Sets'
    })).toBeVisible()
  })
})
