import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { PortsTab } from './PortsTab'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true),
  EdgePortsTable: (props: {
    isConfigurable: boolean
    portData: EdgePortStatus[]
  }) => <div data-testid='EdgePortsTable'>
    {JSON.stringify(props.portData)}
  </div>
}))

// Define mocked router params and create a renderWithProvider helper
const params = {
  clusterId: 'test-cluster-id'
}
const mockLagData = [{ lagId: 'lag1', name: 'LAG 1' }]

const renderWithProviders = (ui, options = {}) => {
  const { clusterInfo = { edgeList: [] }, ...renderOptions } = options

  return render(
    <Provider>
      <EdgeClusterDetailsDataContext.Provider value={{ clusterInfo }}>
        {ui}
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>,
    { route: { params }, ...renderOptions }
  )
}

describe('PortsTab', () => {
  it('renders PortsTab with correct data', async () => {
    const mockPortData = [{ portId: 'port1', name: 'Port 1' }]
    const mockHandleClickLagName = jest.fn()

    renderWithProviders(
      <PortsTab
        isConfigurable={true}
        portData={mockPortData}
        lagData={mockLagData}
        isLoading={false}
        handleClickLagName={mockHandleClickLagName}
      />
    )

    const portsTable = screen.getByTestId('EdgePortsTable')
    expect(portsTable).toBeInTheDocument()
    expect(portsTable.textContent).toBe(JSON.stringify(mockPortData))
  })

  it('displays loading state when isLoading is true', () => {
    renderWithProviders(
      <PortsTab
        isConfigurable={false}
        portData={[]}
        lagData={[]}
        isLoading={true}
        handleClickLagName={() => {}}
      />
    )

    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('navigates to Ports configuration page', async () => {
    renderWithProviders(
      <PortsTab
        isConfigurable={true}
        portData={[]}
        lagData={mockLagData}
        isLoading={false}
      />
    )
    const configButton = screen.getByRole('button', { name: 'Configure Port Settings' })
    await userEvent.click(configButton)

    // eslint-disable-next-line max-len
    expect(mockedUsedNavigate).toHaveBeenCalledWith(expect.objectContaining({ pathname: expect.stringContaining('/test-cluster-id/configure') }))
  })
})
