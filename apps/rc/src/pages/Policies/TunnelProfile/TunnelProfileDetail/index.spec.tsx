import { rest } from 'msw'

import { useIsSplitOn }                                                                       from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, getPolicyRoutePath, PolicyOperation, PolicyType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                           from '@acx-ui/store'
import { mockServer, render, screen }                                                         from '@acx-ui/test-utils'

import { mockedNetworkViewData, mockedTunnelProfileViewData, mockedDefaultTunnelProfileViewData } from '../__tests__/fixtures'

import TunnelProfileDetail from '.'

describe('TunnelProfileDetail', () => {
  let params: { tenantId: string, policyId: string }
  const detailPath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.DETAIL
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: 'testPolicyId'
    }

    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkViewData))
      )
    )
  })

  it('Should render TunnelProfileDetail successfully', async () => {
    render(
      <Provider>
        <TunnelProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText('tunnelProfile1')
    // await screen.findByText('tag1')
    await screen.findByText('Manual (1450)')
    await screen.findByText('ON')
    const row = await screen.findAllByRole('row', { name: /TestNetwork/i })
    expect(row.length).toBe(2)
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <TunnelProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Tunnel Profile'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <TunnelProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Tunnel Profile'
    })).toBeVisible()
  })

  it('Should disable Configure button in Default Tunnel Profile', async () => {
    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedDefaultTunnelProfileViewData))
      )
    )
    render(
      <Provider>
        <TunnelProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText('Default')
    expect(screen.queryByRole('button', { name: 'Configure' })).toBeDisabled()
  })
})
