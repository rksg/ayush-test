import { rest } from 'msw'

import {
  BillingCycleType,
  ConnectionMetering,
  ConnectionMeteringUrls,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import ConnectionMeteringDetail from './index'


const mockConnectionMeteringProfile: ConnectionMetering = {
  id: 'policy-id-1',
  name: 'policy-name-1',
  dataCapacity: 0,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 0,
  downloadRate: 0,
  uploadRate: 0,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_WEEKLY' as BillingCycleType,
  billingCycleDays: 0
}

describe('ConnectionMeteringInstanceTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: 'policy-id-1'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.DETAIL })

  it('should render the data usage metering detail view', async () => {
    mockServer.use(
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringDetail.url,
        (_, res, ctx) => res(ctx.json(mockConnectionMeteringProfile))
      )
    )

    render(
      <Provider>
        <ConnectionMeteringDetail />
      </Provider>, { route: { params, path: detailPath } }
    )

    await screen.findByRole('heading', { name: mockConnectionMeteringProfile.name })
  })
})
