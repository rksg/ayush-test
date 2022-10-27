import '@testing-library/jest-dom'
import { VenueDetailHeader }                  from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import {
  venueDetailHeaderData
} from '../__tests__/fixtures'

import VenueTabs from './VenueTabs'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('VenueTabs', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider>
      <VenueTabs venueDetail={venueDetailHeaderData as unknown as VenueDetailHeader} />
    </Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <VenueTabs venueDetail={venueDetailHeaderData as unknown as VenueDetailHeader}/>
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Clients (2)'))
    fireEvent.click(await screen.findByText('Clients (2)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/clients`,
      hash: '',
      search: ''
    })
  })
})
