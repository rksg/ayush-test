import { screen, fireEvent, waitFor } from '@testing-library/react'
import { Form }                       from 'antd'
import { rest }                       from 'msw'

import { personaApi }                     from '@acx-ui/rc/services'
import { Persona, PersonaUrls }           from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import { mockServer, render, renderHook } from '@acx-ui/test-utils'

import { IdentitySelector } from './index'

const mockPersona = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
  groupId: 'group-id-1',
  revoked: false
}

jest.mock('./SelectPersonaDrawer', () => ({
  SelectPersonaDrawer: ({ onCancel, onSubmit }: {
    identityGroupId?: string,
    identityId?: string,
    onSubmit?: (persona?: Persona) => void,
    onCancel?: () => void
  }) => {
    return (
      <div role='dialog' data-testid='select-persona-drawer'>
        <button onClick={() => onSubmit?.(mockPersona)}>
          Submit
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }
}))

describe('IdentitySelector', () => {
  const identityId = 'persona-id-1'
  beforeEach(() => {
    jest.clearAllMocks()
    store.dispatch(personaApi.util.resetApiState())
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaById.url,
        (req, res, ctx) => res(ctx.json({
          id: identityId,
          name: 'John Doe',
          groupId: 'group-id-1',
          revoked: false
        }))
      )
    )
  })

  it('renders readonly view with identity details', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldValue('identityId', identityId)
      return form
    })

    render(
      <Provider>
        <Form
          form={formRef.current}
          initialValues={{ identityId: identityId }}
        >
          <IdentitySelector identityGroupId='group-1' readonly={true} />
        </Form>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('renders readonly view with placeholder if no identity', async () => {
    const mockedApiFn = jest.fn()
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaById.url,
        (_, res, ctx) => {
          mockedApiFn()
          return res(ctx.status(404))
        }
      )
    )

    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldValue('identityId', identityId)
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <IdentitySelector
            identityGroupId='group-1'
            readonly={true}
          />
        </Form>
      </Provider>
    )

    await waitFor(() => expect(mockedApiFn).toHaveBeenCalled())
    await waitFor(() => {
      expect(screen.getByText('Identity not found')).toBeInTheDocument()
    })
  })

  it('renders Select component in editable mode', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <IdentitySelector
            identityGroupId='group-1'
            readonly={false}
          />
        </Form>
      </Provider>
    )

    expect(screen.getByTestId('identity-selector')).toBeInTheDocument()
  })

  it('opens SelectPersonaDrawer when Select is clicked', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <IdentitySelector
            identityGroupId='group-1'
            readonly={false}
          />
        </Form>
      </Provider>
    )

    fireEvent.click(screen.getByTestId('identity-selector'))

    expect(screen.getByTestId('select-persona-drawer')).toBeInTheDocument()
  })

  it('calls onChange and updates form field when identity is selected', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <IdentitySelector
            identityGroupId='group-1'
            readonly={false}
          />
        </Form>
      </Provider>
    )

    fireEvent.click(screen.getByTestId('identity-selector'))

    expect(screen.getByTestId('select-persona-drawer')).toBeInTheDocument()
    // Simulate submitting the drawer
    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    // Assert the state and form updates.
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('closes the SelectPersonaDrawer without changes when canceled', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <IdentitySelector
            identityGroupId='group-1'
            readonly={false}
          />
        </Form>
      </Provider>
    )

    // Open the SelectPersonaDrawer
    fireEvent.click(screen.getByTestId('identity-selector'))
    expect(screen.getByTestId('select-persona-drawer')).toBeInTheDocument()

    // Simulate clicking the cancel button in the drawer
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // Verify that the drawer is no longer in the document
    expect(
      screen.queryByTestId('select-persona-drawer')
    ).not.toBeInTheDocument()

    // Ensure onChange is not called
    expect(screen.getByText('Add Identity')).toBeInTheDocument()
  })
})
