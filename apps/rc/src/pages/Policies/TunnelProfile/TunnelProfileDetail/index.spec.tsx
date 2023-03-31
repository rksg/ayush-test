import { rest } from 'msw'

import { CommonUrlsInfo, getPolicyRoutePath, PolicyOperation, PolicyType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                           from '@acx-ui/store'
import { mockServer, render, screen }                                                         from '@acx-ui/test-utils'

import { mockedNetworkViewData, mockedTunnelProfileViewData } from '../__tests__/fixtures'

import TunnelProfileDetail from '.'

describe('EdgeDhcpDetail', () => {
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

  it('Should render EdgeDhcpDetail successfully', async () => {
    render(
      <Provider>
        <TunnelProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText('tunnelProfile1')
    await screen.findByText('tag1')
    await screen.findByText('Manual (1450)')
    await screen.findByText('ON')
    const row = await screen.findAllByRole('row', { name: /TestNetwork/i })
    expect(row.length).toBe(2)
  })
})