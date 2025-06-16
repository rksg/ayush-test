import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import DHCPConsolidation from '.'

jest.mock('../DHCP/DHCPTable/DHCPTable', () => ({
  __esModule: true,
  default: () => <div>Mocked DHCPTable</div>
}))

jest.mock('../DHCP/Edge/DHCPTable', () => ({
  __esModule: true,
  default: () => <div>Mocked EdgeDHCPTable</div>
}))

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))

describe('DHCPConsolidation', () => {
  const path = '/:tenantId/services/dhcpConsolidation/list/:activeTab'
  const params = { tenantId: 'TENANT_ID' }

  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it('renders with correct title and content', () => {
    render(<DHCPConsolidation />, {
      route: { params: { ...params, activeTab: 'wifi' }, path }
    })
    expect(screen.getByText('DHCP')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Wi-Fi/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /RUCKUS Edge/ })).toBeInTheDocument()
    expect(screen.getByText('Mocked DHCPTable')).toBeInTheDocument()

    const addButton = screen.getByRole('link', { name: /Add DHCP for Wi-Fi/ })
    expect(addButton).toBeInTheDocument()
    expect(addButton.getAttribute('href')).toBe('/TENANT_ID/t/services/dhcp/create')
  })

  it('getAddButton returns correct button text and link based on activeTab parameter', () => {
    render(<DHCPConsolidation />, {
      route: { params: { ...params, activeTab: 'edge' }, path }
    })

    expect(screen.getByText('Mocked EdgeDHCPTable')).toBeInTheDocument()
    const addButton = screen.getByRole('link', { name: /Add DHCP for Edge/ })
    expect(addButton).toBeInTheDocument()
    expect(addButton.getAttribute('href')).toBe('/TENANT_ID/t/services/edgeDhcp/create')
  })

  it('switches tabs correctly', async () => {
    render(<DHCPConsolidation />, {
      route: { params: { ...params, activeTab: 'wifi' }, path }
    })

    const tabButton = screen.getByRole('tab', { name: /RUCKUS Edge/ })
    await userEvent.click(tabButton)
    expect(mockedNavigate).toHaveBeenCalledWith({
      pathname: '/TENANT_ID/t/services/dhcpConsolidation/list/edge',
      hash: '',
      search: ''
    }, { replace: true })
  })
})
