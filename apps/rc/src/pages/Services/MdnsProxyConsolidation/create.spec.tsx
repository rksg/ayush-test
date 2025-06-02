import userEvent from '@testing-library/user-event'

import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { render, screen }                                     from '@acx-ui/test-utils'

import CreateMdnsProxyService from './create'

const mockedHasServicePermission = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useServiceListBreadcrumb: () => [],
  redirectPreviousPage: jest.fn(),
  useIsEdgeFeatureReady: jest.fn(() => true),
  hasServicePermission: (props: { type: ServiceType }) => mockedHasServicePermission(props)
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeCompatibilityDrawer: ({ visible }: { visible: boolean }) => {
    if (visible) return <div>EdgeCompatibilityDrawer</div>
    return null
  },
  ApCompatibilityToolTip: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Show Compatibility</button>
  )
}))

const mockedNavigate = jest.fn()
const stateFrom = { pathname: '/previous' }
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ state: { from: stateFrom } }),
  useTenantLink: (path: string) => path
}))

describe('CreateMdnsProxyService', () => {
  const path = '/:tenantId/t/services/mdnsProxyConsolidation/create'
  const params = { tenantId: 'TENANT_ID' }

  beforeEach(() => {
    mockedHasServicePermission.mockReturnValue(true)
    mockedNavigate.mockClear()
  })

  it('renders with default radio option', () => {
    render(<CreateMdnsProxyService />, { route: { params, path } })
    expect(screen.getByText('Add mDNS Proxy Service')).toBeInTheDocument()
    expect(screen.getByLabelText(/Wi-Fi/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/RUCKUS Edge/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
  })

  it('allows changing radio selection and submitting', async () => {
    render(<CreateMdnsProxyService />)
    const edgeRadio = screen.getByLabelText(/RUCKUS Edge/i)
    await userEvent.click(edgeRadio)

    await userEvent.click(screen.getByRole('button', { name: /Next/i }))
    const edgeCreatePath = getServiceRoutePath({
      type: ServiceType.EDGE_MDNS_PROXY,
      oper: ServiceOperation.CREATE
    })
    expect(mockedNavigate).toHaveBeenCalledWith(edgeCreatePath, { state: { from: stateFrom } })
  })

  it('opens EdgeCompatibilityDrawer when clicking show detail', async () => {
    render(<CreateMdnsProxyService />)
    const showDetailButton = screen.getByText('Show Compatibility')
    await userEvent.click(showDetailButton)

    expect(screen.getByText('EdgeCompatibilityDrawer')).toBeInTheDocument()
  })

  it('disables RUCKUS Edge radio when hasEdgeMdnsProxyPermission is false', () => {
    mockedHasServicePermission.mockImplementation((props: { type: ServiceType }) => {
      return props.type === ServiceType.MDNS_PROXY
    })
    render(<CreateMdnsProxyService />)
    const wifiRadio = screen.getByLabelText(/Wi-Fi/i)
    expect(wifiRadio).toBeEnabled()

    const edgeRadio = screen.getByLabelText(/RUCKUS Edge/i)
    expect(edgeRadio).toBeDisabled()
  })
})
