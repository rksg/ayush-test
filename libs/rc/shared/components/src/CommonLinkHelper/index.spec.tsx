import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import {
  DpskDetailsTabKey,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  MacRegistrationDetailsTabKey,
  PersonaUrls,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  ConnectionMeteringLink,
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  IdentityDetailsLink,
  IdentityGroupLink,
  PropertyUnitLink,
  VenueLink,
  CertTemplateLink,
  ResidentPortalLink
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
      <Provider>
        <IdentityGroupLink
          personaGroupId={'group-id'}
          name={'group-name'}
        />
      </Provider>,
      { route: { params } }
    )

    const link = await screen.findByRole('link', { name: 'group-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/users/identity-management/identity-group/group-id`
    )
  })

  it('should render IdentityGroupLink enableFetchName correctly', async () => {
    const mockedApiFn = jest.fn()
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => {
          mockedApiFn()
          return res(ctx.json({ name: 'group-name' }))
        }
      )
    )
    render(
      <Provider>
        <IdentityGroupLink
          personaGroupId={'group-id'}
          enableFetchName
        />
      </Provider>,
      { route: { params } }
    )

    await waitFor(() => expect(mockedApiFn).toBeCalledTimes(1))
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
        id={'nsg-id'}
        name={'nsg-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getServiceDetailsLink({
      serviceId: 'nsg-id',
      oper: ServiceOperation.DETAIL,
      type: ServiceType.PIN
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

  it('should render ResidentPortalLink correctly', async () => {
    render(
      <ResidentPortalLink
        id={'resident-portal-id'}
        name={'resident-portal-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getServiceDetailsLink({
      type: ServiceType.RESIDENT_PORTAL,
      oper: ServiceOperation.DETAIL,
      serviceId: 'resident-portal-id'
    })

    const link = await screen.findByRole('link', { name: 'resident-portal-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/${expectedHref}`
    )
  })

  it('should render CertTemplateLink correctly', async () => {
    render(
      <CertTemplateLink
        id={'cert-template-id'}
        name={'cert-template-name'}
      />,
      { route: { params } }
    )
    const expectedHref = getPolicyDetailsLink({
      type: PolicyType.CERTIFICATE_TEMPLATE,
      oper: PolicyOperation.DETAIL,
      policyId: 'cert-template-id'
    })

    const link = await screen.findByRole('link', { name: 'cert-template-name' })
    expect(link).toBeVisible()
    expect(link).toHaveAttribute(
      'href',
      `${tenantPrefix}/${expectedHref}`
    )
  })
})
