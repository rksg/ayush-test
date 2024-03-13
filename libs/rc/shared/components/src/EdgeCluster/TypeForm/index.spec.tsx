import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'

import { StepsForm } from '@acx-ui/components'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { TypeForm } from '.'


describe('Edge Cluster Type Form', () => {
  beforeEach(() => {
  })

  it('should correctly display with multi-steps form', async () => {
    const Component: React.FC = () => {
      const [form] = Form.useForm()
      return (
        <StepsForm form={form} initialValues={{ field1: 'item-a' }}>
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
    }

    render(
      <TypeForm
        content={<Component/>}
      />)

    expect(await screen.findByText('Step 1')).toBeVisible()
    expect(screen.getByText('Step 2')).toBeVisible()
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    expect(nextBtn).toBeVisible()
    await userEvent.click(nextBtn)
    expect(await screen.findByText('Step 2 Title')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
  })

  it('should correctly display with single-step form', async () => {
    const mockedOnFinish = jest.fn()
    const Component: React.FC = () => {
      const [form] = Form.useForm()
      return (
        <StepsForm
          form={form}
          initialValues={{ field1: 'item-a' }}
          onFinish={mockedOnFinish}
        >
          <StepsForm.StepForm title='Step 1'>
            <StepsForm.Title>Step 1 Title</StepsForm.Title>
            <Form.Item name='field1' label='Field 1'>
              <Input />
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      )
    }

    render(
      <TypeForm
        content={<Component/>}
      />)

    expect(await screen.findByText('Step 1 Title')).toBeVisible()
    expect(screen.queryByText('Step 1')).toBeNull()
    const addBtn = screen.getByRole('button', { name: 'Add' })
    expect(addBtn).toBeVisible()
    await userEvent.click(addBtn)
    expect(mockedOnFinish).toBeCalledTimes(1)
    expect(mockedOnFinish).toBeCalledWith({ field1: 'item-a' })
  })

  it('should display custom header', async () => {
    render(
      <TypeForm
        content={<div data-testid='rc-typeForm-content' />}
        header={<div data-testid='rc-typeForm-header' />}
      />)

    expect(await screen.findByTestId('rc-typeForm-header')).toBeVisible()
    expect(screen.getByTestId('rc-typeForm-content')).toBeVisible()
  })
})