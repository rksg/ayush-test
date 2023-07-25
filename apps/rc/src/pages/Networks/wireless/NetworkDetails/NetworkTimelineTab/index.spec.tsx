import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                               from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import { mockServer, render, screen, mockRestApiQuery } from '@acx-ui/test-utils'

import { activities, events, eventsMeta } from './__tests__/fixtures'

import { NetworkTimelineTab } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ActivityTable: () => <div data-testid='ActivityTable'></div>,
  EventTable: () => <div data-testid='EventTable'></div>
}))


describe('NetworkTimelineTab', ()=>{
  it('should render', async () => {
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url, (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
    render(<NetworkTimelineTab />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't1', networkId: 'networkId', activeSubTab: 'activities' },
        path: '/:tenantId/t/networks/wireless/:networkId/network-details/timeline/:activeSubTab'
      }
    })
    expect(await screen.findByTestId('ActivityTable')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /events/i }))
    expect(await screen.findByTestId('EventTable')).toBeVisible()
  })
})
