import userEvent    from '@testing-library/user-event'
import { NamePath } from 'antd/es/form/interface'

import { screen, within } from '@acx-ui/test-utils'

import { renderForm, renderFormHook }                from '../../__tests__/fixtures'
import { authMethodsByClientType }                   from '../../authMethods'
import {
  ClientType,
  AuthenticationMethod as AuthenticationMethodEnum
} from '../../types'

import { AuthenticationMethod } from './AuthenticationMethod'
import { Password }             from './Password'
import { Username }             from './Username'

type MockSelectProps = React.PropsWithChildren<{
  onChange: (code: AuthenticationMethodEnum) => void
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, ...props }: MockSelectProps) => (
    <select
      onChange={(e) => onChange(e.target.value as AuthenticationMethodEnum)}
      {...props}
    >
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})
jest.mock('./Password', () => ({ Password: { reset: jest.fn() } }))
jest.mock('./Username', () => ({ Username: { reset: jest.fn() } }))

describe('AuthenticationMethod', () => {
  it('handle virtual-client', async () => {
    const clientType = ClientType.VirtualClient
    renderForm(<AuthenticationMethod />, {
      initialValues: { clientType }
    })

    const dropdown = await screen.findByRole('combobox')
    const options = await within(dropdown).findAllByRole('option')
    const expected = authMethodsByClientType[clientType].map(method => method.code)
    const result = options.map((el) => (el as HTMLOptionElement).value).filter(Boolean)
    expect(result).toEqual(expected)
  })

  it('handle virtual-wireless-client', async () => {
    const clientType = ClientType.VirtualWirelessClient
    renderForm(<AuthenticationMethod />, {
      initialValues: { clientType }
    })

    const dropdown = await screen.findByRole('combobox')
    const options = await within(dropdown).findAllByRole('option')

    const expected = authMethodsByClientType[clientType].map(method => method.code)
    const result = options.map((el) => (el as HTMLOptionElement).value).filter(Boolean)
    expect(result).toEqual(expected)
  })

  it('resets other fields on change', async () => {
    const clientType = ClientType.VirtualWirelessClient
    renderForm(<AuthenticationMethod />, {
      initialValues: { clientType }
    })

    const dropdown = await screen.findByRole('combobox')
    await userEvent.selectOptions(
      dropdown,
      within(dropdown).getByRole('option', { name: 'WPA3-Personal' })
    )

    expect(Username.reset)
      .toHaveBeenCalledWith(expect.anything(), AuthenticationMethodEnum.WPA3_PERSONAL)
    expect(Password.reset)
      .toHaveBeenCalledWith(expect.anything(), AuthenticationMethodEnum.WPA3_PERSONAL)
  })

  describe('reset', () => {
    const name = AuthenticationMethod.fieldName as unknown as NamePath

    it('resets to undefined', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, AuthenticationMethodEnum.WPA3_PERSONAL)
      AuthenticationMethod.reset(form, ClientType.VirtualClient)
      expect(form.getFieldValue(name)).toEqual(undefined)
    })

    it('does not reset', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, AuthenticationMethodEnum.WPA2_PERSONAL)
      AuthenticationMethod.reset(form, ClientType.VirtualClient)
      expect(form.getFieldValue(name)).toEqual(AuthenticationMethodEnum.WPA2_PERSONAL)
    })
  })
})
