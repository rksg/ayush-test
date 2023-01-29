import '@testing-library/jest-dom'

import {  SWITCH_TYPE }                       from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchDetailsContext } from '..'

import { SwitchTroubleshootingTab } from '.'


const mockedUsedNavigate = jest.fn()

const switchDetailsContextData = {
  switchName: '',
  currentSwitchOperational: true,
  switchDetailHeader: {
    configReady: true,
    name: 'test',
    id: 'id',
    venueId: 'venue-id',
    stackMembers: [],
    syncedSwitchConfig: true,
    switchType: SWITCH_TYPE.ROUTER
  }
}


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchTroubleshootingTab', () => {

  it('should navigate to ping tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'ping'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchTroubleshootingTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/troubleshooting/:activeSubTab'
      }
    })
    expect(await screen.findByText('Target host or IP address')).toBeVisible()
  })

  it('should navigate to trace route tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'traceroute'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchTroubleshootingTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/troubleshooting/:activeSubTab'
      }
    })
    expect(await screen.findByText('Maximum TTL (Hops)')).toBeVisible()
  })

  it('should navigate to IP Route tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'ipRoute'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchTroubleshootingTab />
      </SwitchDetailsContext.Provider>

    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/troubleshooting/:activeSubTab'
      }
    })
    expect(await screen.findByText('Show Route')).toBeVisible()
  })

  it('should navigate to MAC Address Table tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'macTable'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchTroubleshootingTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/troubleshooting/:activeSubTab'
      }
    })
    expect(await screen.findByText('Show Table')).toBeVisible()
  })

  it('should navigate to IP route correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'ping'
    }
    render(
      <Provider>
        <SwitchDetailsContext.Provider value={{
          switchDetailsContextData,
          setSwitchDetailsContextData: jest.fn()
        }}>
          <SwitchTroubleshootingTab />
        </SwitchDetailsContext.Provider>
      </Provider>, {
        route: {
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/troubleshooting/:activeSubTab'
        }
      })
    expect(await screen.findByText('Target host or IP address')).toBeVisible()
  })

  it('should handle tab changes correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'ping'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchTroubleshootingTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/troubleshooting/:activeSubTab'
      }
    })
    await waitFor(() => screen.findByText(/Trace Route/))
    fireEvent.click(await screen.findByText(/Trace Route/))
  })
})


