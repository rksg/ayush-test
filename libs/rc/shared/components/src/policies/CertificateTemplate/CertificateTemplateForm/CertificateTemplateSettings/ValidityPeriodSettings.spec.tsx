import { Form } from 'antd'

import { ExpirationDateEntity, ExpirationType } from '@acx-ui/rc/utils'
import { render, renderHook, screen }           from '@acx-ui/test-utils'

import ValidityPeriodSettings from './ValidityPeriodSettings'

describe('ValidityPeriodSettings', () => {
  it('should render start date and expiration date selectors', () => {
    render(<Form><ValidityPeriodSettings /></Form>)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('Expiration Date')).toBeInTheDocument()
  })

  it('should render start date and expiration date selectors with the given data', async () => {
    const notBefore = new ExpirationDateEntity()
    notBefore.setToAfterTime(ExpirationType.WEEKS_AFTER_TIME, 10)
    const notAfter = new ExpirationDateEntity()
    notAfter.setToByDate('2022-12-31')
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({ notBefore, notAfter })
      return form
    })
    render(<Form form={formRef.current}> <ValidityPeriodSettings /></Form >)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('Expiration Date')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('10')).toBeVisible()
    expect(await screen.findByText('Weeks')).toBeVisible()
    expect(await screen.findByDisplayValue('12/31/2022')).toBeVisible()
  })
})
