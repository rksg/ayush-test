import { screen } from '@testing-library/react'

import {
  DpskDetailsTabKey,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  MacRegistrationDetailsTabKey,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { render } from '@acx-ui/test-utils'

import {
  ConnectionMeteringLink,
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  IdentityDetailsLink,
  IdentityGroupLink, PropertyUnitLink,
  VenueLink
} from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Common Link Helper', () => {
  const params = { tenantId: 'tenant-id' }
  const tenantPrefix = `/${params.tenantId}/t`

  it('should render VenueLink correctly', async () => {
    render(
      <VenueLink
        venueId={'venue-id'}
        name={'venue-name'}
      />,
      { route: { params } }
    )

    const link = await screen.findByRole('link', { name: 'venue-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/venues/venue-id/venue-details/overview`
    )
  })

  it('should render IdentityGroupLink correctly', async () => {
    render(
      <IdentityGroupLink
        personaGroupId={'group-id'}
        name={'group-name'}
      />,
      { route: { params } }
    )

    const link = await screen.findByRole('link', { name: 'group-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/users/identity-management/identity-group/group-id`
    )
  })

  it('should render PersonaDetailLink correctly', async () => {
    render(
      <IdentityDetailsLink
        personaGroupId={'group-id'}
        personaId={'persona-id'}
        name={'persona-name'}
      />,
      { route: { params } }
    )

    const link = await screen.findByRole('link', { name: 'persona-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/users/identity-management/identity-group/group-id/identity/persona-id`
    )
  })

  it('should render DpskPoolLink correctly', async () => {
    render(
      <DpskPoolLink
        dpskPoolId={'dpsk-id'}
        name={'dpsk-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getServiceDetailsLink({
      serviceId: 'dpsk-id',
      oper: ServiceOperation.DETAIL,
      type: ServiceType.DPSK,
      activeTab: DpskDetailsTabKey.OVERVIEW
    })

    const link = await screen.findByRole('link', { name: 'dpsk-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/${expectedHref}`
    )
  })

  it('should render MacRegistrationPoolLink correctly', async () => {
    render(
      <MacRegistrationPoolLink
        macRegistrationPoolId={'mac-pool-id'}
        name={'mac-pool-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getPolicyDetailsLink({
      policyId: 'mac-pool-id',
      oper: PolicyOperation.DETAIL,
      type: PolicyType.MAC_REGISTRATION_LIST,
      activeTab: MacRegistrationDetailsTabKey.OVERVIEW
    })

    const link = await screen.findByRole('link', { name: 'mac-pool-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/${expectedHref}`
    )
  })

  it('should render NetworkSegmentationLink correctly', async () => {
    render(
      <NetworkSegmentationLink
        nsgId={'nsg-id'}
        name={'nsg-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getServiceDetailsLink({
      serviceId: 'nsg-id',
      oper: ServiceOperation.DETAIL,
      type: ServiceType.NETWORK_SEGMENTATION
    })

    const link = await screen.findByRole('link', { name: 'nsg-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/${expectedHref}`
    )
  })

  it('should render PropertyUnitLink correctly', async () => {
    render(
      <PropertyUnitLink
        venueId={'venue-id'}
        unitId={'unit-id'}
        name={'unit-name'}
      />,
      { route: { params } }
    )

    const link = await screen.findByRole('link', { name: 'unit-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/venues/venue-id/venue-details/units`
    )
  })

  it('should render ConnectionMeteringLink correctly', async () => {
    render(
      <ConnectionMeteringLink
        id={'connection-metering-id'}
        name={'connection-metering-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getPolicyDetailsLink({
      type: PolicyType.CONNECTION_METERING,
      oper: PolicyOperation.DETAIL,
      policyId: 'connection-metering-id'
    })

    const link = await screen.findByRole('link', { name: 'connection-metering-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/${expectedHref}`
    )
  })
})
