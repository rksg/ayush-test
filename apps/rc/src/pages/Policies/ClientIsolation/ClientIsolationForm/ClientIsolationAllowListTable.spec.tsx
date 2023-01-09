import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
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

    render(
      <Provider>
        <ClientIsolationAllowListTable allowList={allowList} />
      </Provider>, {
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

  })
})
