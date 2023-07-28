import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '..'
import { ApCap_T750SE, ApData_T750SE }  from '../../../__tests__/fixtures'

import { AdvancedTab } from '.'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApLed', () => ({
  ApLed: () => <div data-testid={'apLed'}></div>
}))

jest.mock('./BssColoring', () => ({
  BssColoring: () => <div data-testid={'bssColoring'}></div>
}))

describe('AP advanced Tab', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render correctly',async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{
          apData: ApData_T750SE,
          apCapabilities: ApCap_T750SE }} >
          <AdvancedTab />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      }
    )

    expect(await screen.findByTestId('apLed')).toBeVisible()
    //expect(await screen.findByTestId('bssColoring')).toBeVisible()
  })

  it ('Save data after config changed', async () => {
    const mockUpdateApLed = jest.fn()

    const newEditContextData = {
      tabTitle: 'Advanced',
      unsavedTabKey: 'advanced',
      isDirty: true
    }

    const newEditAdvancedContextData = {
      updateApLed: mockUpdateApLed,
      discardApLedChanges: jest.fn(),
      updateBssColoring: jest.fn(),
      discardBssColoringChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editAdvancedContextData: newEditAdvancedContextData,
          setEditNetworkControlContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <AdvancedTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockUpdateApLed).toBeCalled()

  })

  it ('Cancel data after config changed', async () => {
    const mockDiscardApLedChanges = jest.fn()

    const newEditContextData = {
      tabTitle: 'Advanced',
      unsavedTabKey: 'advanced',
      isDirty: true
    }

    const newEditAdvancedContextData = {
      updateApLed: jest.fn(),
      discardApLedChanges: mockDiscardApLedChanges,
      updateBssColoring: jest.fn(),
      discardBssColoringChanges: jest.fn()
    }

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: newEditContextData,
          setEditContextData: jest.fn(),
          editAdvancedContextData: newEditAdvancedContextData,
          setEditNetworkControlContextData: jest.fn()
        }} >
          <ApDataContext.Provider value={{
            apData: ApData_T750SE,
            apCapabilities: ApCap_T750SE }} >
            <AdvancedTab />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockDiscardApLedChanges).toBeCalled()
  })
})
