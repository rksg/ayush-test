// tests for useCheckDelegateAdmin hook

import { renderHook } from '@acx-ui/test-utils'

import { useCheckDelegateAdmin } from './useCheckDelegateAdmin'

const mockShowActionModal = jest.fn()
jest.mock('@acx-ui/components', () => ({
  showActionModal: (props) => mockShowActionModal(props)
}))

const mockGetDelegatedAdmins = jest.fn().mockReturnValue({
  unwrap: jest.fn().mockResolvedValue([
    { msp_admin_id: 'admin1' },
    { msp_admin_id: 'admin2' }
  ])
})
const mockDelegateToMspEcPath = jest.fn()
jest.mock('@acx-ui/msp/services', () => ({
  useLazyGetMspEcDelegatedAdminsQuery: () => [mockGetDelegatedAdmins],
  useDelegateToMspEcPath: () => ({
    delegateToMspEcPath: mockDelegateToMspEcPath
  })
}))

describe('useCheckDelegateAdmin', () => {
  it('delegates if admin is found', async () => {
    const { result } = renderHook(() => useCheckDelegateAdmin(true))

    await result.current.checkDelegateAdmin('tenant1', 'admin1')
    expect(mockDelegateToMspEcPath).toHaveBeenCalledWith('tenant1')
  })

  it('shows error modal if admin is not found', async () => {
    mockGetDelegatedAdmins.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue([])
    })
    const { result } = renderHook(() => useCheckDelegateAdmin(false))

    await result.current.checkDelegateAdmin('tenant1', 'admin1')
    expect(mockShowActionModal).toHaveBeenCalledWith({
      type: 'error',
      title: 'Error',
      content: 'You are not authorized to manage this customer'
    })
  })
})
