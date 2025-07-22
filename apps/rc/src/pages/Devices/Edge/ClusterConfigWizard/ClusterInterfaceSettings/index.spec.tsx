/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { EdgeClusterStatus, EdgeGeneralFixtures, EdgePortConfigFixtures, EdgePortTypeEnum } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ClusterConfigWizardContext, ClusterConfigWizardContextType } from '../ClusterConfigWizardDataProvider'

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

const defaultContext = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  isLoading: false,
  isFetching: false
}

describe('ClusterInterfaceSettings', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'clusterInterface'
    }
    mockedUpdateApi.mockClear()
    mockedUsedNavigate.mockClear()
  })

  it('should correctly render', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
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
      <ClusterConfigWizardContext.Provider value={defaultContext}>
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
        ipMode: item.ipMode,
        ip: item.ip.split('/')[0],
        subnet: item.subnet
      }))

    expect(await screen.findByTestId('cluster-interface-setting-form')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Finish' }))
    expect(mockedUpdateApi).toBeCalledWith(expectedResult, expect.any(Function))
  })

  it('should Apply & Continue successfully', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
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
        ipMode: item.ipMode,
        ip: item.ip.split('/')[0],
        subnet: item.subnet
      }))

    expect(await screen.findByTestId('cluster-interface-setting-form')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))
    expect(mockedUpdateApi).toHaveBeenCalledWith(expectedResult, expect.any(Function))
  })

  it('should navigate to cluster list page when applyAndFinish callback is executed', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Apply & Finish' }))

    // Get the callback function that was passed to updateClusterInterface
    const updateCallback = mockedUpdateApi.mock.calls[0][1]

    // Execute the callback to simulate successful API call
    updateCallback()

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge`,
      search: ''
    })
  })

  it('should navigate to select type page when applyAndContinue callback is executed', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))

    // Get the callback function that was passed to updateClusterInterface
    const updateCallback = mockedUpdateApi.mock.calls[0][1]

    // Execute the callback to simulate successful API call
    updateCallback()

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge/cluster/${params.clusterId}/configure`,
      search: ''
    })
  })

  it('should handle API error gracefully in applyAndFinish', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    mockedUpdateApi.mockRejectedValueOnce(new Error('API Error'))

    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Apply & Finish' }))

    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should handle API error gracefully in applyAndContinue', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    mockedUpdateApi.mockRejectedValueOnce(new Error('API Error'))

    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
        <ClusterInterfaceSettings />
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Apply & Continue' }))

    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={defaultContext}>
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

  // Test cases for nullish coalescing operator branches
  describe('nullish coalescing operator branches', () => {
    it('should use default values when clusterInfo.edgeList is null', () => {
      const clusterInfoWithNullEdgeList = {
        ...mockEdgeClusterList.data[0],
        edgeList: null
      } as unknown as EdgeClusterStatus

      render(
        <ClusterConfigWizardContext.Provider value={{
          ...defaultContext,
          clusterInfo: clusterInfoWithNullEdgeList
        }}>
          <ClusterInterfaceSettings />
        </ClusterConfigWizardContext.Provider>,
        {
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        }
      )

      expect(screen.getByText('Cluster Interface')).toBeVisible()
    })

    it('should use default values when clusterInfo.edgeList is empty array', () => {
      const clusterInfoWithEmptyEdgeList = {
        ...mockEdgeClusterList.data[0],
        edgeList: []
      } as unknown as EdgeClusterStatus

      render(
        <ClusterConfigWizardContext.Provider value={{
          ...defaultContext,
          clusterInfo: clusterInfoWithEmptyEdgeList
        }}>
          <ClusterInterfaceSettings />
        </ClusterConfigWizardContext.Provider>,
        {
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        }
      )

      expect(screen.getByText('Cluster Interface')).toBeVisible()
    })

    it('should use default values when edgeNode.serialNumber is null', () => {
      const clusterInfoWithNullSerialNumber = {
        ...mockEdgeClusterList.data[0],
        edgeList: [
          {
            ...mockEdgeClusterList.data[0].edgeList[0],
            serialNumber: null
          }
        ]
      } as unknown as EdgeClusterStatus

      render(
        <ClusterConfigWizardContext.Provider value={{
          ...defaultContext,
          clusterInfo: clusterInfoWithNullSerialNumber
        }}>
          <ClusterInterfaceSettings />
        </ClusterConfigWizardContext.Provider>,
        {
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        }
      )

      expect(screen.getByText('Cluster Interface')).toBeVisible()
    })

    it('should use default values when clusterInfo is null', () => {
      render(
        <ClusterConfigWizardContext.Provider value={{
          ...defaultContext,
          clusterInfo: null
        } as unknown as ClusterConfigWizardContextType}>
          <ClusterInterfaceSettings />
        </ClusterConfigWizardContext.Provider>,
        {
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        }
      )

      expect(screen.getByText('Cluster Interface')).toBeVisible()
    })

    it('should use default values when clusterInfo is undefined', () => {
      render(
        <ClusterConfigWizardContext.Provider value={{
          ...defaultContext,
          clusterInfo: undefined
        } as unknown as ClusterConfigWizardContextType}>
          <ClusterInterfaceSettings />
        </ClusterConfigWizardContext.Provider>,
        {
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        }
      )

      expect(screen.getByText('Cluster Interface')).toBeVisible()
    })
  })
})
