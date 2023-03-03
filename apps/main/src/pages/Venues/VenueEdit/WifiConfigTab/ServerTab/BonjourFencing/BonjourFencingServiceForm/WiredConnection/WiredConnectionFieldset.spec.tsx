import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { BonjourFencingService }  from '@acx-ui/rc/utils'
import { render, screen, within } from '@acx-ui/test-utils'

import { BonjourFencingServiceContext } from '../../BonjourFencingServiceTable'

import { WiredConnectionFieldset } from './WiredConnectionFieldset'


describe('WiredConnectionFieldset Component', () => {
  const serviceRef = { current: {} } as React.MutableRefObject<BonjourFencingService | undefined>
  const otherServices = [] as BonjourFencingService[]

  const venueAps = [
    { name: 'ap1', apMac: '11:11:11:11:11:11', serialNumber: '111111111111' },
    { name: 'ap2', apMac: 'AA:AA:AA:AA:AA:AA', serialNumber: '111111111112' }
  ]

  it ('should render correctly', async () => {
    render(
      <BonjourFencingServiceContext.Provider
        value={{
          currentServiceRef: serviceRef,
          otherServices: otherServices,
          venueAps: venueAps
        }}>
        <Form>
          <WiredConnectionFieldset />
        </Form>
      </BonjourFencingServiceContext.Provider>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))

    // check table has been created
    await screen.findByText('Fencing Rule')

    // show modal
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    // close modal
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it ('should add/delete entry correctly', async () => {
    render(
      <BonjourFencingServiceContext.Provider
        value={{
          currentServiceRef: serviceRef,
          otherServices: otherServices,
          venueAps: venueAps
        }}>
        <Form>
          <WiredConnectionFieldset />
        </Form>
      </BonjourFencingServiceContext.Provider>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))

    // check table has been created
    await screen.findByText('Fencing Rule')

    // show modal to add rule
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await userEvent.type(await screen.findByRole('textbox', { name: 'Rule Name' }), 'r1' )

    // device MAC address settings
    let addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(3)

    await userEvent.click(addButtons[1])

    await screen.findAllByText('Add MAC Address')

    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(await screen.findByTestId('InputTagField'), 'AA:BB:CC:DD:EE:FF{enter}')

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(4)
    await userEvent.click(addButtons[3])

    await screen.findByRole('cell', { name: 'AA:BB:CC:DD:EE:FF' })

    await userEvent.click(await screen.findByRole('combobox', { name: 'Closest AP' }))
    await userEvent.click(await screen.findByTitle('ap1'))

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButtons[2])

    await screen.findByRole('cell', { name: 'r1' })
    await screen.findByRole('cell', { name: 'AA:BB:CC:DD:EE:FF' })
    await screen.findByRole('cell', { name: 'ap1' })

    // delete rule
    await userEvent.click(await screen.findByRole('deleteBtn'))
  })

  it ('should check the adding/deleting MAC address is correct', async () => {
    render(
      <BonjourFencingServiceContext.Provider
        value={{
          currentServiceRef: serviceRef,
          otherServices: otherServices,
          venueAps: venueAps
        }}>
        <Form>
          <WiredConnectionFieldset />
        </Form>
      </BonjourFencingServiceContext.Provider>
    )

    await userEvent.click(await screen.findByRole('switch', { name: 'Wired Connection' }))

    // check table has been created
    await screen.findByText('Fencing Rule')

    // show modal
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    await userEvent.type(await screen.findByRole('textbox', { name: 'Rule Name' }), 'r1' )

    let addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(3)

    await userEvent.click(addButtons[1])

    await screen.findAllByText('Add MAC Address')

    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(await screen.findByTestId('InputTagField'), '111111111112{enter}')

    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(await screen.findByTestId('InputTagField'), '1111.1111.1113{enter}')

    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(await screen.findByTestId('InputTagField'), '11-11-11-11-11-14{enter}')

    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(await screen.findByTestId('InputTagField'), '11:11:11:11:11:15{enter}')

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(4)
    await userEvent.click(addButtons[3])

    await screen.findByText('Device MAC Address ( 4/4 )')
    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(3)
    expect(addButtons[1]).toBeDisabled()

    const deleteButtons = await screen.findAllByRole('deleteBtn')
    expect(deleteButtons.length).toBe(4)
    await userEvent.click(deleteButtons[0])

    addButtons = await screen.findAllByRole('button', { name: 'Add' })
    expect(addButtons.length).toBe(3)
    expect(addButtons[1]).toBeEnabled()
    await userEvent.click(addButtons[1])

    // Typo the existed MAC address
    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(await screen.findByTestId('InputTagField'), '11:11:11:11:11:15{enter}')
    await screen.findByText('The MAC address has already existed.')

    await userEvent.click(
      await within(
        await screen.findByTestId('11:11:11:11:11:15_tag')).findByRole('img'))


    // Typo the wrong MAC address
    await userEvent.click(await screen.findByTestId('InputTag'))
    await userEvent.type(
      await screen.findByTestId('InputTagField'), 'aa12345678901234567890{enter}')
    await screen.findByText('The format of a MAC address is not correct.')

    await userEvent.click(
      await within(
        await screen.findByTestId('aa12345678901234567890_tag')).findByRole('img'))

    let cancelBtns = await screen.findAllByRole('button', { name: 'Cancel' })
    expect(cancelBtns.length).toBe(2)
    await userEvent.click(cancelBtns[1])
  })
})
