import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import StaticRoutes from '.'

const { mockStaticRoutes, mockEdgeClusterList } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeStaticRouteTable: () => <div data-testid='EdgeStaticRouteTable' />
}))
const updateRequestSpy = jest.fn()

describe('EditEdge static routes', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updateStaticRoutes.url,
        (req, res, ctx) => {
          updateRequestSpy()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render StaticRoutes successfully', async () => {
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            staticRouteData: mockStaticRoutes,
            isStaticRouteDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <StaticRoutes />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    expect(screen.getByTestId('EdgeStaticRouteTable')).toBeVisible()
  })

  it('apply static routes setting', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            staticRouteData: mockStaticRoutes,
            isStaticRouteDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <StaticRoutes />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Apply Static Routes' }))
    await waitFor(() => expect(updateRequestSpy).toHaveBeenCalledTimes(1))
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            staticRouteData: mockStaticRoutes,
            isStaticRouteDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <StaticRoutes />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })
})

describe('EditEdge static routes api fail', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getStaticRoutes.url,
        (req, res, ctx) => res(ctx.json(mockStaticRoutes))
      ),
      rest.patch(
        EdgeUrlsInfo.updateStaticRoutes.url,
        (req, res, ctx) => res(ctx.status(500))
      )
    )
  })

  it('apply api fail handle', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            clusterInfo: mockEdgeClusterList.data[1],
            staticRouteData: mockStaticRoutes,
            isStaticRouteDataFetching: false
          } as unknown as EditEdgeDataContextType}
        >
          <StaticRoutes />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/routes' }
      })
    await user.click(await screen.findByRole('button', { name: 'Apply Static Routes' }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })
})