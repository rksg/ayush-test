import '@testing-library/jest-dom'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueEditContext } from '../index'

import { WifiConfigTab } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./RadioTab/RadioTab', () => ({
  RadioTab: () => <div data-testid='radio-tab' />
}))

describe('WifiConfigTab', () => {
  it('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData: {},
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <WifiConfigTab />
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })
    await screen.findByRole('tab', { name: 'Radio' })
    await screen.findByRole('tab', { name: 'Networking' })
    await screen.findByRole('tab', { name: 'Security' })
    await screen.findByRole('tab', { name: 'Network Controls' })
    await screen.findByRole('tab', { name: 'Advanced Settings' })

    fireEvent.click(await screen.findByRole('tab', { name: 'Security' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/edit/wifi/security`,
      hash: '',
      search: ''
    })
  })
})
