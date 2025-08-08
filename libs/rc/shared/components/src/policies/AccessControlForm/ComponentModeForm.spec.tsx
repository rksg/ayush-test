import React from 'react'

import { Form } from 'antd'

import { render, renderHook, screen, fireEvent } from '@acx-ui/test-utils'

import { ComponentModeForm, ComponentModeFormProps } from './ComponentModeForm'

describe('ComponentModeForm renders correctly', () => {
  const mockHandleContentClose = jest.fn()
  const mockHandleContentFinish = jest.fn()

  const defaultProps: ComponentModeFormProps = {
    pageTitle: 'ComponentPageTitle',
    breadcrumb: [
      { text: 'a', link: '/a' },
      { text: 'b', link: '/b' },
      { text: 'c' }
    ],
    form: undefined,
    editMode: false,
    content: <div data-testid='test-content'>
      <div>Test Content</div>
      <button data-testid='cancel-button' onClick={mockHandleContentClose}>Cancel</button>
      <button data-testid='finish-button' onClick={mockHandleContentFinish}>Finish</button>
    </div>,
    handleContentClose: mockHandleContentClose,
    handleContentFinish: mockHandleContentFinish
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle cancel button click', () => {
    render(<Form><ComponentModeForm {...defaultProps} /></Form>, {
      route: {
        params: { tenantId: 'tenantId1' }
      }
    })

    const cancelButton = screen.getByTestId('cancel-button')
    fireEvent.click(cancelButton)

    expect(mockHandleContentClose).toHaveBeenCalledTimes(1)
  })

  it('should handle finish button click', () => {
    render(<Form><ComponentModeForm {...defaultProps} /></Form>, {
      route: {
        params: { tenantId: 'tenantId1' }
      }
    })

    const finishButton = screen.getByTestId('finish-button')
    fireEvent.click(finishButton)

    expect(mockHandleContentFinish).toHaveBeenCalledTimes(1)
  })

  it('should pass form instance to StepsForm', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    const propsWithForm = {
      ...defaultProps,
      form: formRef.current
    }

    render(<Form><ComponentModeForm {...propsWithForm} /></Form>, {
      route: {
        params: { tenantId: 'tenantId1' }
      }
    })
    expect(screen.getByTestId('steps-form')).toBeInTheDocument()
  })
})
