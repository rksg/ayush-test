import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm }           from '../../__tests__/fixtures'
import { AuthenticationMethod } from '../../types'

import { Username } from './Username'

const { click } = userEvent

describe('Username', () => {
  it('renders field based on selected authentication method', async () => {
    renderForm(<Username />, {
      initialValues: {
        authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE
      }
    })

    expect(screen.getByRole('textbox')).toBeVisible()
  })

  it('renders null for authentication method not needing username', async () => {
    renderForm(<Username />, {
      initialValues: {
        authenticationMethod: AuthenticationMethod.OPEN_AUTH
      }
    })

    expect(screen.getByTestId('field')).toBeEmptyDOMElement()
  })

  it('invalidate field if left empty', async () => {
    renderForm(<Username />, {
      initialValues: {
        authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE
      }
    })

    await click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('resets value when authentication method chosen do not need username', async () => {
    const value = 'username'
    renderForm(<Username />, {
      initialValues: {
        authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE,
        wlanUsername: value
      },
      valuesToUpdate: {
        authenticationMethod: AuthenticationMethod.OPEN_AUTH
      }
    })

    const submit = screen.getByRole('button', { name: 'Submit' })

    await click(submit)
    expect(await screen.findByTestId('form-values')).toHaveTextContent(value)

    await click(screen.getByRole('button', { name: 'Update' }))
    await click(submit)

    expect(await screen.findByTestId('form-values')).not.toHaveTextContent(value)
  })
})

describe('Username.FieldSummary', () => {
  const value = 'wifi user'
  it('renders if selected auth method requires this field', async () => {
    renderForm(<Username.FieldSummary />, {
      initialValues: {
        authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE,
        wlanUsername: value
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent(value)
  })

  it('hidden if selected auth method not require this field', async () => {
    renderForm(<Username.FieldSummary />, {
      initialValues: {
        authenticationMethod: AuthenticationMethod.OPEN_AUTH,
        wlanUsername: value
      }
    })

    expect(screen.getByTestId('field')).toBeEmptyDOMElement()
  })
})
