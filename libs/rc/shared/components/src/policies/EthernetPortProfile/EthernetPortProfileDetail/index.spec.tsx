import { rest } from 'msw'

import { ethernetPortProfileApi }                                                            from '@acx-ui/rc/services'
import { AaaUrls, EthernetPortProfileUrls, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }                                                                   from '@acx-ui/store'
import { mockServer, render, screen }                                                        from '@acx-ui/test-utils'

import {
  dummayRadiusServiceList,
  dummyAccounting,
  dummyAuthRadius,
  dummyEthernetPortProfileAccessPortBased,
  dummyEthernetPortProfileTrunk,
  mockAccuntingRadiusName,
  mockAuthRadiusId,
  mockAuthRadiusName,
  mockEthernetPortProfileId3 } from '../__tests__/fixtures'

import EthernetPortProfileDetail from '.'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

let params: { tenantId: string, policyId: string }
const detailPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.ETHERNET_PORT_PROFILE,
  oper: PolicyOperation.DETAIL
})
describe('EthernetPortProfileDetail', () => {
  beforeEach(() => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }

    store.dispatch(ethernetPortProfileApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (req, res, ctx) => res(ctx.json(dummyEthernetPortProfileTrunk))
      ),

      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (req, res, ctx) => res(ctx.json(dummyEthernetPortProfileAccessPortBased))
      ),

      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(dummayRadiusServiceList))
      ),

      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          if (req.params.policyId === mockAuthRadiusId) {
            return res(ctx.json(dummyAuthRadius))
          } else {
            return res(ctx.json(dummyAccounting))
          }
        }
      )
    )
  })

  it('Should render EthernetPortProfileDetail successfully', async () => {
    render(
      <Provider>
        <EthernetPortProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText(mockEthernetPortProfileId3)
    await screen.findByText('ON (Port-based Authenticator)')
    await screen.findByText(mockAuthRadiusName)
    await screen.findAllByText(mockAccuntingRadiusName)
  })

})