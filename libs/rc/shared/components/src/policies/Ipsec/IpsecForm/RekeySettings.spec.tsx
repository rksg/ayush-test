import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { IpSecRekeyTimeUnitEnum }    from '@acx-ui/rc/utils'
import { render, fireEvent, screen } from '@acx-ui/test-utils'

import RekeySettings from './RekeySettings'

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

  it('toggles checkboxes', () => {
    renderComponent()

    //ikeRekeyTimeEnabled
    const ikeRekeyTimeEnabledCheckbox = screen.getByTestId('ikeRekeyTimeEnabled') as HTMLInputElement
    expect(ikeRekeyTimeEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('ikeRekeyTime')).not.toBeInTheDocument()

    fireEvent.click(ikeRekeyTimeEnabledCheckbox)
    expect(ikeRekeyTimeEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('ikeRekeyTime')).toBeInTheDocument()

    //espRekeyTimeEnabled
    const espRekeyTimeEnabledCheckbox = screen.getByTestId('espRekeyTimeEnabled') as HTMLInputElement
    expect(espRekeyTimeEnabledCheckbox.checked).toBe(false)
    expect(screen.queryByTestId('espRekeyTime')).not.toBeInTheDocument()

    fireEvent.click(espRekeyTimeEnabledCheckbox)
    expect(espRekeyTimeEnabledCheckbox.checked).toBe(true)
    expect(screen.getByTestId('espRekeyTime')).toBeInTheDocument()
  })
})