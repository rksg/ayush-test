import { Form } from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { EdgePortConfigFixtures }     from '@acx-ui/rc/utils'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../ClusterConfigWizardDataProvider'

import { VirtualIpForm } from './VirtualIpForm'

const { mockLanInterfaces } = EdgePortConfigFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeClusterVirtualIpSettingForm: () => <div data-testid='virtual-ip-seeting-form' />
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetAllInterfacesByTypeQuery: () => ({
    data: mockLanInterfaces,
    isLoading: false
  })
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
})