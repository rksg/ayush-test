import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  notificationApi,
  notificationApiURL,
  Provider,
  store
} from '@acx-ui/store'
import {
  act,
  render,
  screen,
  fireEvent,
  mockRestApiQuery,
  cleanup,
  waitFor,
  mockServer
} from '@acx-ui/test-utils'

import { AINotificationDrawer } from './AINotificationDrawer'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserProfile: () => ({
    profile: {
      tenantId: 'test-tenant'
    }
  })
}))

const components = require('@acx-ui/components')
const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

const mockedUnwrap = jest.fn().mockImplementation(async () => {})
const mockedPrefMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))
const mockedSelfMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useSetNotificationMutation: () => [
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
    <AINotificationDrawer showDrawer={showDrawer} setShowDrawer={wrapSet} />
  </div>
}
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useUpdateTenantSelfMutation: () => [
    mockedSelfMutation, { reset: jest.fn() }
  ],
  useGetTenantDetailsQuery: jest.fn().mockImplementation(() => {
    return { data: tenantDetails }
  })
}))
// eslint-disable-next-line max-len
const tenantDetails = { subscribes: '{\"DEVICE_EDGE_FIRMWARE\":true,\"DEVICE_SWITCH_FIRMWARE\":false,\"API_CHANGES\":true,\"DEVICE_AP_FIRMWARE\":true}' }

describe('IncidentNotificationDrawer', () => {
  beforeEach(() => {
    // this is needed since rtk caches responses across test calls in store...
    store.dispatch(notificationApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  afterEach(() => {
    mockSetShowDrawer.mockClear()
    mockedPrefMutation.mockClear()
    mockedSelfMutation.mockClear()
    mockedUnwrap.mockClear()
    mockServer.resetHandlers()
    mockServer.restoreHandlers()
    components.showToast.mockClear()
    cleanup()
  })
  it('should render drawer open & close correctly', async () => {
    const mockedPref = {
      incident: {}
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
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
  it('should render queried preferences correctly with recommendation FT on', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      intentAI: {
        all: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    expect(await screen.findAllByRole('checkbox')).toHaveLength(5)
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'P1 Incidents' })).toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Intent status change' })).toBeChecked() })
  })
  it('should render correctly for notification channel enabled FF on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      intentAI: {
        all: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${window.location.origin}/tenants/self`, 'get', {
      data: { id: '123' }
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    expect(await screen.findByText('Notifications Preferences')).toBeVisible()
    expect(screen.queryByText('AI Notifications')).toBeNull()
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'API Changes' })).toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'AP Firmware' })).toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Switch Firmware' })).not.toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'RUCKUS Edge Firmware' })).toBeChecked() })
  })
  it('should handle notification preference update', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      intentAI: {
        all: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'post', {
      data: { success: true }
    }, true)
    mockedUnwrap.mockResolvedValueOnce({ success: true })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).not.toBeDisabled()
    expect(await screen.findAllByRole('checkbox')).toHaveLength(5)
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'P1 Incidents' })).toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox', { name: 'P1 Incidents' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'P2 Incidents' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'P3 Incidents' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'Intent status change' }))
    })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'P1 Incidents' })).not.toBeChecked() })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'Intent status change' }))
        .not.toBeChecked()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: {
          incident: {
            P2: ['email'],
            P3: ['email']
          }
        }
      })
    })
    await waitFor(async () => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'success',
          content: 'Notifications updated succesfully.'
        })
    })
  })
  it('should handle failed notification preference update', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'post', {
      data: { success: false }
    }, true)
    mockedUnwrap.mockResolvedValueOnce({ success: false })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).not.toBeDisabled()
    expect(await screen.findAllByRole('checkbox')).toHaveLength(5)
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'P1 Incidents' })).toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox', { name: 'P1 Incidents' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'P2 Incidents' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'P3 Incidents' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'Intent status change' }))
    })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'P1 Incidents' })).not.toBeChecked()})
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Intent status change' })).toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: {
          incident: {
            P2: ['email'],
            P3: ['email']
          },
          intentAI: {
            all: ['email']
          }
        }
      })
    })
    await waitFor(async () => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: 'Update failed, please try again later.'
        })
    })
  })
  it('should handle error notification preference update', async () => {
    const mockedPref = {}
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'post', {
      data: { success: false }
    }, true)

    mockedUnwrap.mockRejectedValueOnce({ success: false })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).not.toBeDisabled()
    expect(await screen.findAllByRole('checkbox')).toHaveLength(5)
    const checkbox = await screen.findByRole('checkbox', { name: 'Intent status change' })
    await waitFor(async () => {
      expect(checkbox).not.toBeChecked()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(checkbox)
    })
    await waitFor(async () => {
      expect(checkbox).toBeChecked()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: {
          intentAI: {
            all: ['email']
          }
        }
      })
    })
    await waitFor(async () => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: 'Update failed, please try again later.'
        })
    })
  })
  it('should handle update for notification channel enabled FF on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      intentAI: {
        all: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${window.location.origin}/tenants/self`, 'get', {
      data: { id: '123' }
    }, true)
    mockedUnwrap.mockResolvedValue({ success: true })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    expect(await screen.findByText('Notifications Preferences')).toBeVisible()
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(await screen.findByRole('checkbox', { name: 'AP Firmware' }))
      await userEvent.click(await screen.findByRole('checkbox', { name: 'Switch Firmware' }))
      await userEvent.click(await screen.findByRole('checkbox', { name: 'API Changes' }))
    })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'AP Firmware' })).not.toBeChecked() })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'Switch Firmware' })).toBeChecked() })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'RUCKUS Edge Firmware' })).toBeChecked()
    })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'API Changes' })).not.toBeChecked() })
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedSelfMutation).toHaveBeenLastCalledWith({
        params: {},
        // eslint-disable-next-line max-len
        payload: { id: 'test-tenant',subscribes: '{\"DEVICE_EDGE_FIRMWARE\":true,\"DEVICE_SWITCH_FIRMWARE\":true,\"API_CHANGES\":false,\"DEVICE_AP_FIRMWARE\":false}' }
      })
    })
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: mockedPref
      })
    })
    await waitFor(async () => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'success',
          content: 'Notifications updated succesfully.'
        })
    })
    expect(components.showToast).toHaveBeenCalledTimes(1)
  })
  it('should handle error on update for notification channel enabled FF on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      intentAI: {
        all: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${window.location.origin}/tenants/self`, 'get', {
      data: { id: '123' }
    }, true)
    mockedUnwrap.mockRejectedValue({ success: false })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    expect(await screen.findByText('Notifications Preferences')).toBeVisible()
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(await screen.findByRole('checkbox', { name: 'AP Firmware' }))
      await userEvent.click(await screen.findByRole('checkbox', { name: 'Switch Firmware' }))
      await userEvent.click(await screen.findByRole('checkbox', { name: 'API Changes' }))
    })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'AP Firmware' })).not.toBeChecked() })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'Switch Firmware' })).toBeChecked() })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'RUCKUS Edge Firmware' })).toBeChecked()
    })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'API Changes' })).not.toBeChecked() })
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedSelfMutation).toHaveBeenLastCalledWith({
        params: {},
        // eslint-disable-next-line max-len
        payload: { id: 'test-tenant',subscribes: '{\"DEVICE_EDGE_FIRMWARE\":true,\"DEVICE_SWITCH_FIRMWARE\":true,\"API_CHANGES\":false,\"DEVICE_AP_FIRMWARE\":false}' }
      })
    })
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: mockedPref
      })
    })
    await waitFor(async () => {
      expect(components.showToast)
        .toHaveBeenLastCalledWith({
          type: 'error',
          content: 'Update failed, please try again later.'
        })
    })
    expect(components.showToast).toHaveBeenCalledTimes(2)
  })
  it('incorrect json tenant details data should have default preferences', async () => {
    const incorrectTenantDetails = { subscribes: '{\"DEVICE_EDGE_FIRMWARE\":false,,,}' }
    services.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: incorrectTenantDetails }
    })
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      intentAI: {
        all: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}/preferences`, 'get', {
      data: mockedPref
    }, true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    expect(await screen.findByText('Notifications Preferences')).toBeVisible()
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    })

    // Assert that preferences are default checked
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'API Changes' })).toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'AP Firmware' })).toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Switch Firmware' })).toBeChecked() })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'RUCKUS Edge Firmware' })).toBeChecked() })
  })
})
