import { Form } from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { EdgeClusterVirtualIpSettingForm } from '.'

jest.mock('./VipCard', () => ({
  ...jest.requireActual('./VipCard'),
  VipCard: () => <div data-testid='VipCard' />
}))

describe('EdgeClusterSettingForm', () => {
  it('should render EdgeClusterVirtualIpSettingForm successfully', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [{}])
      return form
    })
    render(
      <StepsForm form={formRef.current}>
        <StepsForm.StepForm>
          <EdgeClusterVirtualIpSettingForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByTestId('VipCard')).toBeVisible()
    expect(screen.getByRole('slider')).toBeVisible()
  })
})