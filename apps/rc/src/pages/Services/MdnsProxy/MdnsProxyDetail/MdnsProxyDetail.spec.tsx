import { ServiceType }    from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation, getServiceDetailsLink } from '../../serviceRouteUtils'

import MdnsProxyDetail from './MdnsProxyDetail'


describe('MdnsProxyDetail', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })

  it('should render the detail view', () => {
    const { asFragment } = render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/t/${params.tenantId}/` + getServiceDetailsLink({
      type: ServiceType.MDNS_PROXY,
      oper: ServiceOperation.EDIT,
      serviceId: params.serviceId
    })

    render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
