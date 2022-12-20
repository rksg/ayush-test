import '@testing-library/jest-dom'

import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'
import { Form }   from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import Layer2Drawer from './Layer2Drawer'

describe('Layer2Drawer Component', () => {
  it('Render Layer2Drawer component successfully', async () => {
    render(
      <Provider>
        <Form>
          <Layer2Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/layer 2 settings/i)

    const dialog = screen.getByRole('dialog')

    within(dialog).getByText(/access/i)

    screen.getByText(/mac address \( 0\/128 \)/i)

    const saveButton = screen.getByText(/save/i)
    await userEvent.click(saveButton)

    await screen.findByText(/no mac addresses were added yet/i)

    const addButton = screen.getByText('Add')
    await userEvent.click(addButton)

    await screen.findByText(/add mac address/i)

    const inputField = screen.getByPlaceholderText(
      'Enter MAC addresses, separated by comma or semicolon'
    )
    await userEvent.type(inputField, '@@@,')
    await userEvent.type(inputField, '11:11:11:11:11:11,')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(screen.getByRole('button', {
      name: /allow connections only from mac addresses listed below/i
    }))

    await userEvent.click(screen.getByRole('button', {
      name: /block connections from mac addresses listed below/i
    }))

    await userEvent.click(screen.getAllByText('Save')[0])

  })
})
