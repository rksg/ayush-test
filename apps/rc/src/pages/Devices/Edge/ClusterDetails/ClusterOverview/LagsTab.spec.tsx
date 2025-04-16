import userEvent from '@testing-library/user-event'

import { ColumnType }                     from '@acx-ui/components'
import { Features }                       from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }          from '@acx-ui/rc/components'
import { EdgeLagFixtures, EdgeLagStatus } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { render, screen }                 from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { LagsTab } from './LagsTab'

const { mockEdgeLagStatusList } = EdgeLagFixtures

// Mock the components used by LagsTab
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/edge/components', () => ({
  EdgeOverviewLagTable: ({ filterables }: {
    filterables?: { [key: string]: ColumnType['filterable'] }
  }) => <div data-testid='rc-EdgeOverviewLagTable'>{JSON.stringify(filterables)}</div>
}))
jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const params = {
  clusterId: 'test-cluster-id'
}
const renderWithProviders = (ui, options = {}) => {
  const { clusterInfo = { edgeList: [] }, ...renderOptions } = options

  return render(<Provider>
    <EdgeClusterDetailsDataContext.Provider value={{ clusterInfo }}>
      {ui}
    </EdgeClusterDetailsDataContext.Provider>
  </Provider>,
  { route: { params }, ...renderOptions }
  )
}

describe('LagsTab', () => {
  const mockClusterInfo = {
    edgeList: [{ serialNumber: 'edge1', name: 'Edge 1' }]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // jest.spyOn(userPermissions, 'hasPermission').mockReturnValue(true)
  })

  // eslint-disable-next-line max-len
  it('renders the Configure LAG Settings button when permissions and isConfigurable are true', () => {
    const mockData = [] as EdgeLagStatus[]

    renderWithProviders(<LagsTab isConfigurable={true} data={mockData} isLoading={false} />)

    expect(screen.getByText('Configure LAG Settings')).toBeInTheDocument()
  })

  it('does not render the Configure LAG Settings button when isConfigurable is false', () => {
    const mockData = [] as EdgeLagStatus[]

    renderWithProviders(<LagsTab isConfigurable={false} data={mockData} isLoading={false} />)

    expect(screen.queryByText('Configure LAG Settings')).not.toBeInTheDocument()
  })

  it('renders EdgeOverviewLagTable with correct props', () => {
    const mockData = [{ lagId: 'lag1' }]

    renderWithProviders(
      <LagsTab isConfigurable={true} data={mockData} isLoading={false} />,
      { clusterInfo: mockClusterInfo }
    )

    expect(screen.getByTestId('rc-EdgeOverviewLagTable')).toBeInTheDocument()
  })

  it('navigates to LAG configuration page', async () => {
    const mockData = mockEdgeLagStatusList.data

    renderWithProviders(
      <LagsTab isConfigurable={true} data={mockData} isLoading={false} />,
      { clusterInfo: mockClusterInfo }
    )

    const configButton = screen.getByRole('button', { name: 'Configure LAG Settings' })
    await userEvent.click(configButton)

    // eslint-disable-next-line max-len
    expect(mockedUsedNavigate).toHaveBeenCalledWith(expect.objectContaining({ pathname: expect.stringContaining('/edit/lags') }))
  })

  it('renders EdgeOverviewLagTable with filterables when isEdgeDualWanEnabled is true', () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) => ff === Features.EDGE_DUAL_WAN_TOGGLE)

    const mockData = [{ lagId: 'lag1' }]

    renderWithProviders(
      <LagsTab isConfigurable={true} data={mockData} isLoading={false} />,
      { clusterInfo: mockClusterInfo }
    )

    const lagTable = screen.getByTestId('rc-EdgeOverviewLagTable')
    expect(lagTable).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(lagTable).toHaveTextContent('{"type":true,"status":true,"edgeName":[{"key":"edge1","value":"Edge 1"}]}')
  })
})
