import userEvent from '@testing-library/user-event'

import * as services           from '@acx-ui/rc/services'
import { EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import { render, screen }      from '@acx-ui/test-utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

import { EdgeClusterOverview } from './index'

const { mockClusterInfo } = EdgeGeneralFixtures

// Mock the components used
jest.mock('./EdgeClusterInfoWidget', () => ({
  EdgeClusterInfoWidget: (props: {
    onClickWidget: (type: string) => void
  }) => <div data-testid='cluster-info-widget'>
    EdgeClusterInfoWidget
    <button
      data-testid='rc-EdgeInfoWidget-btn'
      onClick={() => props.onClickWidget('port')}
    />
  </div>
}))

jest.mock('./MonitorTab', () => ({
  MonitorTab: () => <div data-testid='monitor-tab'>MonitorTab</div>
}))

jest.mock('./PortsTab', () => ({
  PortsTab: (props: {
    handleClickLagName: (type: string) => void
  }) => <div data-testid='ports-tab'>
    PortsTab
    <button
      data-testid='rc-ports-tab-lagName-btn'
      onClick={() => props.handleClickLagName()}
    />
  </div>
}))

jest.mock('./LagsTab', () => ({
  LagsTab: () => <div data-testid='lags-tab'>LagsTab</div>
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeGeneralLagsStatusListQuery: jest.fn(),
  useGetEdgeGeneralPortsStatusListQuery: jest.fn()
}))

const params = {
  clusterId: 'test-cluster-id'
}

describe('EdgeClusterOverview', () => {
  beforeEach(() => {
    jest.spyOn(services, 'useGetEdgeGeneralLagsStatusListQuery').mockReturnValue({
      lagStatusList: [],
      isLagListLoading: false
    })
    jest.spyOn(services, 'useGetEdgeGeneralPortsStatusListQuery').mockReturnValue({
      portStatusList: [],
      isPortListLoading: false
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders tabs with correct labels', () => {
    // const mockClusterInfo = {
    //   edgeList: [],
    //   clusterStatus: 'ACTIVE'
    // }

    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params } }
    )

    expect(screen.getByText('Monitor')).toBeInTheDocument()
    expect(screen.getByText('Ports')).toBeInTheDocument()
    expect(screen.getByText('LAGs')).toBeInTheDocument()
  })

  it('renders EdgeClusterInfoWidget with correct props', () => {
    // const mockEmpty = {
    //   edgeList: [],
    //   clusterStatus: 'ACTIVE'
    // }

    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params } }
    )

    expect(screen.getByTestId('cluster-info-widget')).toBeInTheDocument()
  })

  it('should correctly change tab when click ports widget', async () => {

    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params } })

    // expect default active tab - monitor
    expect(await screen.findByText('MonitorTab')).toBeVisible()

    // click port widget
    await userEvent.click(await screen.findByTestId('rc-EdgeInfoWidget-btn'))

    // ports tab should be active
    expect(await screen.findByRole('tab', { name: 'Ports' }))
      .toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByText('PortsTab')).toBeVisible()
  })

  it('should correctly display active tab by router', async () => {

    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params: { ...params, activeSubTab: 'ports' } } })

    expect(await screen.findByText('PortsTab')).toBeVisible()

    // can switch to other tab
    const monitorTab = await screen.findByRole('tab', { name: 'Monitor' })
    await userEvent.click(monitorTab)
    expect(await screen.findByText('MonitorTab')).toBeVisible()
  })

  it('should switch to LAG tab when click LAG name', async () => {
    render(<Provider>
      <EdgeClusterDetailsDataContext.Provider
        value={{ clusterInfo: mockClusterInfo, isClusterLoading: false }}
      >
        <EdgeClusterOverview />
      </EdgeClusterDetailsDataContext.Provider>
    </Provider>, { route: { params } })

    // expect default active tab - monitor
    expect(await screen.findByText('MonitorTab')).toBeVisible()

    // click port tab
    await userEvent.click(screen.getByRole('tab', { name: 'Ports' }))
    // ports tab should be active
    expect(await screen.findByRole('tab', { name: 'Ports' }))
      .toHaveAttribute('aria-selected', 'true')
    await userEvent.click(await screen.findByTestId('rc-ports-tab-lagName-btn'))

    // lag tab should be active
    expect(await screen.findByRole('tab', { name: 'LAGs' }))
      .toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByText('LagsTab')).toBeVisible()
  })
})
