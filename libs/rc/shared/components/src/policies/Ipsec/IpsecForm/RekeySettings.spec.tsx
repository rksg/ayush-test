import { render, screen } from '@testing-library/react'
import { Form }           from 'antd'
import { IntlProvider }   from 'react-intl'

import { IpSecRekeyTimeUnitEnum } from '@acx-ui/rc/utils'

import RekeySettings from './RekeySettings'

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

describe('RekeySettings', () => {
  const renderComponent = () => {
    return render(
      <IntlProvider locale='en'>
        <Form>
          <RekeySettings />
        </Form>
      </IntlProvider>
    )
  }

  it('displays both IKE and ESP form fields', () => {
    renderComponent()
    expect(screen.getByText('Internet Key Exchange (IKE)')).toBeInTheDocument()
    expect(screen.getByText('Encapsulating Security Payload (ESP)')).toBeInTheDocument()
  })

  it('initializes IKE/ESP unit select with HOUR', () => {
    renderComponent()
    const ikeUnitSelect = screen.getAllByRole('combobox')[0]
    expect(ikeUnitSelect).toHaveValue(IpSecRekeyTimeUnitEnum.HOUR)
    const espUnitSelect = screen.getAllByRole('combobox')[1]
    expect(espUnitSelect).toHaveValue(IpSecRekeyTimeUnitEnum.HOUR)
  })
})