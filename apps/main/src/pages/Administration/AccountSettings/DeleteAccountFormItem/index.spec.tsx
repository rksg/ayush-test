import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { DeleteAccountFormItem } from './index'

const mockedUnwrap = jest.fn().mockImplementation(async () => {})
const mockMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))
jest.mock('@acx-ui/rc/services', () => ({
  useGetTenantDetailsQuery: () => ({ data: { name: 'JohnSmith' } }),
  useDeleteTenantMutation: () => ([mockMutation])
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  userLogout: jest.fn()
}))

describe('Delete Account Form Item', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    await screen.findByRole('dialog')
    expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    await userEvent.click(screen.getByTestId('CloseSymbol'))
  })
  it('should delete correctly', async () => {
    const mockUserLogout = require('@acx-ui/utils').userLogout
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(await screen.findByRole('button', { name: 'Delete Customer' })).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox'), 'delete')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeEnabled()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete Customer' }))
    await waitFor(() => expect(mockMutation).toHaveBeenCalled())
    // Wait for the modal to appear in the DOM
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Find and click the OK button in the modal
    const okButton = screen.getByRole('button', { name: /ok/i })
    await userEvent.click(okButton)
    await waitFor(() => expect(mockUserLogout).toHaveBeenCalled())
  })

  it('should delete fail', async () => {
    mockedUnwrap.mockRejectedValueOnce(new Error('Mocked error'))
    const mockUserLogout = require('@acx-ui/utils').userLogout
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(await screen.findByRole('button', { name: 'Delete Customer' })).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox'), 'delete')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeEnabled()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete Customer' }))
    await waitFor(() => expect(mockMutation).toHaveBeenCalled())
    await waitFor(() => expect(mockUserLogout).not.toHaveBeenCalled())
  })

  it('should close modal when cancel button clicked', async () => {
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should show success modal after deletion', async () => {
    const mockUserLogout = require('@acx-ui/utils').userLogout
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(await screen.findByRole('button', { name: 'Delete Customer' })).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox'), 'delete')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeEnabled()
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete Customer' }))
    // Wait for the modal to appear in the DOM
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Find and click the OK button in the modal
    const okButton = screen.getByRole('button', { name: /ok/i })
    await userEvent.click(okButton)
    expect(mockUserLogout).toHaveBeenCalled()
  })

  it('should logout when user clicks OK button in the success modal', async () => {
    const mockUserLogout = require('@acx-ui/utils').userLogout
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>, {
        route: { params }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(await screen.findByRole('button', { name: 'Delete Customer' })).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox'), 'delete')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeEnabled()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete Customer' }))
    // Wait for the modal to appear in the DOM
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Find and click the OK button in the modal
    const okButton = screen.getByRole('button', { name: /ok/i })
    await userEvent.click(okButton)
    expect(mockUserLogout).toHaveBeenCalled()
  })

  it('logs out after 10 seconds via timer if modal OK is not clicked', async () => {
    const mockUserLogout = require('@acx-ui/utils').userLogout
    render(
      <Provider>
        <DeleteAccountFormItem />
      </Provider>,
      { route: { params } }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(await screen.findByRole('button', { name: 'Delete Customer' })).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox'), 'delete')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeEnabled()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete Customer' }))
    // Wait for the modal to appear in the DOM
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Do not click the OK button, instead wait for the timer to trigger logout
    await new Promise(resolve => setTimeout(resolve, 10000))
    await waitFor(() => expect(mockUserLogout).toHaveBeenCalled())
  })

})
