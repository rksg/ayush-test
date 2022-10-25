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

describe('WifiConfigTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
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
    await screen.findByRole('tab', { name: 'External Servers' })
    await screen.findByRole('tab', { name: 'Advanced Settings' })
    await screen.findByText('AP Model')
    expect(asFragment()).toMatchSnapshot()

    fireEvent.click(await screen.findByRole('tab', { name: 'Security' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/edit/wifi/security`,
      hash: '',
      search: ''
    })
  })
})
