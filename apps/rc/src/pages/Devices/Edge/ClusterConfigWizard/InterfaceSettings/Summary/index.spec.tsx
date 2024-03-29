import { Form } from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { mockClusterConfigWizardData } from '../../__tests__/fixtures'

import { Summary } from '.'

jest.mock('./LagTable', () => ({
  ...jest.requireActual('./LagTable'),
  LagTable: () => <div data-testid='LagTable' />
}))
jest.mock('./PortGeneralTable', () => ({
  ...jest.requireActual('./PortGeneralTable'),
  PortGeneralTable: () => <div data-testid='PortGeneralTable' />
}))
jest.mock('./VipCard', () => ({
  ...jest.requireActual('./VipCard'),
  VipCard: () => <div data-testid='VipCard' />
}))

describe('InterfaceSettings - Summary', () => {
  it('should correctly render', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', mockClusterConfigWizardData.vipConfig)
      form.setFieldValue('timeout', mockClusterConfigWizardData.timeout)
      return form
    })
    render(
      <StepsForm form={formRef.current}>
        <StepsForm.StepForm>
          <Summary />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByTestId('LagTable')).toBeVisible()
    expect(screen.getByTestId('PortGeneralTable')).toBeVisible()
    expect(await screen.findByTestId('VipCard')).toBeVisible()
    expect(await screen.findByText('HA Timeout')).toBeVisible()
    expect(await screen.findByText('3 seconds')).toBeVisible()
  })
})