import { Form } from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../ClusterConfigWizardDataProvider'

import { VirtualIpForm } from './VirtualIpForm'


jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeClusterVirtualIpSettingForm: () => <div data-testid='virtual-ip-seeting-form' />
}))

describe('InterfaceSettings - VirtualIpForm', () => {
  let params: { tenantId: string, clusterId:string, settingType:string }
  beforeEach(() => {
    params = {
      tenantId: 'mocked_t_id',
      clusterId: 'mocked_cluster_id',
      settingType: 'interface'
    }
  })

  it('should correctly render', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockClusterConfigWizardData)
      return form
    })
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <VirtualIpForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Cluster Virtual IP')).toBeVisible()
    expect(await screen.findByTestId('virtual-ip-seeting-form')).toBeVisible()
  })

  it('should update to newest data correctly (for test coverage)', async () => {
    // if component has been refactored, please remove this test case
    const updatedData = {
      ...mockClusterConfigWizardData,
      portSettings: {
        ...mockClusterConfigWizardData.portSettings,
        'serialNumber-1': {
          ...mockClusterConfigWizardData.portSettings['serialNumber-1'],
          port2: [{
            ...mockClusterConfigWizardData.portSettings['serialNumber-1'].port2[0],
            ip: '1.2.3.4'
          }]
        }
      }
    }
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(updatedData)
      return form
    })
    render(
      <ClusterConfigWizardContext.Provider value={defaultCxtData}>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <VirtualIpForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>,
      {
        route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
      })

    expect(screen.getByText('Cluster Virtual IP')).toBeVisible()
    expect(await screen.findByTestId('virtual-ip-seeting-form')).toBeVisible()
    expect(
      formRef.current.getFieldValue('vipConfig')[0].interfaces['serialNumber-1'].ip
    ).toBe('1.2.3.4')
  })
})