import userEvent    from '@testing-library/user-event'
import { NamePath } from 'antd/es/form/interface'

import { cleanup, screen } from '@acx-ui/test-utils'

import { renderForm, renderFormHook } from '../../__tests__/fixtures'
import { AuthenticationMethod }       from '../../types'

import { Password } from './Password'

const { click } = userEvent
const codeField = 'authenticationMethod'

describe('Password', () => {
  it(`render empty if ${codeField} not set`, async () => {
    renderForm(<Password />)
    expect(screen.getByTestId('field')).toBeEmptyDOMElement()
  })

  it('render field', async () => {
    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_PERSONAL }]
      }
    })
    expect(await screen.findByText('Using configured password')).toBeVisible()
    cleanup()

    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA3_PERSONAL }]
      }
    })
    expect(await screen.findByText('Using configured password')).toBeVisible()
    cleanup()

    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_WPA3_PERSONAL }]
      }
    })
    expect(await screen.findByText('Using configured password')).toBeVisible()
    cleanup()

    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })
    const field = await screen.findByLabelText('Password')
    expect(field).toBeVisible()
    expect(field).toHaveAttribute('type', 'password')
  })

  it('invalidate field if not preconfigured', async () => {
    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })
    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter Password')
  })

  it('valid if not preconfigured but in edit mode', async () => {
    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_PERSONAL }]
      }
    })
    await click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('heading', { name: 'Valid' })).toBeVisible()
  })

  it('show correct placeholder if preconfigured', async () => {
    renderForm(<Password />, {
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_PERSONAL }]
      }
    })
    expect(await screen.findByText('Using configured password')).toBeVisible()
  })

  it('show correct placeholder if previous not preconfigured but in edit mode', async () => {
    renderForm(<Password />, {
      editMode: true,
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })
    const field = await screen.findByLabelText('Password')
    expect(field).toHaveAttribute('placeholder', 'Leave blank to remain unchanged')
  })

  it('not show placeholder previous preconfigured, but current not in edit mode - 1', async () => {
    renderForm(<Password />, {
      editMode: true,
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_PERSONAL }]
      },
      valuesToUpdate: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })

    expect(await screen.findByText('Using configured password')).toBeVisible()

    await click(screen.getByRole('button', { name: 'Update' }))

    const field = await screen.findByLabelText('Password')
    expect(field).not.toHaveAttribute('placeholder')
  })

  it('not show placeholder previous preconfigured, but current not in edit mode - 2', async () => {
    renderForm(<Password />, {
      editMode: true,
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.OPEN_AUTH }]
      },
      valuesToUpdate: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      }
    })

    expect(screen.getByTestId('field')).toBeEmptyDOMElement()

    await click(screen.getByRole('button', { name: 'Update' }))

    const field = await screen.findByLabelText('Password')
    expect(field).not.toHaveAttribute('placeholder')
  })

  it('resets value when authentication method chosen do not need password', async () => {
    renderForm(<Password />, {
      editMode: true,
      initialValues: {
        configs: [{ authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE }]
      },
      valuesToUpdate: {
        configs: [{ authenticationMethod: AuthenticationMethod.OPEN_AUTH }]
      }
    })

    expect(await screen.findByLabelText('Password')).toBeVisible()

    await click(screen.getByRole('button', { name: 'Update' }))

    expect(screen.getByTestId('field')).toBeEmptyDOMElement()
  })

  describe('reset', () => {
    const name = Password.fieldName as unknown as NamePath

    it('resets to undefined if field not needed', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, 'some-password')
      Password.reset(form, AuthenticationMethod.OPEN_AUTH)
      expect(form.getFieldValue(name)).toEqual(undefined)
    })

    it('resets to undefined if preconfigured', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, 'some-password')
      Password.reset(form, AuthenticationMethod.WPA2_PERSONAL)
      expect(form.getFieldValue(name)).toEqual(undefined)
    })

    it('does not reset', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, 'some-password')
      Password.reset(form, AuthenticationMethod.WPA2_ENTERPRISE)
      expect(form.getFieldValue(name)).toEqual('some-password')
    })
  })
})

describe('Password.FieldSummary', () => {
  const value = '12345'
  it('renders if selected auth method requires this field', async () => {
    renderForm(<Password.FieldSummary />, {
      initialValues: {
        configs: [{
          authenticationMethod: AuthenticationMethod.WPA2_ENTERPRISE,
          wlanPassword: value
        }]
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent('*'.repeat(value.length))
  })

  it('hidden if selected auth method not require this field', async () => {
    renderForm(<Password.FieldSummary />, {
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
