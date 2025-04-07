import { rest } from 'msw'

import { Features, TierFeatures, useIsTierAllowed }                                                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                                                         from '@acx-ui/rc/components'
import { networkApi, tunnelProfileApi }                                                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeTunnelProfileFixtures, getPolicyRoutePath, PolicyOperation, PolicyType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved }                                                from '@acx-ui/test-utils'

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
  const mockedGetVMNetworksList = jest.fn()
  beforeEach(() => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }
    store.dispatch(tunnelProfileApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockedGetVMNetworksList.mockClear()
    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => {
          mockedGetVMNetworksList()
          return res(ctx.json(mockedNetworkViewData))
        }
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
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedGetVMNetworksList).toBeCalled())
    await screen.findByText('tunnelProfile1')
    // await screen.findByText('tag1')
    await screen.findByText('Manual (1450)')
    await screen.findByText('ON')
    await checkNetworkTable()
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
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedGetVMNetworksList).toBeCalled())
    await screen.findByText('Default')
    expect(screen.queryByRole('button', { name: 'Configure' })).toBeDisabled()
    await checkNetworkTable()
  })

  describe('when SD-LAN ready, Keep Alive not ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE))
    })

    it('should display tunnel type', async () => {
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      await waitFor(() => expect(mockedGetVMNetworksList).toBeCalled())
      await screen.findByText('Tunnel Type')
      await screen.findByText('VxLAN')
      await checkNetworkTable()
      expect(screen.queryByText('Network Segment Type')).not.toBeInTheDocument()
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
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      await waitFor(() => expect(mockedGetVMNetworksList).toBeCalled())
      await screen.findByText('tunnelProfile2')
      await screen.findByText('Tunnel Type')
      await screen.findByText('VxLAN')
      await checkNetworkTable()
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
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      await waitFor(() => expect(mockedGetVMNetworksList).toBeCalled())
      await screen.findByText('Default tunnel profile (SD-LAN)')
      await screen.findByText('VLAN-VxLAN')
      expect(screen.queryByRole('button', { name: 'Configure' })).toBeDisabled()
      await checkNetworkTable()
    })
  })

  describe('when SD-LAN and Keep Alive ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
          || ff === Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
    })

    it('should display network segment type and keep alive related columns', async () => {
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByText('Network Segment Type')).toBeInTheDocument()
      expect(screen.queryByText('Tunnel Type')).not.toBeInTheDocument()
      expect(screen.getByText('PMTU Timeout')).toBeInTheDocument()
      expect(screen.getByText('PMTU Retries')).toBeInTheDocument()
      expect(screen.getByText('Keep Alive Interval')).toBeInTheDocument()
      expect(screen.getByText('Keep Alive Reties')).toBeInTheDocument()
    })
  })

  describe('when NAT-Traversal support is ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
    })

    it('should display "NAT-T Support" field', async () => {
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByText('NAT-T Support')).toBeInTheDocument()
    })
  })

  describe('when L2GRE is ready', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGE_L2OGRE_TOGGLE))
      jest.mocked(useIsTierAllowed)
        .mockImplementation(ff => ff === TierFeatures.EDGE_L2OGRE)
    })

    it('should display "Tunnel Type" and "Destination" field', async () => {
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByText('Tunnel Type')).toBeInTheDocument()
      expect(screen.getByText('Destination')).toBeInTheDocument()
    })
  })

})

const checkNetworkTable = async () => {
  const row = await screen.findAllByRole('row', { name: /TestNetwork/i })
  expect(row.length).toBe(2)
}