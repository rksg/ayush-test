/* eslint-disable max-len */

import { useGetTunnelProfileViewDataListQuery } from '@acx-ui/rc/services'
import { IpsecViewData, TunnelProfileViewData } from '@acx-ui/rc/utils'
import { Provider }                             from '@acx-ui/store'
import { render, screen }                       from '@acx-ui/test-utils'

import IpsecTunnelDetail from './IpsecTunnelDetail'

// Mock the services
jest.mock('@acx-ui/rc/services', () => ({
  useGetTunnelProfileViewDataListQuery: jest.fn()
}))

const mockUseGetTunnelProfileViewDataListQuery = useGetTunnelProfileViewDataListQuery as jest.Mock

// Test data
const mockIpsecData = {
  id: 'ipsec-profile-123',
  name: 'Test IPsec Profile',
  serverAddress: '192.168.1.1',
  authenticationType: 'PSK',
  preSharedKey: 'test-key',
  certificate: '',
  certNames: [],
  ikeProposalType: 'STANDARD',
  ikeProposals: [],
  espProposalType: 'STANDARD',
  espProposals: [],
  activations: []
} as unknown as IpsecViewData

const mockTunnelProfiles = [
  {
    id: 'tunnel-1',
    name: 'Tunnel Profile 1',
    tags: ['tag1'],
    mtuType: 'AUTO',
    mtuSize: 1500,
    forceFragmentation: false,
    ageTimeMinutes: 30,
    personalIdentityNetworkIds: [],
    networkIds: ['network-1'],
    sdLanIds: ['sdlan-1', 'sdlan-2'],
    type: 'VLAN',
    mtuRequestRetry: 3,
    mtuRequestTimeout: 5,
    keepAliveRetry: 3,
    keepAliveInterval: 1000,
    natTraversalEnabled: true,
    tunnelType: 'IPSEC',
    destinationIpAddress: '10.0.0.1',
    destinationEdgeClusterId: 'cluster-1',
    destinationEdgeClusterName: 'Cluster One'
  },
  {
    id: 'tunnel-2',
    name: 'Tunnel Profile 2',
    tags: [],
    mtuType: 'MANUAL',
    mtuSize: 1400,
    forceFragmentation: true,
    ageTimeMinutes: 45,
    personalIdentityNetworkIds: ['pin-1'],
    networkIds: [],
    sdLanIds: [],
    type: 'VXLAN',
    mtuRequestRetry: 5,
    mtuRequestTimeout: 10,
    keepAliveRetry: 5,
    keepAliveInterval: 2000,
    natTraversalEnabled: false,
    tunnelType: 'GRE',
    destinationIpAddress: '10.0.0.2',
    destinationEdgeClusterId: 'cluster-2',
    destinationEdgeClusterName: 'Cluster Two'
  }
] as unknown as TunnelProfileViewData[]

const path = '/:tenantId/policies/ipsec/:policyId/detail'
const params = { tenantId: 'tenant-1', policyId: 'ipsec-profile-123' }

const renderWithRouter = (data: IpsecViewData) => {
  return render(<Provider>
    <IpsecTunnelDetail data={data} />
  </Provider>, { route: { path, params } })
}

describe('IpsecTunnelDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock the RTK Query hook
    mockUseGetTunnelProfileViewDataListQuery.mockReturnValue({
      data: { data: mockTunnelProfiles, totalCount: 2 },
      isLoading: false,
      isFetching: false,
      error: null
    })
  })

  describe('Component Rendering', () => {
    it('should render the component with tunnel profiles data', async () => {
      renderWithRouter(mockIpsecData)

      // Check if the card title is rendered with correct count
      expect(await screen.findByText('Instances (2)')).toBeInTheDocument()

      // Check if table columns are rendered
      expect(screen.getByText('Tunnel Name')).toBeInTheDocument()
      expect(screen.getByText('Tunnel Type')).toBeInTheDocument()
      expect(screen.getByText('Destination Cluster')).toBeInTheDocument()
      expect(screen.getByText('SD-LAN')).toBeInTheDocument()
    })

    it('should render tunnel profile data in table rows', async () => {
      renderWithRouter(mockIpsecData)

      // Check if tunnel profile names are rendered as links
      const row1 = await screen.findByRole('row', { name: /Tunnel Profile 1/ })
      const row2 = await screen.findByRole('row', { name: /Tunnel Profile 2/ })
      expect(row1).toBeInTheDocument()
      expect(row2).toBeInTheDocument()

      // Check if tunnel types are rendered
      expect(screen.getByText('IPSEC')).toBeInTheDocument()
      expect(screen.getByText('GRE')).toBeInTheDocument()

      // Check if destination clusters are rendered
      expect(screen.getByText('Cluster One')).toBeInTheDocument()
      expect(screen.getByText('Cluster Two')).toBeInTheDocument()

      // Check if SD-LAN counts are displayed
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render TenantLink with correct URL for tunnel profile names', async () => {
      renderWithRouter(mockIpsecData)

      const links = await screen.findAllByRole('link')
      expect(links).toHaveLength(2)
      expect(links[0]).toHaveAttribute('href', '/tenant-1/t/policies/tunnelProfile/tunnel-1/detail')
      expect(links[0]).toHaveTextContent('Tunnel Profile 1')
      expect(links[1]).toHaveAttribute('href', '/tenant-1/t/policies/tunnelProfile/tunnel-2/detail')
      expect(links[1]).toHaveTextContent('Tunnel Profile 2')
    })
  })
  describe('Column Render Functions', () => {

    it('should render tunnel type column correctly', async () => {
      renderWithRouter(mockIpsecData)

      expect(await screen.findByText('IPSEC')).toBeInTheDocument()
      expect(screen.getByText('GRE')).toBeInTheDocument()
    })

    it('should render destination cluster column correctly', async () => {
      renderWithRouter(mockIpsecData)

      expect(await screen.findByText('Cluster One')).toBeInTheDocument()
      expect(screen.getByText('Cluster Two')).toBeInTheDocument()
    })

    it('should handle undefined sdLanIds gracefully', async () => {
      const modifiedProfiles = [
        {
          ...mockTunnelProfiles[0],
          sdLanIds: undefined
        }
      ]

      // Mock the RTK Query hook
      mockUseGetTunnelProfileViewDataListQuery.mockReturnValue({
        data: { data: modifiedProfiles, totalCount: 1 },
        isLoading: false,
        isFetching: false,
        error: null
      })

      renderWithRouter(mockIpsecData)

      const row = await screen.findByRole('row', { name: /Tunnel Profile 1/ })
      expect(row).toHaveTextContent('0')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty tunnel profiles array', async () => {
      mockUseGetTunnelProfileViewDataListQuery.mockReturnValue({
        data: { data: [], totalCount: 0 },
        isLoading: false,
        isFetching: false,
        error: null
      })

      renderWithRouter(mockIpsecData)

      expect(await screen.findByText('Instances (0)')).toBeInTheDocument()
      expect(screen.getByText('Tunnel Name')).toBeInTheDocument()
    })
  })
})
