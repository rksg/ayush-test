import { Form } from 'antd'

import { StepsForm }                                     from '@acx-ui/components'
import { Features }                                      from '@acx-ui/feature-toggle'
import { EdgePortConfigFixtures, useIsEdgeFeatureReady } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                    from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../ClusterConfigWizardDataProvider'

import { VirtualIpForm } from './VirtualIpForm'

const { mockLanInterfaces } = EdgePortConfigFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeClusterVirtualIpSettingForm: () => <div data-testid='virtual-ip-setting-form' />
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetAllInterfacesByTypeQuery: () => ({
    data: mockLanInterfaces,
    isLoading: false
  })
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
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

  afterEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockReset()
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
    expect(await screen.findByTestId('virtual-ip-setting-form')).toBeVisible()
  })

  describe('when core access separation enabled', () => {
    beforeEach(() => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
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
          // eslint-disable-next-line max-len
          route: { params, path: '/:tenantId/devices/edge/cluster/:clusterId/configure/:settingType' }
        })

      expect(screen.getByText('Cluster Virtual IP')).toBeVisible()
      expect(await screen.findByTestId('virtual-ip-setting-form')).toBeVisible()
    })
  })
})