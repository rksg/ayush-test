
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AddEdgeCluster from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  EdgeClusterSettingForm: () => <div data-testid='edge-cluster-setting-form' />
}))
const mockedPostApi = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddEdgeClusterMutation: () => ([() => ({
    unwrap: async () => mockedPostApi()
  })])
}))

describe('Add Edge Cluster', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render AddEdgeCluster successfully', async () => {
    render(
      <Provider>
        <AddEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/add' }
      })
    expect(screen.getByText('Add Cluster')).toBeVisible()
    expect(screen.getByTestId('edge-cluster-setting-form')).toBeVisible()
  })

  it('should add cluster successfully', async () => {
    render(
      <Provider>
        <AddEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/add' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedPostApi).toBeCalled()
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t/devices/edge',
      search: ''
    })
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <AddEdgeCluster />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/add' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t/devices/edge',
      search: ''
    })
  })
})