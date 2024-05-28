import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                                               from '@acx-ui/rc/services'
import { EdgeUrlsInfo, EdgePortConfigFixtures, EdgeLagFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { EditContext } from '../EdgeEditContext'

import { EdgePortsForm, EdgePortTabEnum } from '.'

const { mockEdgePortConfig, mockEdgePortStatus } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl,
    useTenantId: () => 'mocked_tenant_id'
  }
})

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


jest.mock('./PortsGeneral', () => ({
  ...jest.requireActual('./PortsGeneral'),
  default: () => <div data-testid='rc-edge-PortsGeneral'></div>
}))
jest.mock('./SubInterface', () => ({
  ...jest.requireActual('./SubInterface'),
  default: () => <div data-testid='rc-edge-subInterface'></div>
}))

const defaultContextData = {
  activeSubTab: {
    key: EdgePortTabEnum.PORTS_GENERAL,
    title: 'Ports General'
  },
  formControl: {
    isDirty: false,
    hasError: false,
    applyFn: jest.fn()
  },
  setActiveSubTab: jest.fn(),
  setFormControl: jest.fn()
}

describe('EditEdge ports', () => {
  const mockedEdgeID = 'mocked_edge_id'
  const mockedEdgeClusterID = 'mocked_cluster_id'

  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfigDeprecated.url,
        (_req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeLagStatusList))
      )
    )
  })

  it('should active ports general successfully', async () => {
    render(
      <Provider>
        <EditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsForm
            clusterId={mockedEdgeClusterID}
            serialNumber={mockedEdgeID}
            onTabChange={jest.fn()}
            onCancel={jest.fn()}
          />
        </EditContext.Provider>
      </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('tab', {
      name: 'Ports General', selected: true
    })
  })

  it('should active sub-interface successfully', async () => {
    render(
      <Provider>
        <EditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsForm
            clusterId={mockedEdgeClusterID}
            serialNumber={mockedEdgeID}
            onTabChange={jest.fn()}
            onCancel={jest.fn()}
            activeSubTab={EdgePortTabEnum.SUB_INTERFACE}
          />
        </EditContext.Provider>
      </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('tab', {
      name: 'Sub-Interface', selected: true
    })
    expect(await screen.findByTestId('rc-edge-subInterface')).toBeVisible()
  })

  it('switch tab', async () => {
    const handleTabChange = jest.fn()
    render(
      <Provider>
        <EditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsForm
            clusterId={mockedEdgeClusterID}
            serialNumber={mockedEdgeID}
            onTabChange={handleTabChange}
            onCancel={jest.fn()}
          />
        </EditContext.Provider>
      </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('tab', {
      name: 'Ports General', selected: true
    })
    await userEvent.click(screen.getByRole('tab', { name: 'Sub-Interface' }))
    expect(handleTabChange).toHaveBeenCalledWith(EdgePortTabEnum.SUB_INTERFACE)
  })
})