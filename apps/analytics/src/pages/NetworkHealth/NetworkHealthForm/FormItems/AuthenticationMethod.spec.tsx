import userEvent    from '@testing-library/user-event'
import { NamePath } from 'antd/es/form/interface'

<<<<<<< HEAD
import {
  networkHealthApi as api,
  networkHealthApiURL as apiUrl
} from '@acx-ui/analytics/services'
import { store }                                 from '@acx-ui/store'
import { act, mockGraphqlQuery, screen, within } from '@acx-ui/test-utils'
=======
import { screen, within } from '@acx-ui/test-utils'
>>>>>>> origin/feature/ACX-21924

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

<<<<<<< HEAD
  it('reset to undefined when clientType changed and current no longer available', async () => {
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

    const selected = AuthenticationMethod.WPA3_PERSONAL
    renderForm(field, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        configs: [{ authenticationMethod: selected }]
      },
      valuesToUpdate: {
        clientType: ClientType.VirtualClient
      }
    })

    expect(await screen.findByRole('combobox')).toHaveValue(selected)

    // prevent warning thrown
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await click(screen.getByRole('button', { name: 'Update' }))
=======
  it('resets other fields on change', async () => {
    const clientType = ClientType.VirtualWirelessClient
    renderForm(<AuthenticationMethod />, {
      initialValues: { clientType }
>>>>>>> origin/feature/ACX-21924
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

<<<<<<< HEAD
  it('retain current selected value if it is available in different clientType', async () => {
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

    const selected = AuthenticationMethod.WPA2_PERSONAL
    renderForm(field, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        configs: [{ authenticationMethod: selected }]
      },
      valuesToUpdate: {
        clientType: ClientType.VirtualClient
      }
    })
=======
  describe('reset', () => {
    const name = AuthenticationMethod.fieldName as unknown as NamePath
>>>>>>> origin/feature/ACX-21924

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
    const selected = AuthenticationMethod.WPA2_PERSONAL
    const wlanName = 'N 1'

    mockGraphqlQuery(apiUrl, 'Wlans', {
      data: { wlans: [{ name: wlanName, authMethods: [selected] }] }
    })

    renderForm(field, {
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
    expect(input.getByRole('group', { name: 'Suggested' })).toBeVisible()
    expect(input.getByRole('group', { name: 'Others' })).toBeVisible()
  })
})
