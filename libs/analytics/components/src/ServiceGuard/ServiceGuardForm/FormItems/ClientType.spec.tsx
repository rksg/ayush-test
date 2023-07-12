import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm }            from '../../__tests__/fixtures'
import {
  AuthenticationMethod as AuthenticationMethodEnum,
  ClientType as ClientTypeEnum
} from '../../types'

import { ClientType } from './ClientType'
import { Password }   from './Password'
import { RadioBand }  from './RadioBand'
import { Username }   from './Username'

jest.mock('./Password', () => ({ Password: { reset: jest.fn() } }))
jest.mock('./RadioBand', () => ({ RadioBand: { reset: jest.fn() } }))
jest.mock('./Username', () => ({ Username: { reset: jest.fn() } }))

const { click } = userEvent

describe('ClientType', () => {
  it('render field', async () => {
    const selected = ClientTypeEnum.VirtualClient
    renderForm(<ClientType />, {
      initialValues: { clientType: selected }
    })

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { checked: true })).toHaveAttribute('value', selected)
  })

  it('resets other fields on change', async () => {
    const selected = ClientTypeEnum.VirtualWirelessClient
    renderForm(<ClientType />, {
      initialValues: {
        clientType: selected,
        configs: [{ authenticationMethod: AuthenticationMethodEnum.WPA2_PERSONAL }]
      }
    })

    await click(screen.getByRole('radio', { checked: false }))

    expect(screen.getByRole('radio', { checked: true }))
      .toHaveAttribute('value', ClientTypeEnum.VirtualClient)
    expect(RadioBand.reset)
      .toHaveBeenCalledWith(expect.anything(), ClientTypeEnum.VirtualClient)
    expect(Username.reset)
      .toHaveBeenCalledWith(expect.anything(), AuthenticationMethodEnum.WPA2_PERSONAL)
    expect(Password.reset)
      .toHaveBeenCalledWith(expect.anything(), AuthenticationMethodEnum.WPA2_PERSONAL)
  })

  it('render as field summary in edit mode', async () => {
    const selected = ClientTypeEnum.VirtualWirelessClient
    renderForm(<ClientType />, {
      editMode: true,
      initialValues: { clientType: selected }
    })

    expect(screen.getByText('Virtual Wireless Client')).toBeVisible()
  })
})
