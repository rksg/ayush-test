/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                                                                             from '@acx-ui/rc/services'
import { EdgeClusterTableDataType, EdgeGeneralFixtures, EdgePortConfigFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'


import { VirtualIp } from '.'

const { mockEdgeClusterList, mockEdgeCluster } = EdgeGeneralFixtures
const { mockLanInterfaces } = EdgePortConfigFixtures

const mockedFinishFn = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetAllInterfacesByTypeQuery: () => ({
    data: mockLanInterfaces,
    isLoading: false
  })
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edit Edge Cluster - VirtualIp', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'virtual-ip'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.patchEdgeCluster.url,
        (req, res, ctx) => {
          mockedFinishFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render VirtualIp successfully', async () => {
    render(
      <Provider>
        <VirtualIp />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    expect(screen.getByText('Please select the node interfaces and assign virtual IPs for seamless failover :')).toBeVisible()
    expect(await screen.findByRole('textbox', { name: 'Virtual IP Address' })).toBeVisible()
    // expect(await screen.findByRole('button', { name: 'Add another virtual IP' })).toBeVisible()
    expect(screen.getByText('HA Timeout')).toBeVisible()
  })

  // it('should add new VipInfoCard when clicking "Add another virtual IP"', async () => {
  //   render(
  //     <Provider>
  //       <VirtualIp />
  //     </Provider>
  //     , {
  //       route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
  //     })
  //   await userEvent.click(await screen.findByRole('button', { name: 'Add another virtual IP' }))
  //   await waitFor(
  //     async () =>
  //       expect((await screen.findAllByRole('textbox', { name: 'Virtual IP Address' })).length).toBe(2)
  //   )
  //   expect(await screen.findByRole('button', { name: 'delete' })).toBeVisible()
  // })

  it('should render correctly when having existed data', async () => {
    render(
      <Provider>
        <VirtualIp
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
          currentVipConfig={mockEdgeCluster.virtualIpSettings}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    const vips = await screen.findAllByRole('textbox', { name: 'Virtual IP Address' })
    expect(vips[0]).toHaveValue('192.168.13.1')
    expect(vips[1]).toHaveValue('192.168.14.1')
  })

  it('should apply successfully', async () => {
    render(
      <Provider>
        <VirtualIp
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
          currentVipConfig={mockEdgeCluster.virtualIpSettings}
        />
      </Provider>
      , {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedFinishFn).toBeCalledWith({
      virtualIpSettings: mockEdgeCluster.virtualIpSettings
    })
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <VirtualIp
          currentClusterStatus={mockEdgeClusterList.data[0] as unknown as EdgeClusterTableDataType}
          currentVipConfig={mockEdgeCluster.virtualIpSettings}
        />
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