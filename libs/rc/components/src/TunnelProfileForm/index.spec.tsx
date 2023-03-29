import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import { TunnelProfileForm } from './index'

describe('TunnelProfileForm', () => {
  it('should render TunnelProfileForm successfully', () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    screen.getByRole('textbox', { name: 'Policy Name' })
    screen.getByRole('combobox', { name: 'Tags' })
    screen.getByRole('radio', { name: 'Auto' })
    screen.getByRole('radio', { name: 'Manual' })
    screen.getByRole('switch', { name: 'Force Fragmentation' })
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
})