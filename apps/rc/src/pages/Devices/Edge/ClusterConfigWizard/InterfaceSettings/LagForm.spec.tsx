import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                                                        from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeLag, EdgeLagFixtures } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                                       from '@acx-ui/test-utils'

import { mockClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }  from '../ClusterConfigWizardDataProvider'

import { LagForm }                   from './LagForm'
import { InterfaceSettingsFormType } from './types'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedEdgeLagList } = EdgeLagFixtures

const mockExpectedEditResult = {
  ...mockedEdgeLagList.content[1],
  lagMembers: [
    {
      portId: 'portId-1',
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
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
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
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
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

  it('should edit successfully', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
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
      form.setFieldsValue(mockClusterConfigWizardData)
      return form
    })
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
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
    await userEvent.click(screen.getByRole('button', { name: 'TestDelete' }))
    // eslint-disable-next-line max-len
    const lagSettings = formRef.current.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
    expect(lagSettings.length).toBe(2)
    expect(lagSettings.find(item => item.serialNumber === 'serialNumber-1')?.lags.length).toBe(0)
  })
})