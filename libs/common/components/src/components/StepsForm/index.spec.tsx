import React from 'react'

import '@testing-library/jest-dom'
import { Form, Input, Radio, RadioChangeEvent } from 'antd'

import { cleanup, fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { StepsForm, StepsFormInstance, StepsFormProps } from './index'

describe('StepsForm', () => {
  const CustomForm: React.FC<StepsFormProps> = (props) => (
    <StepsForm {...props}>
      <StepsForm.StepForm title='Step 1'>
        <StepsForm.Title>Step 1 Title</StepsForm.Title>
        <Form.Item name='field1' label='Field 1'>
          <Input />
        </Form.Item>
      </StepsForm.StepForm>
      <StepsForm.StepForm title='Step 2'>
        <StepsForm.Title>Step 2 Title</StepsForm.Title>
        <Form.Item name='field2' label='Field 2'>
          <Input />
        </Form.Item>
      </StepsForm.StepForm>
    </StepsForm>
  )

  it('renders steps form', async () => {
    const onFinish = jest.fn()
    render(<CustomForm onFinish={onFinish} />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(onFinish).toHaveBeenCalled())
  })

  it('handles proceed to next step and cancel', async () => {
    const onCurrentChange = jest.fn()
    const onCancel = jest.fn()

    render(<CustomForm {...{ onCurrentChange, onCancel }} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await waitFor(() => expect(onCurrentChange).toHaveBeenCalled())

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onCancel).toHaveBeenCalled())

    cleanup()

    render(<CustomForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('handles navigate to past step', async () => {
    render(<CustomForm />)

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()

    fireEvent.click(await screen.findByText('Step 1'))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
  })

  it('handles navigate to any step in editMode', async () => {
    render(<CustomForm editMode />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    fireEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()

    cleanup()

    render(<CustomForm />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    fireEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
  })

  it('allow update form title in runtime', async () => {
    const Component: React.FC = () => {
      const ref = React.useRef<StepsFormInstance>()
      const [type, setType] = React.useState('item-a')
      const title = type === 'item-a' ? 'Step 2a' : 'Step 2b'

      return (
        <StepsForm formRef={ref}>
          <StepsForm.StepForm title='Step 1'>
            <StepsForm.Title>Step 1 Title</StepsForm.Title>
            <Form.Item name='field1' label='Field 1'>
              <Radio.Group
                onChange={(e: RadioChangeEvent) => setType(e.target.value.toString())}>
                <Radio value='item-a'>Use Step 2a</Radio>
                <Radio value='item-b'>Use Step 2b</Radio>
              </Radio.Group>
            </Form.Item>
          </StepsForm.StepForm>
          <StepsForm.StepForm title={title}>
            <StepsForm.Title>Step 2 Title</StepsForm.Title>
            <Form.Item name='field2' label='Field 2'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      )
    }

    render(<Component />)

    expect(await screen.findByText('Step 2a')).toBeVisible()
    fireEvent.click(screen.getByRole('radio', { name: 'Use Step 2b' }))

    expect(await screen.findByText('Step 2b')).toBeVisible()
  })

  it('supports dynamically add/remove steps', async () => {
    const Component: React.FC = () => {
      const ref = React.useRef<StepsFormInstance>()
      const [state, setState] = React.useState(false)

      return (
        <StepsForm formRef={ref}>
          <StepsForm.StepForm title='Step 1'>
            <StepsForm.Title>Step 1 Title</StepsForm.Title>
            <button type='button' onClick={() => setState(!state)}>Toggle</button>
          </StepsForm.StepForm>
          {state ? <StepsForm.StepForm title='Step 2'>
            <StepsForm.Title>Step 2 Title</StepsForm.Title>
          </StepsForm.StepForm> : null}
          <StepsForm.StepForm title='Step 3'>
            <StepsForm.Title>Step 3 Title</StepsForm.Title>
          </StepsForm.StepForm>
          {state ? <StepsForm.StepForm title='Step 4'>
            <StepsForm.Title>Step 4 Title</StepsForm.Title>
          </StepsForm.StepForm> : null}
        </StepsForm>
      )
    }

    const { container } = render(<Component />)

    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(4)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(2)
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  })
})
