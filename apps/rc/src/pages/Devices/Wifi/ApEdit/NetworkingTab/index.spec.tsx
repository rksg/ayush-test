import userEvent from '@testing-library/user-event'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'
import { render, screen }         from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '..'
import { ApCap_T750SE, ApData_T750SE }  from '../../../__tests__/fixtures'

import { NetworkingTab } from '.'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./IpSettings/IpSettings', () => ({
  IpSettings: () => <div data-testid={'ipSettings'}></div>
}))

jest.mock('./LanPorts', () => ({
  LanPorts: () => <div data-testid={'lanPorts'}></div>
}))

jest.mock('./Mesh', () => ({
  ApMesh: () => <div data-testid={'apMesh'}></div>
}))

jest.mock('./DirectedMulticast', () => ({
  DirectedMulticast: () => <div data-testid={'directedMulticast'}></div>
}))

jest.mock('./SmartMonitor', () => ({
  SmartMonitor: () => <div data-testid={'smartMonitor'}></div>
}))

describe('AP Networking Tab', () => {
  const defaultT750SeApCtxData = {
    apData: ApData_T750SE,
    apCapabilities: ApCap_T750SE
  }

  it('should render correctly',async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={defaultT750SeApCtxData}>
          <NetworkingTab />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      }
    )

    const ipSettingsLink = await screen.findByRole('link', { name: 'IP Settings' })
    const lanPortsLink = await screen.findByRole('link', { name: 'LAN Ports' })
    const meshLink = await screen.findByRole('link', { name: 'Mesh' })
    const dMulicastLink = await screen.findByRole('link', { name: 'Directed Multicast' })
    const smartMonitorLink = screen.queryByRole('link', { name: 'Smart Monitor' })

    expect(ipSettingsLink).toBeVisible()
    expect(await screen.findByTestId('ipSettings')).toBeVisible()

    expect(lanPortsLink).toBeVisible()
    expect(await screen.findByTestId('lanPorts')).toBeVisible()

    expect(meshLink).toBeVisible()
    expect(await screen.findByTestId('apMesh')).toBeVisible()

    expect(dMulicastLink).toBeVisible()
    expect(await screen.findByTestId('directedMulticast')).toBeVisible()

    expect(smartMonitorLink).not.toBeInTheDocument()
  })

  it('should render smart monitor with ap capabilities correctly',async () => {
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.WIFI_R370_TOGGLE
      || ff === Features.WIFI_SMART_MONITOR_DISABLE_WLAN_TOGGLE)
    render(
      <Provider>
        <ApDataContext.Provider value={defaultT750SeApCtxData}>
          <NetworkingTab />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      }
    )

    const smartMonitorLink = await screen.findByRole('link', { name: 'Smart Monitor' })

    expect(smartMonitorLink).toBeVisible()
    expect(await screen.findByTestId('smartMonitor')).toBeVisible()
  })

  it ('save data after config changed', async () => {
    const mockUpdateIpsettings = jest.fn()

    const newEditContextData = {
      tabTitle: 'Networking',
      unsavedTabKey: 'networking',
      isDirty: true
    }

    const newEditNetworkingContextData = {
      updateIpSettings: mockUpdateIpsettings,
      discardIpSettingsChanges: jest.fn(),
      updateLanPorts: jest.fn(),
      discardLanPortsChanges: jest.fn(),
      updateMesh: jest.fn(),
      discardMeshChanges: jest.fn(),
      updateDirectedMulticast: jest.fn(),
      discardDirectedMulticastChanges: jest.fn(),
      updateSmartMonitor: jest.fn(),
      discardSmartMonitorChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editNetworkingContextData: newEditNetworkingContextData,
          setEditNetworkingContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={defaultT750SeApCtxData}>
            <NetworkingTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockUpdateIpsettings).toBeCalled()

  })

  it ('Cancel data after config changed', async () => {
    const mockDiscardIpSettings = jest.fn()

    const newEditContextData = {
      tabTitle: 'Networking',
      unsavedTabKey: 'networking',
      isDirty: true
    }

    const newEditNetworkingContextData = {
      updateIpSettings: jest.fn(),
      discardIpSettingsChanges: mockDiscardIpSettings,
      updateLanPorts: jest.fn(),
      discardLanPortsChanges: jest.fn(),
      updateMesh: jest.fn(),
      discardMeshChanges: jest.fn(),
      updateDirectedMulticast: jest.fn(),
      discardDirectedMulticastChanges: jest.fn(),
      updateSmartMonitor: jest.fn(),
      discardSmartMonitorChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editNetworkingContextData: newEditNetworkingContextData,
          setEditNetworkingContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <NetworkingTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockDiscardIpSettings).toBeCalled()

  })
})
