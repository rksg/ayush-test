import {
  ConfigTemplateType,
  getConfigTemplatePath,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyDetailsLinkProps,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import {render, screen} from '@acx-ui/test-utils'

import {
  ConfigTemplateLink,
  PolicyConfigTemplateDetailsLink,
  PolicyConfigTemplateLink,
  renderConfigTemplateDetailsLink
} from '.'

const mockedMspTenantLinkStateFn = jest.fn()
const mockedLocation = { pathname: 'previous/path' }
const mockedLocationFn = jest.fn().mockReturnValue(mockedLocation)
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MspTenantLink: (props: { to: string, state: any }) => {
    mockedMspTenantLinkStateFn(props.state)
    return <div>{props.to}</div>
  },
  useLocation: () => mockedLocationFn()
}))

describe('ConfigTemplateLink', () => {
  afterEach(() => {
    mockedMspTenantLinkStateFn.mockClear()
  })

  it('renders ConfigTemplateLink with state prop', () => {
    render(<ConfigTemplateLink to='test/config'>Config Template Link</ConfigTemplateLink>)

    const targetPath = getConfigTemplatePath('test/config')
    expect(screen.getByText(targetPath)).toBeInTheDocument()
    expect(mockedMspTenantLinkStateFn).toHaveBeenCalledWith({ from: mockedLocation })
  })

  it('renders children with PolicyConfigTemplateLink', () => {
    const targetPolicyParams = { type: PolicyType.AAA, oper: PolicyOperation.CREATE }
    render(
      <PolicyConfigTemplateLink {...targetPolicyParams}>Policy Test Child</PolicyConfigTemplateLink>
    )

    const targetPath = getConfigTemplatePath(getPolicyRoutePath(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('renders children with PolicyConfigTemplateDetailsLink', () => {
    const targetPolicyParams: PolicyDetailsLinkProps = {
      type: PolicyType.AAA,
      oper: PolicyOperation.DETAIL,
      policyId: 'AAA12345'
    }

    render(
      // eslint-disable-next-line max-len
      <PolicyConfigTemplateDetailsLink {...targetPolicyParams}>Policy Details Child</PolicyConfigTemplateDetailsLink>
    )

    const targetPath = getConfigTemplatePath(getPolicyDetailsLink(targetPolicyParams))
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('renderConfigTemplateDetailsLink for venue with default activeTab', () => {
    render(
      renderConfigTemplateDetailsLink(ConfigTemplateType.VENUE, 'venue_id', 'venue_name')
    )

    // default activeTab : networks
    const targetPath = getConfigTemplatePath('venues/venue_id/venue-details/networks')
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })

  it('renderConfigTemplateDetailsLink for venue with services activeTab', () => {
    render(
      renderConfigTemplateDetailsLink(ConfigTemplateType.VENUE, 'venue_id', 'venue_name', {
        [ConfigTemplateType.VENUE]: { "activeTab": 'services' }
      })
    )

    const targetPath = getConfigTemplatePath('venues/venue_id/venue-details/services')
    expect(screen.getByText(targetPath)).toBeInTheDocument()
  })
})
