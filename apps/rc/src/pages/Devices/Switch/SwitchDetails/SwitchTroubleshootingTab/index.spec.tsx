import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { SWITCH_TYPE }    from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

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
    firmware: 'SPR09010g',
    syncedSwitchConfig: true,
    switchType: SWITCH_TYPE.ROUTER
  }
}


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./switchIpRouteForm', () => ({
  SwitchIpRouteForm: () => <div data-testid='SwitchIpRouteForm'></div>
}))
jest.mock('./switchMacAddressForm', () => ({
  SwitchMacAddressForm: () => <div data-testid='SwitchMacAddressForm'></div>
}))
jest.mock('./switchPingForm', () => ({
  SwitchPingForm: () => <div data-testid='SwitchPingForm'></div>
}))
jest.mock('./switchTraceRouteForm', () => ({
  SwitchTraceRouteForm: () => <div data-testid='SwitchTraceRouteForm'></div>
}))
jest.mock('./switchCableTestForm', () => ({
  SwitchCableTestForm: () => <div data-testid='SwitchCableTestForm'></div>
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
    expect(await screen.findByTestId('SwitchPingForm')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /Trace Route/i }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/switch/switchId/serialNumber/details/troubleshooting/traceroute`,
      hash: '',
      search: ''
    })
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
    expect(await screen.findByTestId('SwitchTraceRouteForm')).toBeVisible()
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
    expect(await screen.findByTestId('SwitchIpRouteForm')).toBeVisible()
  })

  it.skip('should navigate to MAC Address Table tab correctly', async () => {
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
    expect(await screen.findByTestId('SwitchMacAddressForm')).toBeVisible()
  })

  it.skip('should navigate to Cable Test tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeSubTab: 'cableTest'
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
    expect(await screen.findByTestId('SwitchCableTestForm')).toBeVisible()
  })
})


