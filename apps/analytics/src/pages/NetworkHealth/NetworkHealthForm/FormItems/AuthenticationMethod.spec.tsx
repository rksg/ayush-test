import userEvent from '@testing-library/user-event'

import {
  networkHealthApi as api,
  networkHealthApiURL as apiUrl
} from '@acx-ui/analytics/services'
import { store }                                 from '@acx-ui/store'
import { act, mockGraphqlQuery, screen, within } from '@acx-ui/test-utils'

import { renderForm }                       from '../../__tests__/fixtures'
import { authMethodsByClientType }          from '../../authMethods'
import { ClientType, AuthenticationMethod } from '../../types'

import { AuthenticationMethod as Input } from './AuthenticationMethod'

const { click } = userEvent
const field = <Input />

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, onChange?: (value: string) => void }>) => {
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

describe('AuthenticationMethod', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('handle virtual-client', async () => {
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

    const clientType = ClientType.VirtualClient
    renderForm(field, {
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
    renderForm(field, {
      initialValues: { clientType }
    })

    const dropdown = await screen.findByRole('combobox')
    const options = await within(dropdown).findAllByRole('option')

    const expected = authMethodsByClientType[clientType].map(method => method.code)
    const result = options.map((el) => (el as HTMLOptionElement).value).filter(Boolean)
    expect(result).toEqual(expected)
  })

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
    })

    expect(screen.getByRole('combobox')).toHaveValue('')
  })

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

    expect(await screen.findByRole('combobox')).toHaveValue(selected)

    // prevent warning thrown
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await click(screen.getByRole('button', { name: 'Update' }))
    })

    expect(screen.getByRole('combobox')).toHaveValue(selected)
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
