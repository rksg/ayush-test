import {
  ServiceType,
  ServiceTechnology,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ServiceCard, ServiceCardMode } from '.'

describe('ServiceCard', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  it('should render LIST service card', async () => {
    render(
      <ServiceCard
        type={ServiceType.MDNS_PROXY}
        technology={ServiceTechnology.WIFI}
        action={ServiceCardMode.LIST}
      />, {
        route: { params, path }
      }
    )

    const tableLink = `/t/${params.tenantId}/` + getServiceRoutePath({
      type: ServiceType.MDNS_PROXY,
      oper: ServiceOperation.LIST
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'To List' })).toHaveAttribute('href', tableLink)
  })

  it('should render ADD service card', async () => {
    render(
      <ServiceCard
        type={ServiceType.MDNS_PROXY}
        technology={ServiceTechnology.WIFI}
        action={ServiceCardMode.ADD}
      />, {
        route: { params, path }
      }
    )

    const createPageLink = `/t/${params.tenantId}/` + getServiceRoutePath({
      type: ServiceType.MDNS_PROXY,
      oper: ServiceOperation.CREATE
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Add' })).toHaveAttribute('href', createPageLink)
  })

  it('should render service card with the count number', async () => {
    render(
      <ServiceCard
        type={ServiceType.MDNS_PROXY}
        technology={ServiceTechnology.WIFI}
        action={ServiceCardMode.LIST}
        count={5}
      />, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('mDNS Proxy (5)')).toBeVisible()
  })
})
