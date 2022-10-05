import '@testing-library/jest-dom'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueEditContext } from '../index'

import { SwitchConfigTab } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('SwitchConfigTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider>
      <VenueEditContext.Provider value={{ editContextData: {}, setEditContextData: jest.fn() }}>
        <SwitchConfigTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByRole('tab', { name: 'General' })
    await screen.findByRole('tab', { name: 'AAA' })
    await screen.findByRole('tab', { name: 'Configuration History' })
    await screen.findByRole('tab', { name: 'Routed Interfaces' })

    fireEvent.click(await screen.findByRole('tab', { name: 'AAA' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/edit/switch/aaa`,
      hash: '',
      search: ''
    })
  })
})
