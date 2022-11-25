import '@testing-library/jest-dom'
import { useState } from 'react'

import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'
import { Form }   from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import Layer2Drawer, { Layer2DrawerObject } from './Layer2Drawer'

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

  it('Render Layer2Drawer component with props successfully', async () => {
    const createMacAddress = () => {
      // eslint-disable-next-line max-len
      let macAddress = `${(Math.random() * 90 + 9).toFixed()}:11:${(Math.random() * 90 + 9).toFixed()}:11:${(Math.random() * 90 + 9).toFixed()}:11`
      return { macAddress: macAddress }
    }

    const initMacAddressList = Array.from({ length: 126 }, () => createMacAddress())

    const Layer2DrawerWithProps = () => {
      const [layer2Fields, setLayer2Fields] = useState({
        macAddressList: [{ macAddress: '11:11:11:01:01:01' }, ...initMacAddressList],
        access: ''
      } as Layer2DrawerObject)
      return <Layer2Drawer fields={layer2Fields} setFields={setLayer2Fields}/>
    }

    render(
      <Provider>
        <Layer2DrawerWithProps />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText(/layer 2 settings/i)

    const dialog = screen.getByRole('dialog')

    within(dialog).getByText(/access/i)

    screen.getByText(/mac address \( 127\/128 \)/i)

    await screen.findByText(initMacAddressList[0].macAddress)

    const saveButton = screen.getByText(/save/i)
    await userEvent.click(saveButton)

    await screen.findByText(/Please select one of the status/i)

    await userEvent.click(screen.getByRole('button', {
      name: /allow connections only from mac addresses listed below/i
    }))

    await userEvent.click(screen.getByRole('button', {
      name: /block connections from mac addresses listed below/i
    }))


    const addButton = screen.getByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    await screen.findByText(/add mac address/i)

    const inputField = screen.getByPlaceholderText(
      'Enter MAC addresses, separated by comma or semicolon'
    )
    await userEvent.type(inputField, '@@@,')
    await userEvent.type(inputField, '11:11:11:11:11:11,')
    await userEvent.type(inputField, '11:11:11:11:11:12,')
    await userEvent.click(within(screen.getByText(/11:11:11:11:11:12/i)).getByLabelText('close'))
    await userEvent.type(inputField, '11:11:11:11:11:12,')

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText('reached the maximum number of MAC Address')

    await userEvent.click(addButton)

    await screen.findByText(/add mac address/i)
    await userEvent.type(screen.getByPlaceholderText(
      'Enter MAC addresses, separated by comma or semicolon'
    ), '11:22:11:11:11:11,')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(addButton)

    await screen.findAllByText('11:11:11:01:01:01')

    await userEvent.click(screen.getByTestId('11:11:11:01:01:01'))

    await userEvent.click(addButton)

    const clearButton = screen.getByRole('button', { name: 'Clear list' })
    await userEvent.click(clearButton)

    await userEvent.click(screen.getAllByText('Save')[0])

    await userEvent.click(screen.getByText('Change'))

    await screen.findByText(/layer 2 settings/i)

    await userEvent.click(screen.getAllByText('Cancel')[0])

  })
})
