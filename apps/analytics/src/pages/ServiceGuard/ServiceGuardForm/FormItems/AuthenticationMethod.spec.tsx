import userEvent    from '@testing-library/user-event'
import { NamePath } from 'antd/es/form/interface'

import {
  serviceGuardApi as api,
  serviceGuardApiURL as apiUrl
} from '@acx-ui/store'
import { store }                            from '@acx-ui/store'
import { mockGraphqlQuery, screen, within } from '@acx-ui/test-utils'

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
  showSearch: boolean
  onChange?: (value: string) => void
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: MockSelectProps) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})
jest.mock('./Password', () => ({ Password: { reset: jest.fn() } }))
jest.mock('./Username', () => ({ Username: { reset: jest.fn() } }))

describe('AuthenticationMethod', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('handle virtual-client', async () => {
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

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
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

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
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

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

  it('renders suggested optgroup', async () => {
    const selected = AuthenticationMethodEnum.WPA2_PERSONAL
    const wlanName = 'N 1'

    mockGraphqlQuery(apiUrl, 'Wlans', {
      data: { wlans: [{ name: wlanName, authMethods: [selected] }] }
    })

    renderForm(<AuthenticationMethod />, {
      initialValues: {
        clientType: ClientType.VirtualClient,
        configs: [{
          authenticationMethod: selected,
          wlanName: wlanName
        }]
      }
    })

    const dropdown = await screen.findByRole('combobox')
    const input = within(dropdown)
    const suggested = input.getByRole('group', { name: 'Suggested' })
    const others = input.getByRole('group', { name: 'Others' })
    expect(suggested).toBeVisible()
    expect(within(suggested).getByRole('option', { name: 'Pre-Shared Key (PSK)' }))
      .toBeVisible()
    expect(others).toBeVisible()
    expect(within(others).queryByRole('option', { name: 'Pre-Shared Key (PSK)' }))
      .not.toBeInTheDocument()
  })
})
