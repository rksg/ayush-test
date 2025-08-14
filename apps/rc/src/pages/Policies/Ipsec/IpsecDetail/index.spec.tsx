import { rest } from 'msw'

import { Features }       from '@acx-ui/feature-toggle'
import { ipSecApi }       from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType,
  IpsecUrls,
  getPolicyRoutePath,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockIpSecDetailFromListQueryById, mockIpSecDetailFromListQueryWithVxlan } from '../__tests__/fixtures'

import IpsecDetail from '.'


let params: { tenantId: string, policyId: string }
params = {
  tenantId: '__tenantId__',
  policyId: 'a983a74d1791406a9dfb17c6796676d4'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.IPSEC,
  oper: PolicyOperation.DETAIL
})

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

// mock components
jest.mock('./IpsecDetailContent', () => ({
  __esModule: true,
  default: () => <div>IpsecDetailContent</div>
}))
jest.mock('./IpsecTunnelDetail', () => ({
  __esModule: true,
  default: () => <div>IpsecTunnelDetail</div>
}))
jest.mock('./IpsecVenueDetail', () => ({
  __esModule: true,
  default: () => <div>IpsecVenueDetail</div>
}))

describe('IpSec Detail Page', () => {
  beforeEach(() => {
    store.dispatch(ipSecApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockIpSecDetailFromListQueryById.data))
        }
      )
    )
  })

  it('should render Breadcrumb correctly', async () => {
    render(
      <Provider>
        <IpsecDetail />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(await screen.findByRole('link', { name: 'IPsec' })).toBeVisible()
  })

  describe('VxLAN IPSec supported', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_IPSEC_VXLAN_TOGGLE)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render softgre IPSec correctly', async () => {
      mockServer.use(
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => {
            return res(ctx.json({ data: [mockIpSecDetailFromListQueryWithVxlan.data.data[1]] }))
          }
        )
      )

      render(
        <Provider>
          <IpsecDetail />
        </Provider>,
        { route: { params, path: detailPath } }
      )

      await screen.findByText('IpsecDetailContent')
      expect(screen.queryByText('IpsecTunnelDetail')).toBeNull()
      expect(screen.getByText('IpsecVenueDetail')).toBeVisible()
    })

    it('should render VxLAN IPSec supported correctly', async () => {
      mockServer.use(
        rest.post(
          IpsecUrls.getIpsecViewDataList.url,
          (_, res, ctx) => {
            return res(ctx.json(mockIpSecDetailFromListQueryWithVxlan.data))
          }
        )
      )

      render(
        <Provider>
          <IpsecDetail />
        </Provider>,
        { route: { params, path: detailPath } }
      )

      await screen.findByText('IpsecDetailContent')
      expect(screen.getByText('IpsecTunnelDetail')).toBeVisible()
      expect(screen.queryByText('IpsecVenueDetail')).toBeNull()
    })
  })
})