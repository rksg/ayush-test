import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import MdnsProxyConsolidation from '.'

jest.mock('../MdnsProxy/MdnsProxyTable/MdnsProxyTable', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked MdnsProxyTable</div>
  }
})

jest.mock('../MdnsProxy/Edge/EdgeMdnsProxyTable', () => ({
  ...jest.requireActual('../MdnsProxy/Edge/EdgeMdnsProxyTable'),
  EdgeMdnsProxyTable: () => <div>Mocked EdgeMdnsProxyTable</div>
}))

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))

describe('MdnsProxyConsolidation', () => {
  const path = '/:tenantId/services/mdnsProxyConsolidation/list/:activeTab'
  const params = { tenantId: 'TENANT_ID' }

  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it('renders with correct title and content', () => {
    render(<MdnsProxyConsolidation />, {
      route: { params: { ...params, activeTab: 'wifi' }, path }
    })
    expect(screen.getByText('mDNS Proxy')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Wi-Fi/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /RUCKUS Edge/ })).toBeInTheDocument()
    expect(screen.getByText('Mocked MdnsProxyTable')).toBeInTheDocument()

    const addButton = screen.getByRole('link', { name: /Add mDNS Proxy for Wi-Fi/ })
    expect(addButton).toBeInTheDocument()
    expect(addButton.getAttribute('href')).toBe('/TENANT_ID/t/services/mdnsProxy/create')
  })

  it('getAddButton returns correct button text and link based on activeTab parameter', () => {
    render(<MdnsProxyConsolidation />, {
      route: { params: { ...params, activeTab: 'edge' }, path }
    })

    expect(screen.getByText('Mocked EdgeMdnsProxyTable')).toBeInTheDocument()
    const addButton = screen.getByRole('link', { name: /Add mDNS Proxy for Edge/ })
    expect(addButton).toBeInTheDocument()
    expect(addButton.getAttribute('href')).toBe('/TENANT_ID/t/services/edgeMdnsProxy/create')
  })

  it('switches tabs correctly', async () => {
    render(<MdnsProxyConsolidation />, {
      route: { params: { ...params, activeTab: 'wifi' }, path }
    })

    const tabButton = screen.getByRole('tab', { name: /RUCKUS Edge/ })
    await userEvent.click(tabButton)
    expect(mockedNavigate).toHaveBeenCalledWith({
      pathname: '/TENANT_ID/t/services/mdnsProxyConsolidation/list/edge',
      hash: '',
      search: ''
    }, { replace: true })
  })
})
