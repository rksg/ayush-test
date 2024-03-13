import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeEditContext, EdgePortTabEnum }                                           from '@acx-ui/rc/components'
import { edgeApi }                                                                    from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                            from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved }                      from '@acx-ui/test-utils'

import Ports from './index'

const { mockEdgeData, mockEdgeList } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const { mockEdgePortConfig, mockEdgePortStatus } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures
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
describe('EditEdge - Ports', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab:string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030',
      activeTab: 'ports',
      activeSubTab: EdgePortTabEnum.PORTS_GENERAL
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (req, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeLagStatusList))
      )
    )
  })

  it('should navigate to edge list when cancel', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <Ports />
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // TODO: check status ip
    expect(await screen.findByText(/IP Address: /)).toBeVisible()

    expect(await screen.findByRole('tab', { name: 'Ports General', selected: true })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })

  it('switch tab', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <Ports />
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // TODO: check status ip
    expect(await screen.findByText(/IP Address: /)).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: 'Sub-Interface' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/edit/ports/sub-interface`,
      hash: '',
      search: ''
    })
  })
})