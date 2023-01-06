import { rest }    from 'msw'
import * as router from 'react-router-dom'

import { CommonUrlsInfo }                                        from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/fixtures'

import { VenueTimelineTab } from '.'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn()
}))

describe('VenueTimelineTab', () => {
  it('should render', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1', venueId: 'venueId' })
    )
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url, (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
    render(<Provider><VenueTimelineTab /></Provider>, {
      route: {
        params: { tenantId: 't1', venueId: 'venueId' },
        path: '/t/:tenantId/venues/:venueId/venue-details/timeline/'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findAllByText('730-11-60')).toHaveLength(2)
  })
})
