import userEvent           from '@testing-library/user-event'
import { Form }            from 'antd'
import { cloneDeep, find } from 'lodash'

import { StepsForm }      from '@acx-ui/components'
import { Features }       from '@acx-ui/feature-toggle'
import { EdgeLagTable }   from '@acx-ui/rc/components'
import {
  EdgeClusterStatus, EdgeFormFieldsPropsType,
  EdgeGeneralFixtures, EdgeIpModeEnum, EdgeLag, EdgeLagFixtures,
  edgePhysicalPortInitialConfigs,
  EdgePort, EdgePortTypeEnum, EdgeStatus,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/utils'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { getTargetInterfaceFromInterfaceSettingsFormData, mockClusterConfigWizardData, mockDualWanClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }                                                                                       from '../ClusterConfigWizardDataProvider'

import { LagForm }                   from './LagForm'
import { InterfaceSettingsFormType } from './types'

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const mockedClusterInfo = mockEdgeClusterList.data[0] as EdgeClusterStatus
const nodeList = mockedClusterInfo.edgeList as EdgeStatus[]

const mockExpectedEditResult = {
  ...mockedEdgeLagList.content[1],
  lagMembers: [
    {
      portId: 'port_id_0',
      portEnabled: true
    }, {
      portId: 'port_id_1',
      portEnabled: true
    }
  ]
}

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeLagTable: jest.fn().mockImplementation((
    { onAdd, onEdit, onDelete }:
    {
      onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>,
      onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>,
      onDelete: (serialNumber: string, id: string) => Promise<void>
    }
  ) => <div data-testid='lag-table'>
    <button
      onClick={() => onAdd('serialNumber-1', mockedEdgeLagList.content[0])}
    >
      TestAdd
    </button>
    <button onClick={() => onEdit('serialNumber-1', mockExpectedEditResult)}>TestEdit</button>
    <button onClick={() => onDelete('serialNumber-1', '0')}>TestDelete</button>
  </div>)
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('InterfaceSettings - LagForm', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'interface'
    }
  })

  afterEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockReset()
  })

  it('should correctly render', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('LAG Settings')).toBeVisible()
    expect(await screen.findByTestId('lag-table')).toBeVisible()
  })

  it('should add successfully', async () => {
    const { result: formRef } = renderHook(() => Form.useForm<InterfaceSettingsFormType>()[0])

    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestAdd' }))
    // eslint-disable-next-line max-len
    const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
    expect(lagSettings.length).toBe(1)
    expect(lagSettings[0].serialNumber).toBe('serialNumber-1')
    expect(lagSettings[0].lags.length).toBe(1)
    expect(lagSettings[0].lags[0]).toBe(mockedEdgeLagList.content[0])
  })

  it('should add another successfully', async () => {
    const { result: formRef } = renderHook(() => Form.useForm<InterfaceSettingsFormType>()[0])

    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm form={formRef.current} initialValues={mockClusterConfigWizardData}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestAdd' }))
    // eslint-disable-next-line max-len
    const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
    expect(lagSettings.length).toBe(2)
    expect(lagSettings[0].serialNumber).toBe('serialNumber-2')
    expect(lagSettings[1].serialNumber).toBe('serialNumber-1')
    // lag0, lag1, the new one is lag1
    expect(lagSettings[1].lags.length).toBe(2)
    const expectedNewAdd = mockedEdgeLagList.content[0]
    expect(lagSettings[1].lags.find(item => item.id === expectedNewAdd.id ))
      .toBe(expectedNewAdd)
  })

  it('should edit successfully', async () => {
    const { result: formRef } = renderHook(() => Form.useForm<InterfaceSettingsFormType>()[0])
    const mockData = cloneDeep(mockClusterConfigWizardData)
    const n1lag0 = getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[0].serialNumber, 'lag0', mockData.lagSettings, mockData.portSettings)
    n1lag0!.id = 2

    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm form={formRef.current} initialValues={mockData}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestEdit' }))
    // eslint-disable-next-line max-len
    const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
    expect(lagSettings.length).toBe(2)
    expect(lagSettings[0].serialNumber).toBe('serialNumber-2')
    expect(lagSettings[1].serialNumber).toBe('serialNumber-1')
    expect(lagSettings[1].lags.length).toBe(1)
    expect(lagSettings[1].lags.find(item => item.id === mockExpectedEditResult.id ))
      .toBe(mockExpectedEditResult)
  })

  it('should delete successfully', async () => {
    const { result: formRef } = renderHook(() => Form.useForm<InterfaceSettingsFormType>()[0])

    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm form={formRef.current} initialValues={mockClusterConfigWizardData}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestDelete' }))
    // eslint-disable-next-line max-len
    const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
    expect(lagSettings.length).toBe(2)
    expect(lagSettings.find(item => item.serialNumber === 'serialNumber-1')?.lags.length).toBe(0)
  })

  it('should reset LAG members port config into UNCONFIGURED', async () => {
    const mockFormSetFieldValue = jest.fn()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue = mockFormSetFieldValue
      return form
    })
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm form={formRef.current} initialValues={mockClusterConfigWizardData}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestEdit' }))
    expect(mockFormSetFieldValue).toBeCalledTimes(2)

    const port1FieldPath = ['portSettings', 'serialNumber-1', 'port1']
    let expectedPort1Result = cloneDeep(getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[0].serialNumber,
      'port1',
      mockClusterConfigWizardData.lagSettings,
      mockClusterConfigWizardData.portSettings
    )) as EdgePort
    expectedPort1Result = {
      ...expectedPort1Result,
      ...edgePhysicalPortInitialConfigs
    }
    expect(mockFormSetFieldValue).toBeCalledWith(port1FieldPath, [expectedPort1Result])

    const port2FieldPath = ['portSettings', 'serialNumber-1', 'port2']
    let expectedPort2Result = cloneDeep(getTargetInterfaceFromInterfaceSettingsFormData(
      nodeList[0].serialNumber,
      'port2',
      mockClusterConfigWizardData.lagSettings,
      mockClusterConfigWizardData.portSettings
    )) as EdgePort
    expectedPort2Result = {
      ...expectedPort2Result,
      ...edgePhysicalPortInitialConfigs
    }
    expect(mockFormSetFieldValue).toBeCalledWith(port2FieldPath, [expectedPort2Result])
  })

  it('should delete LAG subInterface when LAG is deleted', async () => {
    const mockFormSetFieldValue = jest.fn()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue = mockFormSetFieldValue
      return form
    })
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm form={formRef.current} initialValues={mockClusterConfigWizardData}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestDelete' }))
    expect(mockFormSetFieldValue).toBeCalledTimes(1)

    const lagSubInterfaceFieldPath = ['lagSubInterfaces', 'serialNumber-1']
    expect(mockFormSetFieldValue).toBeCalledWith(lagSubInterfaceFieldPath, {})
  })

  describe('when no node configured LAG', () => {
    const mockedOneNodeConfigured = cloneDeep(mockClusterConfigWizardData)
    mockedOneNodeConfigured.lagSettings = undefined

    it('should edit successfully', async () => {
      const { result: formRef } = renderHook(() => Form.useForm<InterfaceSettingsFormType>()[0])

      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm form={formRef.current} initialValues={mockedOneNodeConfigured}>
            <StepsForm.StepForm>
              <LagForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
          }
        })

      expect(await screen.findByTestId('lag-table')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'TestEdit' }))
      // eslint-disable-next-line max-len
      const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
      expect(lagSettings.length).toBe(1)
      expect(lagSettings[0].serialNumber).toBe('serialNumber-1')
      expect(lagSettings[0].lags.length).toBe(1)
      expect(lagSettings[0].lags[0]).toBe(mockExpectedEditResult)
    })

    it('should delete successfully', async () => {
      const { result: formRef } = renderHook(() => Form.useForm<InterfaceSettingsFormType>()[0])

      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm form={formRef.current} initialValues={mockedOneNodeConfigured}>
            <StepsForm.StepForm>
              <LagForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType'
          }
        })

      expect(await screen.findByTestId('lag-table')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'TestDelete' }))
      // eslint-disable-next-line max-len
      const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
      expect(lagSettings.length).toBe(1)
      expect(lagSettings.find(item => item.serialNumber === 'serialNumber-1')?.lags).toBe(undefined)
    })
  })

  describe('when multi NAT IP enabled', () => {
    const MockComponent = ({ formFieldsProps }: { formFieldsProps?: EdgeFormFieldsPropsType }) => {
      return <Form.Item
        data-testid='lag-table'
        name='test-nat-pool-overlap'
        {...formFieldsProps?.natStartIp}
        children={<span></span>}
      />
    }

    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_MULTI_NAT_IP_TOGGLE)
      jest.mocked(EdgeLagTable).mockImplementation((props) => <MockComponent {...props}/>)
    })

    const mockNode1NatPoolEnabledData = cloneDeep(mockClusterConfigWizardData)
    const node1Sn = mockedHaNetworkSettings.portSettings[0].serialNumber
    const node2Sn = mockedHaNetworkSettings.portSettings[1].serialNumber
    mockNode1NatPoolEnabledData.portSettings[node1Sn].port1[0].portType = EdgePortTypeEnum.WAN
    mockNode1NatPoolEnabledData.portSettings[node1Sn].port1[0].natEnabled = true
    // eslint-disable-next-line max-len
    mockNode1NatPoolEnabledData.portSettings[node1Sn].port1[0].natPools = [{ startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.30' }]

    it('should validate if NAT pool overlap between edges', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })

      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm form={formRef.current} initialValues={mockNode1NatPoolEnabledData}>
            <StepsForm.StepForm>
              <LagForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        })

      expect(await screen.findByTestId('lag-table')).toBeVisible()
      const mockChangeNode2Lag = cloneDeep(mockClusterConfigWizardData.lagSettings[1].lags[0])
      mockChangeNode2Lag.portType = EdgePortTypeEnum.WAN
      mockChangeNode2Lag.natEnabled = true
      mockChangeNode2Lag.natPools = [{ startIpAddress: '1.1.1.10', endIpAddress: '1.1.1.20' }]
      formRef.current.setFieldValue('test-nat-pool-overlap', mockChangeNode2Lag)

      await userEvent.click(screen.getByRole('button', { name: 'Add' }))

      const error = await screen.findByRole('alert')
      expect(error).toBeVisible()
      const edge1Name = find(mockEdgeClusterList.data[0].edgeList, { serialNumber: node1Sn })?.name
      const edge2Name = find(mockEdgeClusterList.data[0].edgeList, { serialNumber: node2Sn })?.name

      // eslint-disable-next-line max-len
      expect(error).toHaveTextContent(`NAT pool ranges on ${edge1Name} overlap with those on ${edge2Name}`)
    })
  })

  describe('when dual WAN enabled', () => {
    const MockComponent = ({ formFieldsProps }: { formFieldsProps?: EdgeFormFieldsPropsType }) => {
      return <Form.Item
        data-testid='lag-table'
        name='test-multi-wan-ip-mode'
        {...formFieldsProps?.ipMode}
        children={<span></span>}
      />
    }

    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)
      jest.mocked(EdgeLagTable).mockImplementation((props) => <MockComponent {...props}/>)

    })

    it('should validate if multi WAN have consistent IP mode when all WAN is LAG', async () => {
      const mockDiffIpModeLagWansData = cloneDeep(mockDualWanClusterConfigWizardData)
      const node1Sn = mockedHaNetworkSettings.portSettings[0].serialNumber
      // eslint-disable-next-line max-len
      mockDiffIpModeLagWansData.portSettings[node1Sn].port1[0].portType = EdgePortTypeEnum.UNCONFIGURED
      const secondLag = cloneDeep(mockDiffIpModeLagWansData.lagSettings[0].lags[0])
      secondLag.id = 1
      secondLag.portType = EdgePortTypeEnum.WAN
      secondLag.ipMode = EdgeIpModeEnum.STATIC
      mockDiffIpModeLagWansData.lagSettings[0].lags.push(secondLag)

      const mockOnFinish = jest.fn()
      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm initialValues={mockDiffIpModeLagWansData} onFinish={mockOnFinish}>
            <StepsForm.StepForm>
              <LagForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        })

      expect(await screen.findByTestId('lag-table')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))

      const error = await screen.findByRole('alert')
      expect(error).toBeVisible()
      expect(error).toHaveTextContent('IP modes must be consistent across all WAN interfaces.')
      expect(mockOnFinish).toBeCalledTimes(0)
    })

    it('should pass if multi WAN have inconsistent IP mode when NOT all WAN is LAG', async () => {
      const mockDiffIpModeWansData = cloneDeep(mockDualWanClusterConfigWizardData)
      // make LAG WAN IP mode different from physical WAN
      mockDiffIpModeWansData.lagSettings[0].lags[0].ipMode = EdgeIpModeEnum.STATIC

      const mockOnFinish = jest.fn()
      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm initialValues={mockDiffIpModeWansData} onFinish={mockOnFinish}>
            <StepsForm.StepForm>
              <LagForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>,
        {
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        })

      expect(await screen.findByTestId('lag-table')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      expect(mockOnFinish).toBeCalledTimes(1)
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })
})