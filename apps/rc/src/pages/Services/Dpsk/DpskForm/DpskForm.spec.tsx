import { ServiceType } from '@acx-ui/rc/utils'
import { Provider }    from '@acx-ui/store'
import { render }      from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation } from '../../serviceRouteUtils'

import DpskForm from './DpskForm'


describe('DpskForm', () => {
  const params = {
    tenantId: '__Tenant_ID__'
  }

  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })

  it('should create a DPSK service profile', async () => {
    render(
      <Provider>
        <DpskForm />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
  })
})
