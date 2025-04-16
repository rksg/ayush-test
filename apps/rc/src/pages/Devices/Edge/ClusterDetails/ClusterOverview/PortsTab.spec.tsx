import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { PortsTab } from './PortsTab'

// Mock the components used
// jest.mock('@acx-ui/edge/components', () => ({
//   EdgeOverviewPortsTable: ({ data, lagData, handleClickLagName }) => (
//     <div data-testid='ports-table'>
//       {data && data.map(port => <div key={port.portId}>{port.name}</div>)}
//       {lagData && lagData.map(lag => (
//         <div
//           key={lag.lagId}
//           onClick={() => handleClickLagName && handleClickLagName()}
//         >
//           {lag.name}
//         </div>
//       ))}
//     </div>
//   )
// }))

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true),
  EdgePortsTable: () => <div data-testid='ports-table'></div>
}))

// Define mocked router params and create a renderWithProvider helper
const params = {
  clusterId: 'test-cluster-id'
}

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
  it('renders PortsTab with correct data', () => {
    const mockPortData = [{ portId: 'port1', name: 'Port 1' }]
    const mockLagData = [{ lagId: 'lag1', name: 'LAG 1' }]
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

    expect(screen.getByText('Port 1')).toBeInTheDocument()
    expect(screen.getByText('LAG 1')).toBeInTheDocument()
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

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('calls handleClickLagName when a LAG name is clicked', async () => {
    const mockLagData = [{ lagId: 'lag1', name: 'LAG 1' }]
    const mockHandleClickLagName = jest.fn()

    renderWithProviders(
      <PortsTab
        isConfigurable={true}
        portData={[]}
        lagData={mockLagData}
        isLoading={false}
        handleClickLagName={mockHandleClickLagName}
      />
    )

    await userEvent.click(screen.getByText('LAG 1'))
    expect(mockHandleClickLagName).toHaveBeenCalled()
  })

  it('navigates to LAG configuration page', async () => {
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
    expect(mockedUsedNavigate).toHaveBeenCalledWith(expect.objectContaining({ pathname: expect.stringContaining('/edit/lags') }))
  })
})
