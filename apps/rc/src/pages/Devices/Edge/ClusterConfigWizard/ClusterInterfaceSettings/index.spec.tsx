import userEvent from '@testing-library/user-event'

import { EdgeClusterStatus, EdgeGeneralFixtures, EdgePortConfigFixtures, EdgePortTypeEnum } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { ClusterInterfaceSettings } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockClusterInterfaceOptionData } = EdgePortConfigFixtures

const mockedUpdateApi = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useClusterInterfaceActions: () => ({
    allInterfaceData: mockClusterInterfaceOptionData,
    isInterfaceDataLoading: false,
    updateClusterInterface: mockedUpdateApi
  })
}))
jest.mock('./EdgeClusterInterfaceSettingForm', () => ({
  ...jest.requireActual('./EdgeClusterInterfaceSettingForm'),
  EdgeClusterInterfaceSettingForm: () => <div data-testid='cluster-interface-setting-form' />
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ClusterInterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'clusterInterface'
    }
  })

  it('should correctly render', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
      }}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Cluster Interface')).toBeVisible()
    expect(await screen.findByTestId('cluster-interface-setting-form')).toBeVisible()
  })

  it('should Apply & Finish successfully', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
      }}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    const expectedResult = Object.values(mockClusterInterfaceOptionData).flat()
      .filter(item => item.portType === EdgePortTypeEnum.CLUSTER)
      .map(item => ({
        nodeName: mockEdgeClusterList.data[0].edgeList
          .find(node => node.serialNumber ===item.serialNumber)?.name,
        serialNumber: item.serialNumber,
        interfaceName: item.portName,
        ip: item.ip,
        subnet: item.subnet
      }))

    expect(await screen.findByTestId('cluster-interface-setting-form')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Finish' }))
    expect(mockedUpdateApi).toBeCalledWith(expectedResult, expect.any(Function))
  })

  it('should Apply & Continue successfully', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
      }}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    const expectedResult = Object.values(mockClusterInterfaceOptionData).flat()
      .filter(item => item.portType === EdgePortTypeEnum.CLUSTER)
      .map(item => ({
        nodeName: mockEdgeClusterList.data[0].edgeList
          .find(node => node.serialNumber ===item.serialNumber)?.name,
        serialNumber: item.serialNumber,
        interfaceName: item.portName,
        ip: item.ip,
        subnet: item.subnet
      }))

    expect(await screen.findByTestId('cluster-interface-setting-form')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))
    expect(mockedUpdateApi).toHaveBeenCalledWith(expectedResult, expect.any(Function))
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus
      }}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge`,
      search: ''
    })
  })
})
