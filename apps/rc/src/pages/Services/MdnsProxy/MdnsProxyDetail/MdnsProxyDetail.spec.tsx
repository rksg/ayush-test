import { ServiceType } from '@acx-ui/rc/utils'
import { Provider }    from '@acx-ui/store'
import { render }      from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation } from '../../serviceRouteUtils'

import { MdnsProxyDetail } from './MdnsProxyDetail'

describe('MdnsProxyDetail', () => {
  const params = {
    tenantId: '__Tenant_ID__',
    serviceId: '__Service_ID__'
  }
  // eslint-disable-next-line max-len
  const path = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })

  it('should render the detail view', () => {
    const { asFragment } = render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
