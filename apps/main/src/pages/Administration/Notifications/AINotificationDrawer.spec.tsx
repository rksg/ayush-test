import { useState } from 'react'

import { showToast }    from '@acx-ui/components'
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

jest.mocked(useIsSplitOn)

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

describe('IncidentNotificationDrawer', () => {
  beforeEach(() => {
    // this is needed since rtk caches responses across test calls in store...
    store.dispatch(notificationApi.util.resetApiState())
  })
  afterEach(() => {
    mockSetShowDrawer.mockClear()
    mockedPrefMutation.mockClear()
    mockedUnwrap.mockClear()
    mockServer.resetHandlers()
    mockServer.restoreHandlers()
    jest.mocked(useIsSplitOn).mockClear()
    cleanup()
  })
  it('should render drawer open & close correctly', async () => {
    const mockedPref = {
      incident: {}
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    })
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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
      configRecommendation: {
        aiOps: ['email'],
        crrm: []
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(6)
    await waitFor(() => { expect(inputs[0]).toBeChecked() })
    await waitFor(() => { expect(inputs[5]).toBeChecked() })
  })
  it('should render with recommendation FT off queried preferences correctly', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    await waitFor(async () => {
      expect(await screen.findAllByRole('checkbox')).toHaveLength(4)
    })
    await waitFor( async () => {
      expect(await screen.findByRole('checkbox', { name: 'P1 Incidents' })).toBeChecked() })
  })
  it('should handle notification preference update', async () => {
    const mockedPref = {
      incident: {
        P1: ['email']
      },
      configRecommendation: {
        aiOps: ['email'],
        crrm: []
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
      data: { success: true }
    }, true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUnwrap.mockResolvedValueOnce({ success: true })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).not.toBeDisabled()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(6)
    await waitFor(() => { expect(inputs[0]).toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.click(inputs[0])
      fireEvent.click(inputs[1])
      fireEvent.click(inputs[2])
      fireEvent.click(inputs[4])
      fireEvent.click(inputs[5])
    })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'P1 Incidents' })).not.toBeChecked() })
    await waitFor(async () => {
      expect(await screen.findByRole('checkbox', { name: 'AI Operations' })).not.toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: {
          incident: {
            P1: [],
            P2: ['email'],
            P3: ['email']
          },
          configRecommendation: {
            crrm: ['email'],
            aiOps: []
          }
        }
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
      },
      configRecommendation: {
        crrm: []
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
      data: { success: false }
    }, true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUnwrap.mockResolvedValueOnce({ success: false })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).not.toBeDisabled()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(6)
    await waitFor(() => { expect(inputs[0]).toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(inputs[0])
      fireEvent.click(inputs[1])
      fireEvent.click(inputs[2])
      fireEvent.click(inputs[4])
      fireEvent.click(inputs[5])
    })
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'P1 Incidents' })).not.toBeChecked()})
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'AI Operations' })).toBeChecked() })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: {
          incident: {
            P1: [],
            P2: ['email'],
            P3: ['email']
          },
          configRecommendation: {
            crrm: ['email'],
            aiOps: ['email']
          }
        }
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
      },
      configRecommendation: {
        crrm: undefined,
        aiOps: ['web']
      }
    }
    mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
      data: mockedPref
    }, true)
    mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
      data: { success: false }
    }, true)

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUnwrap.mockRejectedValueOnce({ success: false })
    render(<MockDrawer />, { wrapper: Provider })
    const drawerButton = screen.getByRole('button', { name: /open me/ })
    fireEvent.click(drawerButton)
    const applyButton = await screen.findByRole('button', { name: /Apply/ })
    expect(applyButton).not.toBeDisabled()
    const inputs = await screen.findAllByRole('checkbox')
    expect(inputs).toHaveLength(6)
    await waitFor(async () => {
      expect(inputs[5]).not.toBeChecked()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(inputs[5])
    })
    await waitFor(async () => {
      expect(inputs[5]).toBeChecked()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyButton)} )
    await waitFor(() => {
      expect(mockedPrefMutation).toHaveBeenLastCalledWith({
        tenantId: 'test-tenant',
        preferences: {
          incident: {
            P1: []
          },
          configRecommendation: {
            aiOps: ['web', 'email']
          }
        }
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