import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Form }                           from 'antd'

import { FormValidationItem } from '.'

jest.mock('@acx-ui/icons', () => ({
  LoadingSolid: () => <div data-testid='loading-solid' />,
  SuccessSolid: () => <div data-testid='success-solid' />
}), { virtual: true })

describe('Form With Validation Item', () => {
  const mockRemoteValidation = (isValid) => {
    return {
      queryResult: [],
      message: 'error message',
      isValidating: false,
      validator: jest.fn().mockReturnValue(isValid),
      updateQuery: jest.fn()
    }
  }

  const onBlur = (input) => {
    input.focus()
    input.blur()
  }

  it('should render Validation Item', async () => {
    const remote = mockRemoteValidation(true)
    render(
      <Form>
        <FormValidationItem
          name='test'
          label='name'
          rules={[
            { required: true }
          ]}
          value='error'
          remoteValidation={remote}
        />
      </Form>)
    const inputNode = screen.getByLabelText('name', { selector: 'input' })
    expect(inputNode).not.toBeNull()
  })

  it('should render Validation Item with loading icon when typing a new string', async () => {
    const remote = mockRemoteValidation(true)
    render(
      <Form>
        <FormValidationItem
          name='test'
          label='name'
          rules={[
            { required: true }
          ]}
          value=''
          remoteValidation={remote}
        />
      </Form>)

    const inputNode = screen.getByLabelText('name', { selector: 'input' })
    await fireEvent.change(inputNode, { target: { value: 'test loading' } })
    await act(async () => {
      onBlur(inputNode)
    })
    await screen.findByTestId('loading-solid')
    expect(inputNode).toHaveValue('test loading')
    expect(remote.updateQuery).toHaveBeenCalled()
  })

  it('should render Validation Item with success icon when validation success', async () => {
    const remote = mockRemoteValidation(true)
    render(
      <Form>
        <FormValidationItem
          name='test'
          label='name'
          rules={[
            { required: true }
          ]}
          value='text'
          remoteValidation={remote}
        />
      </Form>)

    const inputNode = screen.getByLabelText('name', { selector: 'input' })
    await fireEvent.change(inputNode, { target: { value: 'text' } })
    await act(async () => {
      onBlur(inputNode)
    })
    await screen.findByTestId('success-solid')
    expect(remote.validator).toHaveBeenCalled()
  })

  it('should render Validation Item with error status when validation fails', async () => {
    const remote = mockRemoteValidation(false)
    render(
      <Form>
        <FormValidationItem
          name='test'
          label='name'
          rules={[
            { required: true }
          ]}
          value='error'
          remoteValidation={remote}
        />
      </Form>)

    const inputNode = screen.getByLabelText('name', { selector: 'input' })
    await fireEvent.change(inputNode, { target: { value: 'error' } })
    await act(async () => {
      onBlur(inputNode)
    })
    const alert = await screen.findByRole('alert')
    expect(remote.validator).toHaveBeenCalled()
    expect(alert).toHaveTextContent('error message')
  })
})