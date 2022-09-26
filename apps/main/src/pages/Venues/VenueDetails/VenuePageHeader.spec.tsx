import { rest } from 'msw'

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

jest.mock('socket.io-client')

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
    expect(mockNavigate).toBeCalledWith(expect.objectContaining({
      pathname: '/t/t1/venues/v1/edit/details'
    }))
  })
})
