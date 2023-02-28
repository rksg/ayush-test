import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                                                          from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, mockRestApiQuery } from '@acx-ui/test-utils'

import { activities, events, eventsMeta } from './__tests__/fixtures'

import { ApTimelineTab } from '.'

describe('ApTimelineTab', ()=>{
  it('should render', async () => {
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url, (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
    render(<Provider><ApTimelineTab /></Provider>, {
      route: {
        params: { tenantId: 't1', serialNumber: 'serialNumber', activeSubTab: 'activities' },
        path: '/t/:tenantId/devices/wifi/:serialNumber/details/timeline/:activeSubTab'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findAllByText('123roam')).toHaveLength(1)
    await userEvent.click(screen.getByRole('tab', { name: /events/i }))
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(await screen.findAllByText('730-11-60')).toHaveLength(4)
  })
})
