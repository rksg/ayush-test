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

jest.mock('@acx-ui/components', () => {
  const original = jest.requireActual('@acx-ui/components')
  return {
    ...original,
    showToast: jest.fn()
  }
})

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
    const { showToast } = require('@acx-ui/components')
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
    await waitFor(() => expect(showToast).toHaveBeenCalled())
    const call = showToast.mock.calls[0][0]
    call.onClose()
    await waitFor(() => expect(mockUserLogout).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
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

  it('should show success toast after deletion', async () => {
    const { showToast } = require('@acx-ui/components')
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
    await waitFor(() => expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        content: expect.anything(),
        duration: 10,
        closable: true,
        onClose: expect.any(Function)
      })
    ))

    const call = showToast.mock.calls[0][0]
    call.onClose()
    expect(mockUserLogout).toHaveBeenCalled()
  })

  it('should logout when toast onClose is called', async () => {
    const { showToast } = require('@acx-ui/components')
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
    await waitFor(() =>
      expect(showToast).toHaveBeenCalled()
    )
    // Call the onClose handler manually
    const call = showToast.mock.calls[0][0]
    call.onClose()
    expect(mockUserLogout).toHaveBeenCalled()
  })

  it('logs out after 2 seconds via real timer if toast is not closed manually', async () => {
    const mockUserLogout = require('@acx-ui/utils').userLogout
    const { showToast } = require('@acx-ui/components')

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

    // Ensure toast is shown
    await Promise.resolve()
    expect(showToast).toHaveBeenCalled()

    // Wait for 2 seconds (real time)
    await new Promise(resolve => setTimeout(resolve, 2000))

    expect(mockUserLogout).toHaveBeenCalled()
  })

})
