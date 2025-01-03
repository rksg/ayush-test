import React from 'react'

import { screen, fireEvent, waitFor } from '@testing-library/react'
import { Form }                       from 'antd'
import { rest }                       from 'msw'

import { Persona, PersonaUrls }           from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
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
  const mockOnChange = jest.fn()
  jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
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
          <Form.Item name='identityId'>
            <IdentitySelector identityGroupId='group-1' readonly={true} />
          </Form.Item>
        </Form>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('renders readonly view with placeholder if no identity', async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaById.url,
        (req, res, ctx) => res(ctx.status(404))
      )
    )

    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <IdentitySelector
            value='1'
            identityGroupId='group-1'
            readonly={true}
          />
        </Form>
      </Provider>
    )

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

    expect(screen.getByPlaceholderText('Select Identity')).toBeInTheDocument()
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

    fireEvent.click(screen.getByPlaceholderText('Select Identity'))

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
            onChange={mockOnChange}
          />
        </Form>
      </Provider>
    )

    fireEvent.click(screen.getByPlaceholderText('Select Identity'))

    expect(screen.getByTestId('select-persona-drawer')).toBeInTheDocument()
    // Simulate submitting the drawer
    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    // Assert the state and form updates
    expect(mockOnChange).toHaveBeenCalledWith('123') // ID passed from the mocked persona
    expect(screen.getByPlaceholderText('Select Identity')).toHaveValue('Test User')
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
            onChange={mockOnChange}
          />
        </Form>
      </Provider>
    )

    // Open the SelectPersonaDrawer
    fireEvent.click(screen.getByPlaceholderText('Select Identity'))
    expect(screen.getByTestId('select-persona-drawer')).toBeInTheDocument()

    // Simulate clicking the cancel button in the drawer
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // Verify that the drawer is no longer in the document
    expect(
      screen.queryByTestId('select-persona-drawer')
    ).not.toBeInTheDocument()

    // Ensure onChange is not called
    expect(mockOnChange).not.toHaveBeenCalled()
  })
})
