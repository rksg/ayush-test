import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { ClusterDetails } from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeClusterSettingForm: () => <div data-testid='edge-cluster-setting-form' />
}))
const mockedFinishFn = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  usePatchEdgeClusterMutation: () => ([() => ({
    unwrap: async () => mockedFinishFn()
  })])
}))


describe('Edit Edge Cluster - ClusterDetails', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'cluster-details'
    }
    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.patchEdgeCluster.url,
        (req, res, ctx) => {
          mockedFinishFn()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render ClusterDetails successfully', async () => {
    render(
      <Provider>
        <ClusterDetails />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(screen.getByTestId('edge-cluster-setting-form')).toBeVisible()
  })

  it('should apply successfully', async () => {
    render(
      <Provider>
        <ClusterDetails />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedFinishFn).toBeCalled()
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <ClusterDetails />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t/devices/edge',
      search: ''
    })
  })
})