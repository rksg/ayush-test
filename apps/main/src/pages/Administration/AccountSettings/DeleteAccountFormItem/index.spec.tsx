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
  ...jest.requireActual('@acx-ui/rc/services'),
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
      expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Delete Customer' }))
    await waitFor(() => expect(mockMutation).toHaveBeenCalled())
    await waitFor(() => expect(mockUserLogout).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
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
})
