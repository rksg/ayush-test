import React from 'react'

import '@testing-library/jest-dom'
import userEvent                                from '@testing-library/user-event'
import { Form, Input, Radio, RadioChangeEvent } from 'antd'

import { cleanup, render, screen, waitFor } from '@acx-ui/test-utils'

import { StepsFormLegacy, StepsFormLegacyInstance, StepsFormLegacyProps } from './index'

describe('StepsFormLegacy', () => {
  const CustomForm: React.FC<StepsFormLegacyProps> = (props) => (
    <StepsFormLegacy {...props}>
      <StepsFormLegacy.StepForm title='Step 1'>
        <StepsFormLegacy.Title>Step 1 Title</StepsFormLegacy.Title>
        <Form.Item name='field1' label='Field 1'>
          <Input />
        </Form.Item>
      </StepsFormLegacy.StepForm>
      <StepsFormLegacy.StepForm title='Step 2'>
        <StepsFormLegacy.Title>Step 2 Title</StepsFormLegacy.Title>
        <Form.Item name='field2' label='Field 2'>
          <Input />
        </Form.Item>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )

  it('renders steps form', async () => {
    const onFinish = jest.fn()
    render(<CustomForm onFinish={onFinish} />)

    expect(screen.getAllByRole('button').length).toEqual(3)
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()

    await waitFor(() => expect(onFinish).toHaveBeenCalled())
  })

  it('handles proceed to next step and cancel', async () => {
    const onCurrentChange = jest.fn()
    const onCancel = jest.fn()

    render(<CustomForm {...{ onCurrentChange, onCancel }} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await waitFor(() => expect(onCurrentChange).toHaveBeenCalled())

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onCancel).toHaveBeenCalled())

    cleanup()

    render(<CustomForm />)

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('handles navigate to past step', async () => {
    render(<CustomForm />)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()

    await userEvent.click(await screen.findByText('Step 1'))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
  })

  // TODO: remove skip when ACX-13452 is fixed by moving to StepsForm
  it.skip('handles navigate to any step in editMode', async () => {
    render(<CustomForm editMode />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()

    cleanup()

    render(<CustomForm />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
  })

  it('allow update form title in runtime', async () => {
    const Component: React.FC = () => {
      const ref = React.useRef<StepsFormLegacyInstance>()
      const [type, setType] = React.useState('item-a')
      const title = type === 'item-a' ? 'Step 2a' : 'Step 2b'

      return (
        <StepsFormLegacy formRef={ref}>
          <StepsFormLegacy.StepForm title='Step 1'>
            <StepsFormLegacy.Title>Step 1 Title</StepsFormLegacy.Title>
            <Form.Item name='field1' label='Field 1'>
              <Radio.Group
                onChange={(e: RadioChangeEvent) => setType(e.target.value.toString())}>
                <Radio value='item-a'>Use Step 2a</Radio>
                <Radio value='item-b'>Use Step 2b</Radio>
              </Radio.Group>
            </Form.Item>
          </StepsFormLegacy.StepForm>
          <StepsFormLegacy.StepForm title={title}>
            <StepsFormLegacy.Title>Step 2 Title</StepsFormLegacy.Title>
            <Form.Item name='field2' label='Field 2'>
              <Input />
            </Form.Item>
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      )
    }

    render(<Component />)

    expect(await screen.findByText('Step 2a')).toBeVisible()
    await userEvent.click(screen.getByRole('radio', { name: 'Use Step 2b' }))

    expect(await screen.findByText('Step 2b')).toBeVisible()
  })

  it('supports dynamically add/remove steps', async () => {
    const Component: React.FC = () => {
      const ref = React.useRef<StepsFormLegacyInstance>()
      const [state, setState] = React.useState(false)

      return (
        <StepsFormLegacy formRef={ref}>
          <StepsFormLegacy.StepForm title='Step 1'>
            <StepsFormLegacy.Title>Step 1 Title</StepsFormLegacy.Title>
            <button type='button' onClick={() => setState(!state)}>Toggle</button>
          </StepsFormLegacy.StepForm>
          {state ? <StepsFormLegacy.StepForm title='Step 2'>
            <StepsFormLegacy.Title>Step 2 Title</StepsFormLegacy.Title>
          </StepsFormLegacy.StepForm> : null}
          <StepsFormLegacy.StepForm title='Step 3'>
            <StepsFormLegacy.Title>Step 3 Title</StepsFormLegacy.Title>
          </StepsFormLegacy.StepForm>
          {state ? <StepsFormLegacy.StepForm title='Step 4'>
            <StepsFormLegacy.Title>Step 4 Title</StepsFormLegacy.Title>
          </StepsFormLegacy.StepForm> : null}
        </StepsFormLegacy>
      )
    }

    const { container } = render(<Component />)

    /* eslint-disable testing-library/no-container, testing-library/no-node-access */
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(2)

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(4)

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(2)
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  })

  it('renders single step form', async () => {
    const onFinish = jest.fn()
    const Component: React.FC = () => (
      <StepsFormLegacy onFinish={onFinish}>
        <StepsFormLegacy.StepForm>
          <Form.Item name='field1' label='Field 1'>
            <Input />
          </Form.Item>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    )
    render(<Component />)

    expect(screen.getAllByRole('button').length).toEqual(2)

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
  })
})
