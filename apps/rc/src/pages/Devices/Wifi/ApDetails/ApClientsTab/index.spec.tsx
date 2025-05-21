/* eslint-disable max-len */

import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ApClientsTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ClientDualTable: () => <div data-testid='ClientDualTable' />
}))

jest.mock('@acx-ui/wifi/components', () => ({
  ApWiredClientTable: () => <div data-testid='ApWiredClientTable' />
}))

describe('AP Client Tab', () => {
  let params: { apId: string, activeSubTab?: string } =
  { apId: 'mockApId', activeSubTab: 'wireless' }

  // remove the unit test when the WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE feature flag has been removed
  it('should render correctly without the wired client feature flag', async () => {
    params = { apId: 'mockApId' }

    render(
      <Provider>
        <ApClientsTab />
      </Provider>, {
        route: { params }
      })

    const tab = screen.queryByRole('tab', { name: 'Wireless' })
    expect(tab).not.toBeInTheDocument()
  })

  it('should render correctly when the wired client feature flag is turned On', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)
    render(
      <Provider>
        <ApClientsTab />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Wireless' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()

    const wiredClientTab = screen.getByRole('tab', { name: 'Wired' })
    expect(wiredClientTab).toBeInTheDocument()
    fireEvent.click(wiredClientTab)
    expect(mockedUsedNavigate).toBeCalled()
    expect(wiredClientTab.getAttribute('aria-selected')).toBeTruthy()
  })

})