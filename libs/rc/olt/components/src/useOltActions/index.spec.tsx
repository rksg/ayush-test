import '@testing-library/jest-dom'

import { OltFixtures }     from '@acx-ui/olt/utils'
import { Provider }        from '@acx-ui/store'
import { act, renderHook } from '@acx-ui/test-utils'

import { useOltActions } from '.'

const callback = jest.fn()
const mockShowActionModal = jest.fn()
jest.mock('@acx-ui/components', () => ({
  showActionModal: (...args) => mockShowActionModal(...args)
}))

const { mockOlt } = OltFixtures

describe('Test useOltActions', () => {
  afterEach(() => {
    callback.mockClear()
    mockShowActionModal.mockClear()
  })

  it('should call showDeleteOlt correctly', async () => {
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    mockShowActionModal.mockImplementation(({ onOk }) => onOk())

    await act(async () => {
      await result.current.showDeleteOlt({ rows: [mockOlt], callBack: callback })
    })

    expect(mockShowActionModal).toBeCalled()
    expect(callback).toBeCalled()
  })

  it('should call showRebootOlt correctly', async () => {
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    mockShowActionModal.mockImplementation(({ onOk }) => onOk())

    await act(async () => {
      await result.current.showRebootOlt({ rows: [mockOlt], callBack: callback })
    })

    expect(mockShowActionModal).toBeCalled()
    expect(callback).toBeCalled()
  })

  it('should delete multiple rows', async () => {
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    await act(async () => {
      await result.current.showDeleteOlt({ rows: [mockOlt, { ...mockOlt, name: 'OLT-2' }] })
    })

    const modalArgs = mockShowActionModal.mock.calls[0][0]
    expect(modalArgs.customContent.entityName).toMatch(/OLT Devices/)
    expect(modalArgs.customContent.entityValue).toBeUndefined()
    expect(modalArgs.customContent.numOfEntities).toBe(2)
  })

  it('should reboot multiple rows', async () => {
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    await act(async () => {
      await result.current.showRebootOlt({ rows: [mockOlt, { ...mockOlt, name: 'OLT-2' }] })
    })

    const modalArgs = mockShowActionModal.mock.calls[0][0]
    expect(modalArgs.title).toMatch(/OLT Devices/)
  })
})
