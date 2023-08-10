import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '..'
import { ApCap_T750SE, ApData_T750SE }  from '../../../__tests__/fixtures'

import { NetworkControlTab } from '.'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApSnmp', () => ({
  ApSnmp: () => <div data-testid={'apSnmp'}></div>
}))

jest.mock('./MdnsProxy/MdnsProxy', () => ({
  MdnsProxy: () => <div data-testid={'mdnsProxy'}></div>
}))

describe('AP Network control Tab', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render correctly',async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{
          apData: ApData_T750SE,
          apCapabilities: ApCap_T750SE }} >
          <NetworkControlTab />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      }
    )

    expect(await screen.findByRole('link', { name: 'AP SNMP' })).toBeVisible()
    expect(await screen.findByTestId('apSnmp')).toBeVisible()

    expect(await screen.findByRole('link', { name: 'mDNS Proxy' })).toBeVisible()
    expect(await screen.findByTestId('mdnsProxy')).toBeVisible()
  })

  it ('save data after config changed', async () => {
    const mockUpdateMdnsProxy = jest.fn()

    const newEditContextData = {
      tabTitle: 'Network Control',
      unsavedTabKey: 'networkControl',
      isDirty: true
    }

    const newEditNetworkControlContextData = {
      updateMdnsProxy: mockUpdateMdnsProxy,
      discardMdnsProxyChanges: jest.fn(),
      updateApSnmp: jest.fn(),
      discardApSnmpChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editNetworkControlContextData: newEditNetworkControlContextData,
          setEditNetworkControlContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <NetworkControlTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockUpdateMdnsProxy).toBeCalled()

  })

  it ('Cancel data after config changed', async () => {
    const mockDiscardMdnsProxyChanges = jest.fn()

    const newEditContextData = {
      tabTitle: 'Network Control',
      unsavedTabKey: 'networkControl',
      isDirty: true
    }

    const newEditNetworkControlContextData = {
      updateMdnsProxy: jest.fn(),
      discardMdnsProxyChanges: mockDiscardMdnsProxyChanges,
      updateApSnmp: jest.fn(),
      discardApSnmpChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editNetworkControlContextData: newEditNetworkControlContextData,
          setEditNetworkControlContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <NetworkControlTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockDiscardMdnsProxyChanges).toBeCalled()

  })
})
