import '@testing-library/jest-dom'
import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { VenueDetailHeader }                  from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import { RolesEnum }                          from '@acx-ui/types'
import { getUserProfile, setUserProfile }     from '@acx-ui/user'

import { venueDetailHeaderData } from '../__tests__/fixtures'

import VenueTabs from './VenueTabs'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('VenueTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <VenueTabs venueDetail={venueDetailHeaderData as unknown as VenueDetailHeader} />
    </Provider>, { route: { params } })
    expect(screen.getAllByRole('tab')).toHaveLength(6)
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <VenueTabs venueDetail={venueDetailHeaderData as unknown as VenueDetailHeader} />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Networks (1)'))
    fireEvent.click(await screen.findByText('Networks (1)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/venue-details/networks`,
      hash: '',
      search: ''
    })
  })

  it('should render service tab', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VenueTabs venueDetail={venueDetailHeaderData as unknown as VenueDetailHeader} />
    </Provider>, { route: { params } })
    await screen.findByText('Services')
  })

  it('should hide analytics when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    render(<Provider>
      <VenueTabs venueDetail={venueDetailHeaderData as unknown as VenueDetailHeader} />
    </Provider>, { route: { params } })
    expect(screen.queryByText('AI Analytics')).toBeNull()
  })
})
