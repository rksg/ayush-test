import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { TunnelProfileForm } from './index'

describe('TunnelProfileForm', () => {
  it('should render TunnelProfileForm successfully', () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    screen.getByRole('textbox', { name: 'Policy Name' })
    // screen.getByRole('combobox', { name: 'Tags' })
    screen.getByRole('radio', { name: 'Auto' })
    screen.getByRole('radio', { name: 'Manual' })
    screen.getByRole('switch', { name: 'Force Fragmentation' })
    screen.getByRole('spinbutton', { name: 'Idle Period' })
  })

  it('should show MTU size field when select Manual', async () => {
    const user = userEvent.setup()
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    user.click(screen.getByRole('radio', { name: 'Manual' }))
    expect(await screen.findByRole('spinbutton')).toBeVisible()
  })

  it('should show error when ageTime is invalid', async () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    const ageTimeInput = await screen.findByRole('spinbutton', { name: 'Idle Period' })
    fireEvent.change(ageTimeInput, { target: { value: 1 } })

    expect(await screen.findByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
      .toBeVisible()

    fireEvent.change(ageTimeInput, { target: { value: 10081 } })
    expect(await screen.findByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
      .toBeVisible()
  })
})