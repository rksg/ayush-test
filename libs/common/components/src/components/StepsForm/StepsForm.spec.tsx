import React, { useEffect, useState } from 'react'

import userEvent                          from '@testing-library/user-event'
import { Form, Input, Radio, Typography } from 'antd'

import { cleanup, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import {
  createStepsFormContext,
  FieldSummaryProps,
  StepsForm
} from './StepsForm'
import { StepsFormProps }             from './types'
import { isStepsFormBackStepClicked } from './utils'

const StepFormContext = createStepsFormContext()

describe('StepsForm', () => {
  const CustomForm: React.FC<Omit<StepsFormProps, 'children'>> = (props) => (
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

    const actions = screen.getByTestId('steps-form-actions')

    expect(within(actions).getAllByRole('button').length).toEqual(2)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()

    await waitFor(() => expect(onFinish).toHaveBeenCalled())
  })

  it('handles proceed to next step and cancel', async () => {
    const onCancel = jest.fn()

    render(<CustomForm {...{ onCancel }} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
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

    await userEvent.click(await screen.findByRole('button', { name: 'Step 1' }))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()

    cleanup()

    render(<CustomForm />)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
  })

  it('handles navigate to any step in editMode', async () => {
    render(<CustomForm editMode />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()

    cleanup()

    render(<CustomForm />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
  })

  it('handles apply in editMode', async () => {
    const onFinish = jest.fn()
    render(<CustomForm editMode onFinish={onFinish} />)
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
  })

  it('allow update form title in runtime', async () => {
    const Component: React.FC = () => {
      const [form] = Form.useForm()
      const type = Form.useWatch('field1', form)
      const title = type === 'item-a' ? 'Step 2a' : 'Step 2b'

      return (
        <StepsForm form={form} initialValues={{ field1: 'item-a' }}>
          <StepsForm.StepForm title='Step 1'>
            <StepsForm.Title>Step 1 Title</StepsForm.Title>
            <Form.Item name='field1' label='Field 1'>
              <Radio.Group>
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
    await userEvent.click(screen.getByRole('radio', { name: 'Use Step 2b' }))

    expect(await screen.findByText('Step 2b')).toBeVisible()
  })

  it('supports dynamically add/remove steps', async () => {
    const Component: React.FC = () => {
      const [state, setState] = React.useState(false)

      return (
        <StepsForm>
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

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(4)

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(container.querySelectorAll('.ant-steps-item')).toHaveLength(2)
    /* eslint-enable testing-library/no-container, testing-library/no-node-access */
  })

  it('renders single step form', async () => {
    const onFinish = jest.fn()
    const Component: React.FC = () => (
      <StepsForm onFinish={onFinish}>
        <StepsForm.StepForm>
          <Form.Item name='field1' label='Field 1'>
            <Input />
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
    )
    render(<Component />)

    expect(screen.getAllByRole('button').length).toEqual(2)

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(onFinish).toHaveBeenCalled())
  })

  it('supports custom labels', async () => {
    render(<CustomForm buttonLabel={{
      pre: 'Before',
      next: 'After',
      submit: 'Done',
      cancel: 'Kill'
    }} />)

    expect(screen.getByRole('button', { name: 'Kill' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'After' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'After' }))
    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Done' })).toBeVisible()
  })

  it('should not display submit button when label is empty value', async () => {
    render(<CustomForm buttonLabel={{
      pre: 'Before',
      next: 'After',
      cancel: 'Kill',
      submit: ''
    }} />)
    expect(screen.getAllByRole('button').length).toBe(2)
  })

  it('should not display apply button when label is empty value in editMode', async () => {
    render(<CustomForm
      editMode
      buttonLabel={{
        pre: 'Before',
        next: 'After',
        cancel: 'CacnelAction',
        apply: ''
      }} />)

    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'CacnelAction' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'After' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Apply' })).toBeNull()
  })

  it.skip('prevent navigate to other steps when field invalid', async () => {
    render(
      <StepsForm editMode>
        <StepsForm.StepForm title='Step 1'>
          <StepsForm.Title>Step 1</StepsForm.Title>
          <Form.Item
            name='field1'
            label='Field 1'
            rules={[{ required: true }]}
            children={<Input />}
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Step 2'>
          <StepsForm.Title>Step 2</StepsForm.Title>
          <Form.Item
            name='field2'
            label='Field 2'
            rules={[{ required: true }]}
            children={<Input />}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Step 2' }))
    expect(screen.getByRole('heading', { name: 'Step 1' })).toBeVisible()

    const error1 = await screen.findByRole('alert')
    expect(error1).toBeVisible()
    await userEvent.type(screen.getByRole('textbox', { name: 'Field 1' }), 'value')
    await userEvent.tab()
    await waitForElementToBeRemoved(error1)

    await userEvent.click(screen.getByRole('button', { name: 'Step 2' }))
    expect(screen.getByRole('heading', { name: 'Step 2' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Step 1' }))
    expect(screen.getByRole('heading', { name: 'Step 2' })).toBeVisible()

    const error2 = await screen.findByRole('alert')
    expect(error2).toBeVisible()
    await userEvent.type(screen.getByRole('textbox', { name: 'Field 2' }), 'value')
    await userEvent.tab()
    await waitForElementToBeRemoved(error2)
  })

  it('allow navigate back without trigger validate in non edit mode', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm title='Step 1'>
          <StepsForm.Title>Step 1</StepsForm.Title>
          <Form.Item
            name='field1'
            label='Field 1'
            children={<Input />}
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Step 2'>
          <StepsForm.Title>Step 2</StepsForm.Title>
          <Form.Item
            name='field2'
            label='Field 2'
            rules={[{ required: true }]}
            children={<Input />}
          />
        </StepsForm.StepForm>
      </StepsForm>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Step 2' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByRole('alert')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'Step 1' })).toBeVisible()
  })

  it('supports onFinish on individual step', async () => {
    const onFinish = jest.fn()
    const onFinish1 = jest.fn().mockResolvedValue(true)
    const onFinish2 = jest.fn().mockResolvedValue(false)
    const Component = () => {
      const [done1, setDone1] = React.useState(false)
      const [done2, setDone2] = React.useState(false)
      return <>
        {done1 ? <h1>Done 1</h1> : null}
        {done2 ? <h1>Done 2</h1> : null}
        <StepsForm onFinish={async () => {
          await onFinish()
          setDone2(true)
        }}>
          <StepsForm.StepForm title='Step 1' onFinish={onFinish1}>
            <StepsForm.Title>Step 1</StepsForm.Title>
            <Form.Item
              name='field1'
              label='Field 1'
              rules={[{ required: true }]}
              children={<Input />}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title='Step 2'
            onFinish={async (values) => {
              await onFinish2(values)
              setDone1(true)
              return false
            }}>
            <StepsForm.Title>Step 2</StepsForm.Title>
            <Form.Item
              name='field2'
              label='Field 2'
              rules={[{ required: true }]}
              children={<Input />}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </>
    }
    render(<Component />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Field 1' }), 'value')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Step 2' })).toBeVisible()
    expect(onFinish1.mock.calls[0][0]).toStrictEqual({ field1: 'value' })

    await userEvent.type(screen.getByRole('textbox', { name: 'Field 2' }), 'value')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByRole('heading', { name: 'Done 1' })).toBeVisible()
    expect(onFinish2.mock.calls[0][0]).toStrictEqual({ field1: 'value', field2: 'value' })

    expect(await screen.findAllByRole('heading', { name: /Done/ })).toHaveLength(1)
    expect(onFinish).not.toBeCalled()
  })

  it('supports onFinishFailed on individual step', async () => {
    const oldEnv = process.env
    jest.spyOn(console, 'log')
    // eslint-disable-next-line no-console
    const logError = jest.mocked(console.log).mockImplementation(() => {})

    const onFinish = jest.fn()
    const onFinish1 = jest.fn().mockRejectedValue(true)
    const onFinish2 = jest.fn().mockRejectedValue(true)
    const onFinishFailed = jest.fn()
    const onFinishFailed2 = jest.fn()
    const Component = () => {
      return <StepsForm onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <StepsForm.StepForm title='Step 1' onFinish={onFinish1}>
          <StepsForm.Title>Step 1</StepsForm.Title>
          <Form.Item
            name='field1'
            label='Field 1'
            rules={[{ required: true }]}
            children={<Input />}
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          title='Step 2'
          onFinish={onFinish2}
          onFinishFailed={onFinishFailed2}
        >
          <StepsForm.Title>Step 2</StepsForm.Title>
          <Form.Item
            name='field2'
            label='Field 2'
            rules={[{ required: true }]}
            children={<Input />}
          />
        </StepsForm.StepForm>
      </StepsForm>
    }
    render(<Component />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Field 1' }), 'value')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(onFinish1.mock.calls[0][0]).toStrictEqual({ field1: 'value' })
    expect(logError).toHaveBeenCalledWith(true)

    await userEvent.type(screen.getByRole('textbox', { name: 'Field 2' }), 'value')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(onFinish2.mock.calls[0][0]).toStrictEqual({ field1: 'value', field2: 'value' })
    expect(onFinishFailed2).toBeCalledWith(true)

    expect(onFinishFailed).not.toBeCalled()

    process.env = oldEnv
    jest.restoreAllMocks()
  })

  it('switches formProps based on current step formProps', async () => {
    const { asFragment } = render(
      <StepsForm editMode>
        <StepsForm.StepForm title='Step 1' layout='horizontal'>
          <StepsForm.Title>Step 1 Title</StepsForm.Title>
          <Form.Item name='field1' label='Field 1' children={<Input />} />
        </StepsForm.StepForm>
        <StepsForm.StepForm title='Step 2' layout='vertical'>
          <StepsForm.Title>Step 2</StepsForm.Title>
          <Form.Item name='field2' label='Field 2' children={<Input />} />
        </StepsForm.StepForm>
      </StepsForm>
    )
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('form.ant-form-horizontal')).not.toBeNull()

    await userEvent.click(await screen.findByText('Step 2'))
    expect(await screen.findByRole('heading', { name: 'Step 2' })).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('form.ant-form-vertical')).not.toBeNull()
  })

  it('supports custom submit button', async () => {
    const onFinish = jest.fn()
    const onStep1Finish = jest.fn().mockResolvedValue(true)
    const onStep2Finish = jest.fn().mockResolvedValue(false)
    const mockedCustomSubmitOnFinish = jest.fn().mockResolvedValue(false)
    const Component = () => {
      const [done1, setDone1] = React.useState(false)
      const [done2, setDone2] = React.useState(false)
      return <>
        {done1 ? <h1>Done 1</h1> : null}
        {done2 ? <h1>Done 2</h1> : null}
        <StepsForm
          customSubmit={{
            label: 'ApplyAndContinue',
            onCustomFinish: mockedCustomSubmitOnFinish
          }}
          onFinish={async () => {
            onFinish()
            setDone2(true)
          }}>
          <StepsForm.StepForm title='Step 1' onFinish={onStep1Finish}>
            <StepsForm.Title>Step 1</StepsForm.Title>
            <Form.Item
              name='field1'
              label='Field 1'
              rules={[{ required: true }]}
              children={<Input />}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            title='Step 2'
            onFinish={async (values) => {
              await onStep2Finish(values)
              setDone1(true)
            }}>
            <StepsForm.Title>Step 2</StepsForm.Title>
            <Form.Item
              name='field2'
              label='Field 2'
              rules={[{ required: true }]}
              children={<Input />}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </>
    }
    render(<Component />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Field 1' }), 'value')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Step 2' })).toBeVisible()
    expect(onStep1Finish.mock.calls[0][0]).toStrictEqual({ field1: 'value' })

    await userEvent.type(screen.getByRole('textbox', { name: 'Field 2' }), 'value')
    await userEvent.click(screen.getByRole('button', { name: 'ApplyAndContinue' }))

    expect(await screen.findByRole('heading', { name: 'Done 1' })).toBeVisible()
    expect(onStep2Finish.mock.calls[0][0]).toStrictEqual({ field1: 'value', field2: 'value' })

    expect(await screen.findAllByRole('heading', { name: /Done/ })).toHaveLength(1)
    expect(onFinish).not.toBeCalled()
    expect(mockedCustomSubmitOnFinish).toBeCalled()
  })

  it('should correctly recognize back step button', async () => {
    const step1OnFinishSpy = jest.fn()
    const step2OnFinishSpy = jest.fn()
    render(<StepsForm>
      <StepsForm.StepForm title='Step 1'
        onFinish={async (_, e?: React.MouseEvent) => {
          step1OnFinishSpy(isStepsFormBackStepClicked(e))
        }}>
        <StepsForm.Title>Step 1 Title</StepsForm.Title>
        <Form.Item name='field1' label='Field 1'>
          <Input />
        </Form.Item>
      </StepsForm.StepForm>
      <StepsForm.StepForm title='Step 2'
        onFinish={async (_, e?: React.MouseEvent) => {
          step2OnFinishSpy(isStepsFormBackStepClicked(e))
        }}>
        <StepsForm.Title>Step 2 Title</StepsForm.Title>
        <Form.Item name='field2' label='Field 2'>
          <Input />
        </Form.Item>
      </StepsForm.StepForm>
    </StepsForm>)

    const actions = screen.getByTestId('steps-form-actions')
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(within(actions).getByRole('button', { name: 'Next' }))
    expect(step1OnFinishSpy).toBeCalledWith(false)

    expect(await screen.findByRole('heading', { name: 'Step 2 Title' })).toBeVisible()
    await userEvent.click(within(actions).getByRole('button', { name: 'Back' }))

    expect(step2OnFinishSpy).toBeCalledWith(true)
    expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
    await userEvent.click(within(actions).getByRole('button', { name: 'Next' }))
    await userEvent.click(within(actions).getByRole('button', { name: 'Add' }))
    expect(step2OnFinishSpy).toBeCalledWith(false)
    expect(step1OnFinishSpy).toBeCalledTimes(2)
    expect(step2OnFinishSpy).toBeCalledTimes(2)
  })

  it('supports button props', async () => {
    const onFinish = jest.fn()
    render(<CustomForm
      editMode
      onFinish={onFinish}
      buttonProps={{ apply: { disabled: true, tooltip: 'Test Me' } }}
    />)

    const applyButton = await screen.findByRole('button', { name: 'Apply' })
    expect(applyButton).toBeDisabled()

    await userEvent.hover(applyButton)
    expect(await screen.findByText('Test Me')).toBeInTheDocument()
  })

  describe('hasPrerequisite step', () => {
    const onFinishSpy = jest.fn()
    const onStep1FinishSpy = jest.fn()

    const TestComponent = () => <StepsForm
      hasPrerequisiteStep
      onFinish={onFinishSpy}
    >
      <StepsForm.StepForm title='Prerequisite'>
        <StepsForm.Title>Prerequisite</StepsForm.Title>
        <Typography.Text children='Prerequisite content' />
      </StepsForm.StepForm>
      <StepsForm.StepForm title='Step 1'
        onFinish={async () => {
          onStep1FinishSpy()
        }}>
        <StepsForm.Title>Step 1 Title</StepsForm.Title>
        <Form.Item name='field1' label='Field 1'>
          <Input />
        </Form.Item>
      </StepsForm.StepForm>
    </StepsForm>

    it('should render start button for go to next step', async () => {
      render(<TestComponent />)

      const actions = screen.getByTestId('steps-form-actions')
      expect(await screen.findByRole('heading', { name: 'Prerequisite' })).toBeVisible()

      await userEvent.click(within(actions).getByRole('button', { name: 'Start' }))
      expect(onStep1FinishSpy).toBeCalledTimes(0)

      expect(await screen.findByRole('heading', { name: 'Step 1 Title' })).toBeVisible()
      await userEvent.click(within(actions).getByRole('button', { name: 'Back' }))

      expect(onStep1FinishSpy).toBeCalledTimes(1)
      expect(await screen.findByRole('heading', { name: 'Prerequisite' })).toBeVisible()
      await userEvent.click(within(actions).getByRole('button', { name: 'Start' }))
      await screen.findByRole('heading', { name: 'Step 1 Title' })
      await userEvent.click(within(actions).getByRole('button', { name: 'Add' }))
      expect(onFinishSpy).toBeCalledTimes(1)
      expect(onStep1FinishSpy).toBeCalledTimes(2)
    })

    it('should not render steps button on left side when current step is 0', async () => {
      render(<TestComponent />)

      const actions = screen.getByTestId('steps-form-actions')
      expect(await screen.findByRole('heading', { name: 'Prerequisite' })).toBeVisible()
      within(actions).getByRole('button', { name: 'Start' })
      expect(screen.queryByRole('button', { name: 'Step 1' })).toBeNull()
    })
  })

  // TODO
  // A requirement from UX
  it.todo('disable submit button when some fields are invalid')
})

describe('StepsForm.StepForm', () => {
  const Component = ({ current, step }: { current: number, step: number }) => {
    const editMode = false
    const [form] = Form.useForm()
    const context = { form, current, editMode, initialValues: {} , gotoStep: jest.fn() }
    const props = { step, children: <h1>OK</h1> }

    return <StepFormContext.Provider
      value={context}
      children={<StepsForm.StepForm {...props} />}
    />
  }

  it('render if step === current', async () => {
    const { container } = render(<Component
      current={1}
      step={1}
    />)

    expect(container).not.toBeEmptyDOMElement()
    expect(screen.getByRole('heading', { name: 'OK' })).toBeVisible()
  })
  it('do not render if step !== current', async () => {
    const { container } = render(<Component
      current={1}
      step={2}
    />)

    expect(container).toBeEmptyDOMElement()
  })
})

describe('StepsForm.FieldSummary', () => {
  const Component = <T,>(props: {
    name: string
    value?: T
    convert?: FieldSummaryProps<T>['convert']
  }) => {
    const [form] = Form.useForm()
    const initialValues = {
      [props.name]: props.value
    }

    return <Form {...{ form, initialValues }}>
      <Form.Item
        name={props.name}
        children={<StepsForm.FieldSummary convert={props.convert} />}
      />
    </Form>
  }

  it('renders no data symbol by default', async () => {
    render(<Component
      name='field'
    />)

    expect((await screen.findByRole('generic', {
      name: (_, el) => el.nodeName === 'SPAN'
    })).textContent).toEqual('--')
  })

  it('renders given value', () => {
    const { container } = render(<Component
      name='field'
      value='Text Content'
    />)

    expect(container).toHaveTextContent('Text Content')
  })

  it('support custom convert to alter rendered text', () => {
    const { container } = render(<Component
      name='field'
      value='key'
      convert={() => 'Custom Content'}
    />)

    expect(container).toHaveTextContent('Custom Content')
  })
})

describe('StepsForm alert message bar', () => {
  const Component = (props: {
    initVal?: StepsFormProps<Record<string, unknown>>['alert']
  }) => {
    return <StepsForm alert={props.initVal}>
      <StepsForm.StepForm title='Step 1'>
        <StepsForm.Title>Step 1</StepsForm.Title>
        <Form.Item
          name='field1'
          label='Field 1'
          rules={[{ required: true }]}
          children={<Input />}
        />
      </StepsForm.StepForm>
    </StepsForm>
  }

  it('supports form alert message', async () => {
    render(<Component initVal={{
      type: 'error',
      message: 'Cross validation failed'
    }} />)
    const alertDiv = screen.getByTestId('steps-form-alert')
    expect(alertDiv).toBeInTheDocument()
    expect(alertDiv).toHaveTextContent(/Cross validation failed/)
  })

  it('should be nothing with undefined', async () => {
    render(<Component initVal={undefined}/>)
    expect(screen.queryByTestId('steps-form-alert')).toBeNull()
  })

  it('dynamic update alert message', async () => {
    const WrappedComponent = () => {
      const [val, setVal] = useState({} as StepsFormProps<Record<string, unknown>>['alert'] )
      useEffect(() => {
        setTimeout(() => setVal({
          type: 'error',
          message: 'Delayed validation failed'
        }), 1000)
      }, [])

      return <Component initVal={val}/>
    }
    render(<WrappedComponent />)
    expect(screen.queryByTestId('steps-form-alert')).toBeNull()
    const alertDiv = await screen.findByTestId('steps-form-alert')
    await waitFor(() => expect(alertDiv).toHaveTextContent(/Delayed validation failed/))
  })
})
