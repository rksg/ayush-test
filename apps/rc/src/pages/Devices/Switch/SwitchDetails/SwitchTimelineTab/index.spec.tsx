import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                                                          from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { mockRestApiQuery, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { activities, events, eventsMeta } from './__tests__/fixtures'

import { SwitchTimelineTab } from '.'

describe('SwitchTimelineTab', () => {
  it('should render', async () => {
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url, (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
    render(<Provider><SwitchTimelineTab /></Provider>, {
      route: {
        params: {
          tenantId: 't1',
          switchId: 'switchId',
          serialNumber: 'serialNumber',
          activeSubTab: 'activities'
        },
        path: '/t/:tenantId/devices/switch/:switchId/:serialNumber/details/timeline/:activeSubTab'

      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findAllByText('123roam')).toHaveLength(1)
    await userEvent.click(screen.getByRole('tab', { name: /events/i }))
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(await screen.findAllByText('730-11-60')).toHaveLength(4)
  })
})
