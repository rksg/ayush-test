import { message } from 'antd'
import '@testing-library/jest-dom'

import { Provider } from '@acx-ui/store'
import {
  act,
  mockServer,
  renderHook
} from '@acx-ui/test-utils'

import { useOltActions } from '.'

const mockShowActionModal = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: (...args) => mockShowActionModal(...args)
}))

const oltData = {
  venueId: 'e407295d681b4016ae15d4422618b770',
  venueName: 'Raj-Venue-MWC-1',
  edgeClusterId: '1cfd6c88-97b7-4d94-8888-45bd72163eb8',
  edgeClusterName: 'MWC_Demo_OVA_72',
  tenantId: '1cdc11256f8144e6802b661de4e5c46e',
  name: 'mock_nokia_mf_2_1',
  status: 'online',
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '24.449',
  ip: '134.242.137.40',
  serialNumber: 'FH2302A073A'
}

describe('Test useOltActions', () => {
  beforeEach(() => {
    message.destroy()
    mockServer.use(
    )
  })

  afterEach(() => {
    mockShowActionModal.mockClear()
  })

  it('should set correct entityName and entityValue for single row', async () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    // Simulate modal confirm
    mockShowActionModal.mockImplementation(({ onOk }) => onOk())

    await act(async () => {
      await result.current.showDeleteOltes({ rows: [oltData], callBack: callback })
    })

    expect(mockShowActionModal).toBeCalled()
    expect(callback).toBeCalled()
    const modalArgs = mockShowActionModal.mock.calls[0][0]
    expect(modalArgs.customContent.entityName).toMatch(/OLT Device/)
    expect(modalArgs.customContent.entityValue).toBe(oltData.name)
    expect(modalArgs.customContent.numOfEntities).toBe(1)
  })

  it('should set correct entityName for multiple rows', async () => {
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    await act(async () => {
      await result.current.showDeleteOltes({ rows: [oltData, { ...oltData, name: 'OLT-2' }] })
    })

    const modalArgs = mockShowActionModal.mock.calls[0][0]
    expect(modalArgs.customContent.entityName).toMatch(/OLT Devices/)
    expect(modalArgs.customContent.entityValue).toBeUndefined()
    expect(modalArgs.customContent.numOfEntities).toBe(2)
  })

  it('should call showRebootOlt correctly', async () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useOltActions(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    // Simulate modal confirm
    mockShowActionModal.mockImplementation(({ onOk }) => onOk())

    await act(async () => {
      await result.current.showRebootOlt({ rows: [oltData], callBack: callback })
    })

    expect(mockShowActionModal).toBeCalled()
    expect(callback).toBeCalled()
  })
})
