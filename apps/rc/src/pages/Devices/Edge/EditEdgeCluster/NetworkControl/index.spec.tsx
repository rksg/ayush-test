import userEvent from '@testing-library/user-event'

import {
  EdgeClusterStatus,
  EdgeGeneralFixtures
} from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { EdgeNetworkControl } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
const mockedHandleApplyArpTermination = jest.fn()
const mockedHandleApplyDhcp = jest.fn()
const mockedHandleApplyHqos = jest.fn()
const mockedHandleApplyMdns = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeCompatibilityDrawer: () => <div data-testid='EdgeCompatibilityDrawer' />,
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))
jest.mock('./ArpTermination', () => ({
  ArpTerminationFormItem: () => <div data-testid='ArpTerminationFormItem' />,
  useHandleApplyArpTermination: () => mockedHandleApplyArpTermination
}))
jest.mock('./DHCP', () => ({
  DhcpFormItem: () => <div data-testid='DhcpFormItem' />,
  useHandleApplyDhcp: () => mockedHandleApplyDhcp
}))
jest.mock('./HQoSBandwidth', () => ({
  HQoSBandwidthFormItem: () => <div data-testid='HQoSBandwidthFormItem' />,
  useHandleApplyHqos: () => mockedHandleApplyHqos
}))
jest.mock('./mDNS', () => ({
  MdnsProxyFormItem: () => <div data-testid='MdnsProxyFormItem' />,
  useHandleApplyMdns: () => mockedHandleApplyMdns
}))

describe('Edge Cluster Network Control Tab', () => {
  let params: { tenantId: string, clusterId: string, activeTab?: string }
  beforeEach(() => {
    params = {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '1',
      activeTab: 'networkControl'
    }
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })

    expect(await screen.findByTestId('ArpTerminationFormItem')).toBeVisible()
    expect(await screen.findByTestId('DhcpFormItem')).toBeVisible()
    expect(await screen.findByTestId('HQoSBandwidthFormItem')).toBeVisible()
    expect(await screen.findByTestId('MdnsProxyFormItem')).toBeVisible()
  })

  it('submit form should correctly call function', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedHandleApplyArpTermination).toBeCalled())
    await waitFor(() => expect(mockedHandleApplyDhcp).toBeCalled())
    await waitFor(() => expect(mockedHandleApplyHqos).toBeCalled())
    await waitFor(() => expect(mockedHandleApplyMdns).toBeCalled())
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    await screen.findAllByRole('button')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge`,
      search: ''
    })
  })

  it('should show compatibility component', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByTestId('EdgeCompatibilityDrawer')).toBeVisible()
  })
})