import { rest } from 'msw'

import { useIsEdgeFeatureReady }                                                              from '@acx-ui/rc/components'
import { CommonUrlsInfo, getPolicyRoutePath, PolicyOperation, PolicyType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { EdgeTunnelProfileFixtures }                                                          from '@acx-ui/rc/utils'
import { Provider }                                                                           from '@acx-ui/store'
import { mockServer, render, screen }                                                         from '@acx-ui/test-utils'

import { mockedNetworkViewData } from '../__tests__/fixtures'

import TunnelProfileDetail from '.'

const {
  mockedTunnelProfileViewData,
  mockedDefaultTunnelProfileViewData,
  mockedDefaultVlanVxlanTunnelProfileViewData
} = EdgeTunnelProfileFixtures
const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

describe('TunnelProfileDetail', () => {
  let params: { tenantId: string, policyId: string }
  const detailPath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.DETAIL
  })
  beforeEach(() => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }

    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockedNetworkViewData))
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

  it('should render breadcrumb correctly', async () => {
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
        (_, res, ctx) => res(ctx.json(mockedDefaultTunnelProfileViewData))
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

  describe('when SD-LAN ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
    })

    it('should display tunnel type', async () => {
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })
      await screen.findByText('Tunnel Type')
      await screen.findByText('VxLAN')
    })

    it('should display VxLAN as default tunnel type', async () => {
      const mockedDataWithoutType = {
        ...mockedTunnelProfileViewData
      }
      mockedDataWithoutType.data[0].name = 'tunnelProfile2'
      mockedDataWithoutType.data[0].type = ''

      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockedDataWithoutType))
        ))

      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })
      await screen.findByText('tunnelProfile2')
      await screen.findByText('Tunnel Type')
      await screen.findByText('VxLAN')
    })

    it('Should disable Configure button in VLAN_VXLAN Default Tunnel Profile', async () => {
      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockedDefaultVlanVxlanTunnelProfileViewData))
        )
      )
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })

      await screen.findByText('Default tunnel profile (SD-LAN)')
      await screen.findByText('VLAN-VxLAN')
      expect(screen.queryByRole('button', { name: 'Configure' })).toBeDisabled()
    })
  })
})
