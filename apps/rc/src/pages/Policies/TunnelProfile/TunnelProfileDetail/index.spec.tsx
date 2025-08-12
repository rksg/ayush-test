import { rest } from 'msw'

import { Features, TierFeatures, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { networkApi, tunnelProfileApi }             from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  EdgeTunnelProfileFixtures,
  getPolicyRoutePath,
  IpsecUrls,
  PolicyOperation,
  PolicyType,
  TunnelProfileUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedNetworkViewData } from '../__tests__/fixtures'

import TunnelProfileDetail from '.'

const {
  mockedTunnelProfileViewData,
  mockedDefaultTunnelProfileViewData,
  mockedTunnelProfileViewDataWithIpsecProfileId
} = EdgeTunnelProfileFixtures

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'

const mockUseIsEdgeFeatureReady = jest.fn().mockImplementation(() => false)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: (ff: string) => mockUseIsEdgeFeatureReady(ff)
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
        CommonRbacUrlsInfo.getWifiNetworksList.url,
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

  describe('when SD-LAN and Keep Alive ready', () => {
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
      expect(screen.getByText('Keep Alive Retries')).toBeInTheDocument()
    })
  })

  describe('when NAT-Traversal support is ready', () => {
    beforeEach(() => {
      mockUseIsEdgeFeatureReady
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
      mockUseIsEdgeFeatureReady
        // eslint-disable-next-line max-len
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

  describe('when vxlan ipsec is ready', () => {
    beforeEach(() => {
      mockUseIsEdgeFeatureReady
        // eslint-disable-next-line max-len
        .mockImplementation(ff =>(ff === Features.EDGE_IPSEC_VXLAN_TOGGLE))

      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewDataWithIpsecProfileId))
        ),
        rest.get(
          IpsecUrls.getIpsec.url,
          (_, res, ctx) => res(ctx.json({ name: 'mock-ipsec-name' }))
        )
      )
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should display "Encryption" and "IPSec profile" field', async () => {
      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const encryption = screen.getByText('Encryption')
      expect(encryption).toBeInTheDocument()
      const encryptionContainer = encryption.closest('div.ant-space')
      expect(within(encryptionContainer as HTMLElement).getByText('On')).toBeInTheDocument()
      expect(screen.getByText('IPSec Profile')).toBeInTheDocument()
      expect(await screen.findByText('mock-ipsec-name')).toBeVisible()
    })

    it('should correctly display "Encryption" in off and no "IPSec Profile" field', async () => {
      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
        )
      )

      render(
        <Provider>
          <TunnelProfileDetail />
        </Provider>, {
          route: { params, path: detailPath }
        })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(screen.getByText('tunnelProfile1')).toBeVisible()
      const encryption = screen.getByText('Encryption')
      expect(encryption).toBeInTheDocument()
      const encryptionContainer = encryption.closest('div.ant-space')
      expect(within(encryptionContainer as HTMLElement).getByText('Off')).toBeInTheDocument()
      expect(screen.queryByText('IPSec Profile')).toBeNull()

    })
  })

})

const checkNetworkTable = async () => {
  const row = await screen.findAllByRole('row', { name: /TestNetwork/i })
  expect(row.length).toBe(2)
}
