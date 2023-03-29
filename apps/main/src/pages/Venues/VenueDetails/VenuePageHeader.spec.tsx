import { rest } from 'msw'

import { useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { venueDetailHeaderData } from '../__tests__/fixtures'

import VenuePageHeader from './VenuePageHeader'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('VenuePageHeader', () => {
  beforeEach(() => store.dispatch(venueApi.util.resetApiState()))

  it('navigate to edit when configure clicked', async () => {

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (_, res, ctx) => res(ctx.json(venueDetailHeaderData))
      )
    )
    const params = { tenantId: 't1', venueId: 'v1' }
    render(<VenuePageHeader />, { route: { params }, wrapper: Provider })

    fireEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    // expect(mockNavigate).toBeCalledWith(expect.objectContaining({
    //   pathname: '/t/t1/venues/v1/edit/details'
    // }))
    expect(mockNavigate).toBeCalledTimes(1)
  })

  it('render correctly with valid toggle', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (_, res, ctx) => res(ctx.json(venueDetailHeaderData))
      )
    )
    const params = { tenantId: 't1', venueId: 'v1', activeTab: 'overview' }
    render(<VenuePageHeader />, { route: { params }, wrapper: Provider })
    const dateFilter = await screen.findByPlaceholderText('Start date')
    expect(dateFilter).toBeInTheDocument()
  })
})
