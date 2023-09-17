import { useState } from 'react'

import { showToast } from '@acx-ui/components'
import {
  notificationApiURL,
  Provider
} from '@acx-ui/store'
import {
  act,
  render,
  screen,
  fireEvent,
  mockRestApiQuery,
  cleanup,
  waitFor
} from '@acx-ui/test-utils'

import { IncidientNotificationDrawer } from './IncidentNotificationDrawer'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserProfile: () => ({
    profile: {
      tenantId: 'test-tenant'
    }
  })
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

const mockedUnwrap = jest.fn().mockImplementation(async () => {})
const mockedPrefMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useSetIncidentNotificationMutation: () => [
    mockedPrefMutation, { reset: jest.fn() }
  ]
}))

const mockSetShowDrawer = jest.fn()
const MockDrawer = () => {
  const [showDrawer, setShowDrawer] = useState(false)
  const wrapSet = (val: boolean) => {
    setShowDrawer(val)
    mockSetShowDrawer(val)
  }
  return <div style={{ height: 500, width: 500 }}>
    <button onClick={() => wrapSet(true)}>open me</button>
    <IncidientNotificationDrawer showDrawer={showDrawer} setShowDrawer={wrapSet} />
  </div>
}
describe('IncidentNotificationDrawer', () => {
  afterEach(() => {
    mockSetShowDrawer.mockClear()
    mockedPrefMutation.mockClear()
    mockedUnwrap.mockClear()
    cleanup()
  })
  it('should render drawer open & close correctly', async () => {
    const mockedPref = {
      incident: {}
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    expect(mockSetShowDrawer).toBeCalledTimes(0)
    fireEvent.click(drawerButton)
    expect(mockSetShowDrawer).toHaveBeenLastCalledWith(true)
    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    fireEvent.click(cancelButton)
    expect(mockSetShowDrawer).toHaveBeenLastCalledWith(false)
    expect(mockSetShowDrawer).toBeCalledTimes(2)
  })
  it('should render queried preferences correctly', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(4)
    await waitFor(() => { expect(inputs[0]).toBeChecked() })
  })
  it('should handle notification preference update', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
      data: { success: true }
    }, true)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    mockedUnwrap.mockResolvedValueOnce({ success: true })
    expect(applyButton).toBeDisabled()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(4)
    await waitFor(() => { expect(inputs[0]).toBeChecked() })
    fireEvent.click(inputs[0])
    fireEvent.click(inputs[1])
    fireEvent.click(inputs[2])
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        state: {
          P1: false,
          P2: true,
          P3: true,
          P4: false
        },
        preferences: mockedPref
      })
    })
    await waitFor(async () => {
      expect(showToast)
        .toHaveBeenLastCalledWith({
          type: 'success',
          content: 'Incident notifications updated succesfully.'
        })
    })
  })
  it('should handle failed notification preference update', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
      data: { success: false }
    }, true)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    mockedUnwrap.mockResolvedValueOnce({ success: false })
    expect(applyButton).toBeDisabled()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(4)
    await waitFor(() => { expect(inputs[0]).toBeChecked() })
    fireEvent.click(inputs[0])
    fireEvent.click(inputs[1])
    fireEvent.click(inputs[2])
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        state: {
          P1: false,
          P2: true,
          P3: true,
          P4: false
        },
        preferences: mockedPref
      })
    })
    await waitFor(async () => {
      expect(showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: 'Update failed, please try again later.'
        })
    })
  })
  it('should handle error notification preference update', async () => {
    const mockedPref = {
      incident: {
        P1: []
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
      data: { success: false }
    }, true)
    mockedUnwrap.mockRejectedValueOnce({ success: false })
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).toBeDisabled()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(4)
    await waitFor(() => { expect(inputs[0]).not.toBeChecked() })
    fireEvent.click(inputs[0])
    fireEvent.click(inputs[1])
    fireEvent.click(inputs[2])
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        state: {
          P1: true,
          P2: true,
          P3: true,
          P4: false
        },
        preferences: mockedPref
      })
    })
    await waitFor(async () => {
      expect(showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: 'Update failed, please try again later.'
        })
    })
  })
})