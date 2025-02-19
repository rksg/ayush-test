import { Form } from 'antd'

import { IpSecAuthEnum, IpSecFailoverModeEnum }  from '@acx-ui/rc/utils'
import { fireEvent, render, renderHook, screen } from '@acx-ui/test-utils'

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

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('FailoverSettings', () => {
  it('renders with default props', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    render(<Form form={formRef.current}>
      <FailoverSettings loadFailoverSettings setLoadFailoverSettings={jest.fn()} /></Form>)
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
      <FailoverSettings initIpSecData={initIpSecData}
        loadFailoverSettings
        setLoadFailoverSettings={jest.fn()} /></Form>)
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
      <FailoverSettings initIpSecData={initIpSecData}
        loadFailoverSettings
        setLoadFailoverSettings={jest.fn()} /></Form>)
    expect(screen.getByText('Specific Period')).toBeInTheDocument()

    expect(screen.getByText('Forever')).toBeInTheDocument()
  })

  it('updates retryMode state when initIpSecData changes', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    render(<Form form={formRef.current}>
      <FailoverSettings
        loadFailoverSettings
        setLoadFailoverSettings={jest.fn()} /></Form>)

    expect(screen.queryByText('Check Interval')).not.toBeInTheDocument()

    const failoverModeSelect = screen.getAllByRole('combobox', { name: /retry mode/i })[0]
    fireEvent.change(failoverModeSelect, { target: { value: IpSecFailoverModeEnum.REVERTIVE } })
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
  })
})