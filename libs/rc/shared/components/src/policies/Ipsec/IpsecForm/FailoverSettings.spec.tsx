import { Form } from 'antd'

import { IpSecAuthEnum, IpSecFailoverModeEnum, IpSecAdvancedOptionEnum, IpSecRetryDurationEnum, defaultIpsecFormData } from '@acx-ui/rc/utils'
import { fireEvent, render, renderHook, screen, MockSelect, MockSelectProps }                                          from '@acx-ui/test-utils'

import FailoverSettings from './FailoverSettings'

const initialFormValue = {
  // advancedOption: {
  //   failoverRetryPeriod: 0,
  //   failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE
  // },
  id: 'testId',
  name: 'testName',
  serverAddress: '1.1.1.1',
  authType: IpSecAuthEnum.PSK,
  ...defaultIpsecFormData
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = (props: MockSelectProps) => <MockSelect {...props}/>

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
      <FailoverSettings />
    </Form>)
    expect(screen.getByText('Retry Duration')).toBeInTheDocument()
    expect(screen.getByText('Retry Interval')).toBeInTheDocument()
    expect(screen.getByText('Retry Mode')).toBeInTheDocument()
  })

  it('renders with editData prop', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })

    const editData = {
      advancedOption: {
        ...defaultIpsecFormData.advancedOption,
        failoverRetryPeriod: 10,
        failoverMode: IpSecFailoverModeEnum.REVERTIVE
      }
    }
    render(<Form form={formRef.current}>
      <FailoverSettings editData={editData}/>
    </Form>)
    expect(screen.getByText('Retry Duration')).toBeInTheDocument()
    expect(screen.getByText('Retry Interval')).toBeInTheDocument()
    expect(screen.getByText('Retry Mode')).toBeInTheDocument()
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
  })

  it('updates retryDuration state when editData changes', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    const editData = {
      advancedOption: {
        failoverRetryPeriod: 10
      }
    }
    render(<Form form={formRef.current}>
      <FailoverSettings editData={editData} />
    </Form>)
    expect(screen.getByText('Specific Period')).toBeInTheDocument()

    expect(screen.getByText('Forever')).toBeInTheDocument()
  })

  it('updates retryMode state when editData changes', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(initialFormValue)
      return form
    })
    render(<Form form={formRef.current}>
      <FailoverSettings />
    </Form>)

    expect(screen.queryByText('Check Interval')).not.toBeInTheDocument()

    const failoverModeSelect = screen.getAllByRole('combobox', { name: /retry mode/i })[0]
    fireEvent.change(failoverModeSelect, { target: { value: IpSecFailoverModeEnum.REVERTIVE } })
    expect(screen.getByText('Check Interval')).toBeInTheDocument()
  })

  it('renders disabled retry period and enable with default value', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    let advancedOption = {
      dhcpOpt43Subcode: 1,
      retryLimit: 1,
      replayWindow: 1,
      ipcompEnable: IpSecAdvancedOptionEnum.ENABLED,
      enforceNatt: IpSecAdvancedOptionEnum.ENABLED,
      dpdDelay: 1,
      keepAliveInterval: 1,
      failoverRetryPeriod: 0, // default disable values
      failoverRetryInterval: 1,
      failoverMode: IpSecFailoverModeEnum.NON_REVERTIVE,
      failoverPrimaryCheckInterval: 1
    }
    let customizedValue = {
      id: 'testId',
      name: 'testName',
      authType: IpSecAuthEnum.PSK,
      advancedOption: advancedOption,
      failoverRetryPeriodIsForever: false // Ensure the checkbox is disabled
    }
    render(<Form form={formRef.current} initialValues={defaultIpsecFormData}>
      <FailoverSettings
        editData={customizedValue}
      /></Form>)
    expect(screen.getByText('Retry Duration')).toBeInTheDocument()

    // Check if the keep alive element is not visible
    const retryPeriodElement = screen.queryByTestId('advOpt-retryPeriod')
    expect(retryPeriodElement).not.toBeInTheDocument()

    const retryPeriodSelect = screen.getAllByRole('combobox', { name: /retry duration/i })[0]
    fireEvent.change(retryPeriodSelect, { target: { value: IpSecRetryDurationEnum.SPECIFIC } })
    const retryPeriodAfterChange = screen.queryByTestId('advOpt-retryPeriod')
    expect(retryPeriodAfterChange).toBeInTheDocument()
    const periodInput = retryPeriodAfterChange?.querySelector('input')
    expect(Number(periodInput!.value)).toBe(3) // Check if the default value is set correctly
  })
})