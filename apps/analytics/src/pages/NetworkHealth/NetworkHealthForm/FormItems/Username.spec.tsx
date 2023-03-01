import userEvent    from '@testing-library/user-event'
import { NamePath } from 'antd/es/form/interface'

import { screen, within } from '@acx-ui/test-utils'

import { renderForm, renderFormHook } from '../../__tests__/fixtures'
import { AuthenticationMethod, Band } from '../../types'

import { Username } from './Username'

const { click, type } = userEvent

describe('Username', () => {
  it('renders field based on selected authentication method', async () => {
    renderForm(<Username />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })

    expect(within(screen.getByTestId('field')).getByRole('textbox')).toBeVisible()
  })

  it('renders null for authentication method not needing username', async () => {
    renderForm(<Username />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.OPEN_AUTH }]
      }
    })

    expect(screen.getByTestId('field')).toBeEmptyDOMElement()
  })

  it('invalidate field if left empty', async () => {
    renderForm(<Username />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })

    await click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('resets value when authentication method chosen do not need username', async () => {
    const value = 'username'
    renderForm(<Username />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      },
      valuesToUpdate: {
        configs: [{
          radio: Band.Band2_4,
          speedTestEnabled: false,
          authenticationMethod: AuthenticationMethod.OPEN_AUTH
        }]
      }
    })

    const field = within(screen.getByTestId('field')).getByRole('textbox')
    await type(field, value)

    const submit = screen.getByRole('button', { name: 'Submit' })

    await click(submit)
    expect(await screen.findByTestId('form-values')).toHaveTextContent(value)

    await click(screen.getByRole('button', { name: 'Update' }))
    await click(submit)

    expect(await screen.findByTestId('form-values')).not.toHaveTextContent(value)
  })

  describe('reset', () => {
    const name = Username.fieldName as unknown as NamePath

    it('resets to undefined if field not needed', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, 'some-username')
      Username.reset(form, AuthenticationMethod.OPEN_AUTH)
      expect(form.getFieldValue(name)).toEqual(undefined)
    })

    it('does not reset', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, 'some-username')
      Username.reset(form, AuthenticationMethod.WPA2_ENTERPRISE)
      expect(form.getFieldValue(name)).toEqual('some-username')
    })
  })
})

describe('Username.FieldSummary', () => {
  const value = 'wifi user'
  it('renders if selected auth method requires this field', async () => {
    renderForm(<Username.FieldSummary />, {
      initialValues: {
        configs: [{
          authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE,
          wlanUsername: value
        }]
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent(value)
  })

  it('hidden if selected auth method not require this field', async () => {
    renderForm(<Username.FieldSummary />, {
      initialValues: {
        configs: [{
          authenticationMethod: AuthenticationMethod.OPEN_AUTH,
          wlanUsername: value
        }]
      }
    })

    expect(screen.getByTestId('field')).toBeEmptyDOMElement()
  })
})
