import userEvent from '@testing-library/user-event'

import { act, screen, within } from '@acx-ui/test-utils'

import { renderForm }                       from '../../__tests__/fixtures'
import { authMethodsByClientType }          from '../../authMethods'
import { ClientType, AuthenticationMethod } from '../../types'

import { AuthenticationMethod as Input } from './AuthenticationMethod'

const { click } = userEvent
const field = <Input />

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, ...props }: React.PropsWithChildren) => (
    <select {...props}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('AuthenticationMethod', () => {
  it('handle virtual-client', async () => {
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
    const selected = AuthenticationMethod.WPA3_PERSONAL
    renderForm(field, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        authenticationMethod: selected
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
    const selected = AuthenticationMethod.WPA2_PERSONAL
    renderForm(field, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        authenticationMethod: selected
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
})
