
import { Form } from 'antd'

import { IpSecAuthEnum, IpSecFailoverModeEnum } from '@acx-ui/rc/utils'
import { render, renderHook, screen }           from '@acx-ui/test-utils'

import FailoverSettings from './FailoverSettings'



const initialFormValue = {
  advancedOption: {
    failoverRetryPeriod: 0,
    failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE
  },
  id: 'testId',
  name: 'testName',
  serverAddress: '1.1.1.1',
  authType: IpSecAuthEnum.PSK
}

describe('FailoverSettings', () => {
  it('renders with default props', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    render(<Form form={formRef.current}><FailoverSettings /></Form>)
    expect(screen.getByText('Retry Duration')).toBeInTheDocument()
    expect(screen.getByText('Retry Interval')).toBeInTheDocument()
    expect(screen.getByText('Retry Mode')).toBeInTheDocument()
  })

  it('renders with initIpSecData prop', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })

    const initIpSecData = {
      advancedOption: {
        failoverRetryPeriod: 10,
        failoverMode: IpSecFailoverModeEnum.REVERTIVE
      }
    }
    render(<Form form={formRef.current}>
      <FailoverSettings initIpSecData={initIpSecData} /></Form>)
    expect(screen.getByText('Retry Duration')).toBeInTheDocument()
    expect(screen.getByText('Retry Interval')).toBeInTheDocument()
    expect(screen.getByText('Retry Mode')).toBeInTheDocument()
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
  })

  it('updates retryDuration state when initIpSecData changes', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    const initIpSecData = {
      advancedOption: {
        failoverRetryPeriod: 10
      }
    }
    render(<Form form={formRef.current}>
      <FailoverSettings initIpSecData={initIpSecData} /></Form>)
    expect(screen.getByText('Specific Period')).toBeInTheDocument()

    expect(screen.getByText('Forever')).toBeInTheDocument()
  })

  it('updates retryMode state when initIpSecData changes', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    const initIpSecData = {
      advancedOption: {
        failoverMode: IpSecFailoverModeEnum.REVERTIVE
      }
    }
    render(<Form form={formRef.current}>
      <FailoverSettings initIpSecData={initIpSecData} /></Form>)
    expect(screen.getByText('REVERTIVE')).toBeInTheDocument()

    render(<Form form={formRef.current}>
      <FailoverSettings initIpSecData={{
        advancedOption: { failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE }
      }} /></Form>)
    expect(screen.getByText('Non-revertive')).toBeInTheDocument()
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
  })
})