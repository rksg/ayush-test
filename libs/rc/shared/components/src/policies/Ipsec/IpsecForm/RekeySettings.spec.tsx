import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { IpSecAuthEnum }                         from '@acx-ui/rc/utils'
import { render, fireEvent, screen, renderHook } from '@acx-ui/test-utils'

import RekeySettings from './RekeySettings'

const initialFormValue = {
  id: 'testId',
  name: 'testName',
  authType: IpSecAuthEnum.PSK,
  ikeRekeyTime: 4,
  espRekeyTime: 1
}

describe('RekeySettings', () => {
  const renderComponent = () => {
    return render(
      <IntlProvider locale='en'>
        <Form>
          <RekeySettings loadReKeySettings setLoadReKeySettings={jest.fn()}/>
        </Form>
      </IntlProvider>
    )
  }

  it('renders with default props', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })
    render(<Form form={formRef.current}>
      <RekeySettings
        initIpSecData={initialFormValue}
        loadReKeySettings
        setLoadReKeySettings={jest.fn()} /></Form>)
    expect(screen.getByText('Internet Key Exchange (IKE)')).toBeInTheDocument()
    expect(screen.getByText('Encapsulating Security Payload (ESP)')).toBeInTheDocument()

    const ikeRekeyTimeElement = screen.getByTestId('ikeRekeyTime')
    expect(ikeRekeyTimeElement).toBeInTheDocument()
    const espRekeyTimeElement = screen.getByTestId('espRekeyTime')
    expect(espRekeyTimeElement).toBeInTheDocument()
  })

  it('toggles checkboxes', () => {
    renderComponent()

    //ikeRekeyTimeEnabled
    const ikeRekeyTimeEnabledCheckbox = screen
      .getByTestId('ikeRekeyTimeEnabled') as HTMLInputElement
    expect(ikeRekeyTimeEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('ikeRekeyTime')).not.toBeInTheDocument()

    fireEvent.click(ikeRekeyTimeEnabledCheckbox)
    expect(ikeRekeyTimeEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('ikeRekeyTime')).toBeInTheDocument()

    //espRekeyTimeEnabled
    const espRekeyTimeEnabledCheckbox = screen
      .getByTestId('espRekeyTimeEnabled') as HTMLInputElement
    expect(espRekeyTimeEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('espRekeyTime')).not.toBeInTheDocument()

    fireEvent.click(espRekeyTimeEnabledCheckbox)
    expect(espRekeyTimeEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('espRekeyTime')).toBeInTheDocument()
  })
})