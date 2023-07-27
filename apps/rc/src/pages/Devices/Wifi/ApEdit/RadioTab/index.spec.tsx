import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '..'
import { ApCap_T750SE, ApData_T750SE }  from '../../../__tests__/fixtures'

import { RadioTab } from '.'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./RadioSettings/RadioSettings', () => ({
  RadioSettings: () => <div data-testid={'radioSettings'}></div>
}))

describe('AP Radio Tab', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render correctly',async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{
          apData: ApData_T750SE,
          apCapabilities: ApCap_T750SE }} >
          <RadioTab />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/radio' }
      }
    )

    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio Settings' })).toBeVisible()
    expect(await screen.findByTestId('radioSettings')).toBeVisible()
  })

  it ('save data after config changed', async () => {
    const mockUpdateWifiRadio = jest.fn()

    const newEditContextData = {
      tabTitle: 'Radio',
      unsavedTabKey: 'radio',
      isDirty: true
    }

    const newEditRadioContextData = {
      updateWifiRadio: mockUpdateWifiRadio,
      discardWifiRadioChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editRadioContextData: newEditRadioContextData,
          setEditNetworkControlContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <RadioTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/radio' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockUpdateWifiRadio).toBeCalled()

  })

  it ('Cancel data after config changed', async () => {
    const mockDiscardWifiRadioChanges = jest.fn()

    const newEditContextData = {
      tabTitle: 'Radio',
      unsavedTabKey: 'radio',
      isDirty: true
    }

    const newEditRadioContextData = {
      updateWifiRadio: jest.fn(),
      discardWifiRadioChanges: mockDiscardWifiRadioChanges
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editRadioContextData: newEditRadioContextData,
          setEditNetworkControlContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <RadioTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/radio' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockDiscardWifiRadioChanges).toBeCalled()

  })
})
