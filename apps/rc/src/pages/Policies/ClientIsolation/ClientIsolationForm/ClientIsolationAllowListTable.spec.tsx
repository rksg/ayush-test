import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { ClientIsolationClient } from '@acx-ui/rc/utils'
import { Provider }              from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { createPath, mockedAllowList, mockedTenantId } from './__tests__/fixtures'
import { ClientIsolationAllowListTable }               from './ClientIsolationAllowListTable'


describe('ClientIsolationAllowListTable', () => {
  it('should edit a client in the allow list', async () => {

    // Prepare testing data
    const allowList = [ ...mockedAllowList ]
    const targetClient = { ...allowList[0] }
    const macToEdit = 'AA:BB:11:CC:DD:22'

    // Wrap the testing component
    const Component = () => {
      const [ list, setList ] = useState(allowList)

      return (
        <Provider>
          <ClientIsolationAllowListTable
            allowList={list}
            setAllowList={setList}
            showIpAddress={false}
          />
        </Provider>
      )
    }

    render(
      <Component />, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Select the client
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetClient.mac) })
    await userEvent.click(await within(targetRow).findByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Edit/ }))

    // Verify the drawer is open correctly
    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByText('Edit Client')).toBeVisible()

    // Verify the client MAC address has been filled in
    const macInput = await within(drawer).findByRole('textbox', { name: /MAC Address/ })
    expect(macInput).toHaveValue(targetClient.mac)

    // Type in the new MAC address
    await userEvent.clear(macInput)
    await userEvent.type(macInput, macToEdit)
    await userEvent.click(await within(drawer).findByRole('button', { name: /Save/ }))

    // Verify the client MAC address has been updated
    expect(await screen.findByRole('row', { name: new RegExp(macToEdit) })).toBeVisible()
  })

  it('should delete a client in the allow list', async () => {
    // Prepare testing data
    const allowList = [ ...mockedAllowList ]
    const targetClient = { ...allowList[0] }

    // Wrap the testing component
    const Component = () => {
      const [ list, setList ] = useState(allowList)

      return (
        <Provider>
          <ClientIsolationAllowListTable
            allowList={list}
            setAllowList={setList}
            showIpAddress={false}
          />
        </Provider>
      )
    }

    render(
      <Component />, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    // Select the client
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetClient.mac) })
    await userEvent.click(await within(targetRow).findByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/ }))

    // Verify the confirmation dialog is visible
    expect(await screen.findByText('Delete "' + targetClient.mac + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Client/i }))

    // Verify if the client has been deleted
    expect(screen.queryByRole('row', { name: new RegExp(targetClient.mac) })).toBeNull()
  })

  it('should display error message when add the duplication client', async () => {

    // Prepare testing data
    const macToAdd = 'AA:BB:11:CC:DD:22'

    // Wrap the testing component
    const Component = () => {
      const [ list, setList ] = useState<ClientIsolationClient[]>([])

      return (
        <Provider>
          <ClientIsolationAllowListTable
            allowList={list}
            setAllowList={setList}
            showIpAddress={false}
          />
        </Provider>
      )
    }

    render(
      <Component />, {
        route: { params: { tenantId: mockedTenantId }, path: createPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Add New Client/ }))

    const drawer = await screen.findByRole('dialog')

    const macInput = await within(drawer).findByRole('textbox', { name: /MAC Address/ })

    // Type in the new MAC address
    await userEvent.clear(macInput)
    await userEvent.type(macInput, macToAdd)

    // eslint-disable-next-line max-len
    await userEvent.click(await within(drawer).findByRole('checkbox', { name: /Add another client/ }))
    await userEvent.click(await within(drawer).findByRole('button', { name: /Add/ }))

    // Verify the client has been added
    const addedClientRow = await screen.findByRole('row', { name: new RegExp(macToAdd) })
    expect(addedClientRow).toBeVisible()

    // Verify the value of MAC Address field has been clear
    const addedMacInput = within(drawer).queryByDisplayValue(macToAdd)
    await waitFor(async () => {
      expect(addedMacInput).toBeNull()
    })

    // Type in the same MAC address again
    // eslint-disable-next-line max-len
    await userEvent.type(await within(drawer).findByRole('textbox', { name: /MAC Address/ }), macToAdd)

    // Verify the error message for the duplication client
    const errorMessageElem = await screen.findByRole('alert')
    expect(errorMessageElem.textContent).toBe('The client already exists')
  })
})
