import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'

import { StepsForm }                                                                                                              from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeLag, EdgeLagFixtures, edgePhysicalPortInitialConfigs, EdgePort, EdgeStatus } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                                                                                             from '@acx-ui/test-utils'

import { getTargetInterfaceFromInterfaceSettingsFormData, mockClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }                                                   from '../ClusterConfigWizardDataProvider'

import { LagForm }                   from './LagForm'
import { InterfaceSettingsFormType } from './types'

const { mockEdgeClusterList } = EdgeGeneralFixtures
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
  EdgeLagTable: (
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
  </div>
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

  it.todo('should add another successfully')

  it('should edit successfully', async () => {
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
        <StepsForm form={formRef.current} initialValues={mockClusterConfigWizardData}>
          <StepsForm.StepForm>
            <LagForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    formRef.current.setFieldValue('lagSettings', [
      {
        serialNumber: 'serialNumber-1',
        lags: [mockedEdgeLagList.content[1]]
      }
    ])

    expect(await screen.findByTestId('lag-table')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'TestEdit' }))
    // eslint-disable-next-line max-len
    const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
    expect(lagSettings.length).toBe(2)
    expect(lagSettings[0].serialNumber).toBe('serialNumber-2')
    expect(lagSettings[1].serialNumber).toBe('serialNumber-1')
    expect(lagSettings[1].lags.length).toBe(2)
    expect(lagSettings[1].lags.find(item => item.id === mockExpectedEditResult.id ))
      .toBe(mockExpectedEditResult)

  })

  it('should delete successfully', async () => {
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
    let expectedPort1Result = _.cloneDeep(getTargetInterfaceFromInterfaceSettingsFormData(
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
    let expectedPort2Result = _.cloneDeep(getTargetInterfaceFromInterfaceSettingsFormData(
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

  describe('when no node configured LAG', () => {
    const mockedOneNodeConfigured = _.cloneDeep(mockClusterConfigWizardData)
    mockedOneNodeConfigured.lagSettings = undefined

    it('should edit successfully', async () => {
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

      formRef.current.setFieldValue('lagSettings', [
        {
          serialNumber: 'serialNumber-1',
          lags: [mockedEdgeLagList.content[1]]
        }
      ])

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
})