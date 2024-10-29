import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeMdnsFixtures,
  EdgeMdnsProxyUrls,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import EdgeMdnsProxyDetails from './'

const { mockEdgeMdnsSetting } = EdgeMdnsFixtures

jest.mock('./InstancesTable', () => ({
  ...jest.requireActual('./InstancesTable'),
  InstancesTable: () => <div data-testid='rc-InstancesTable'></div>
}))
describe('Edge mDNS Proxy Detail', () => {
  const params = {
    tenantId: 'mock-tenant_id',
    serviceId: 'mock-service_id'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgeMdnsProxyUrls.getEdgeMdnsProxy.url,
        (_req, res, ctx) => {
          return res(ctx.json(mockEdgeMdnsSetting))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyDetails />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const rulesNumStr = await screen.findByText('3')
    await userEvent.hover(rulesNumStr)
    const tooltip = await screen.findByRole('tooltip', { hidden: true })
    within(tooltip).getByRole('row', { name: 'AirPrint 33 66' })
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/t/` + getServiceDetailsLink({
      type: ServiceType.EDGE_MDNS_PROXY,
      oper: ServiceOperation.EDIT,
      serviceId: params.serviceId
    })

    render(
      <Provider>
        <EdgeMdnsProxyDetails />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    await screen.findByText('3')
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
