import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                           from '@acx-ui/feature-toggle'
import { edgeApi }                                                                                from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }                                                                       from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import { EdgeOverview } from '.'

const { mockEdgeData: currentEdge, mockEdgeList } = EdgeGeneralFixtures
const { mockEdgePortStatus } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgeCluster } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeInfoWidget: (props: { onClickWidget?: (type: string) => void }) =>
    <div data-testid='rc-EdgeInfoWidget'>
      <div data-testid='rc-EdgeOtherWidget'
        onClick={() => {
          props.onClickWidget && props.onClickWidget('other')
        }}>
        Edge Alarm Widget
      </div>
      <div data-testid='rc-EdgePortWidget'
        onClick={() => {
          props.onClickWidget && props.onClickWidget('port')
        }}>
        Edge Ports Widget
      </div>
    </div>,
  EdgePortsByTrafficWidget: () => <div data-testid='rc-EdgePortsByTrafficWidget'></div>,
  EdgeResourceUtilizationWidget: () => <div data-testid='rc-EdgeResourceUtilizationWidget'></div>,
  EdgeTrafficByVolumeWidget: () => <div data-testid='rc-EdgeTrafficByVolumeWidget'></div>,
  EdgeUpTimeWidget: () => <div data-testid='rc-EdgeUpTimeWidget'></div>
}))

describe('Edge Detail Overview', () => {
  const path = '/:tenantId/devices/edge/:serialNumber/details/overview/:activeSubTab'
  let params: { tenantId: string, serialNumber: string, activeSubTab: string } =
  { tenantId: 'tenant-id', serialNumber: 'edge-serialNumber', activeSubTab: 'monitor' }

  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json({ data: [currentEdge] })
          )
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgePortStatus)
          )
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgeLagStatusList)
          )
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeOverview />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params, path }
      })

    await screen.findByTestId('rc-EdgeInfoWidget')
    await screen.findByTestId('rc-EdgePortsByTrafficWidget')
    await screen.findByTestId('rc-EdgeResourceUtilizationWidget')
    await screen.findByTestId('rc-EdgeTrafficByVolumeWidget')
    await screen.findByTestId('rc-EdgeUpTimeWidget')
  })

  it('should correctly change tab', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeOverview />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params, path }
      })

    expect(await screen.findByTestId('rc-EdgeInfoWidget')).toBeVisible()
    // expect default active tab - monitor
    expect(await screen.findByTestId('rc-EdgePortsByTrafficWidget')).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Monitor' }))
      .toHaveAttribute('aria-selected', 'true')

    const portTab = await screen.findByRole('tab', { name: 'Ports' })
    await userEvent.click(portTab)
    const configBtn = await screen.findByRole('button', { name: 'Configure Port Settings' })
    expect(configBtn).toBeVisible()
    const portsRow = await screen.findAllByRole('row')
    expect(portsRow.length).toBe(2)
    await userEvent.click(configBtn)
    expect(mockedUsedNavigate)
      .toBeCalledWith({
        pathname: '/tenant-id/t/devices/edge/edge-serialNumber/edit/ports',
        hash: '',
        search: ''
      })
  })

  it('should correctly display active tab by router', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeOverview />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params: { ...params, activeSubTab: 'ports' }, path }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(await screen.findByRole('button', { name: 'Configure Port Settings' })).toBeVisible()

    // can switch to other tab
    const monitorTab = await screen.findByRole('tab', { name: 'Monitor' })
    await userEvent.click(monitorTab)
    expect(await screen.findByTestId('rc-EdgePortsByTrafficWidget')).toBeVisible()
  })

  it('should correctly change tab when click ports widget', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeOverview />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params, path }
      })

    expect(await screen.findByTestId('rc-EdgeInfoWidget')).toBeVisible()

    // expect default active tab - monitor
    expect(await screen.findByTestId('rc-EdgePortsByTrafficWidget')).toBeVisible()

    // click port widget
    await userEvent.click(await screen.findByTestId('rc-EdgePortWidget'))

    // ports tab should be active
    expect(await screen.findByRole('tab', { name: 'Ports' }))
      .toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByRole('button', { name: 'Configure Port Settings' })).toBeVisible()
    const portsRow = await screen.findAllByRole('row')
    expect(portsRow.length).toBe(2)
  })

  it('should do nothing when click other widget', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeOverview />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params, path }
      })

    expect(await screen.findByTestId('rc-EdgeInfoWidget')).toBeVisible()

    // click other widget
    await userEvent.click(await screen.findByTestId('rc-EdgeOtherWidget'))

    // monitor tab should still be active
    expect(await screen.findByRole('tab', { name: 'Monitor' }))
      .toHaveAttribute('aria-selected', 'true')
  })

  it('should show lags tab correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeOverview />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params, path }
      })

    const lagTab = await screen.findByRole('tab', { name: 'LAGs' })
    await userEvent.click(lagTab)
    const configBtn = await screen.findByRole('button', { name: 'Configure LAG Settings' })
    expect(configBtn).toBeVisible()
    const portsRow = await screen.findAllByRole('row')
    expect(portsRow.length).toBe(3)
    const row = await screen.findByRole('row', { name: /LAG 1 LACP/i })
    const expandBtn = await within(row).findByTestId('PlusSquareOutlined')
    await userEvent.click(expandBtn)
    await userEvent.click(configBtn)
    expect(mockedUsedNavigate)
      .toBeCalledWith({
        pathname: '/tenant-id/t/devices/edge/edge-serialNumber/edit/lags',
        hash: '',
        search: ''
      })
  })
})