import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                               from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import { mockServer, render, screen, mockRestApiQuery } from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'


import { activities, events, eventsMeta } from './__tests__/fixtures'

import { ApTimelineTab } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ActivityTable: () => <div data-testid='ActivityTable'></div>,
  EventTable: () => <div data-testid='EventTable'></div>
}))

const wrapper = (props: { children: JSX.Element }) => <Provider>
  <ApContextProvider {...props} />
</Provider>

describe('ApTimelineTab', ()=>{
  it('should render', async () => {
    const ap = {
      serialNumber: '000000000001',
      venueName: 'Mock-Venue',
      apMac: '00:00:00:00:00:01'
    }

    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 1, page: 1, data: [ap] }))
      ),
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url, (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
    render(<ApTimelineTab />, {
      wrapper,
      route: {
        params: { tenantId: 't1', apId: '000000000001', activeSubTab: 'activities' },
        path: '/:tenantId/t/devices/wifi/:apId/details/timeline/:activeSubTab'
      }
    })

    expect(await screen.findByTestId('ActivityTable')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: /events/i }))

    expect(await screen.findByTestId('EventTable')).toBeVisible()
  })
})
