import { rest } from 'msw'

import { venueApi }                   from '@acx-ui/rc/services'
import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/fixtures'

import { ClientTimelineTab } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EventTable: () => <div data-testid='EventTable'></div>
}))

jest.mock('./SessionTable', () => ({
  SessionTable: () =>
    <div data-testid={'rc-SessionTable'} title='SessionTable' />
}))

describe('ClientTimelineTab', ()=>{
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getEventList.url, (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url, (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
  })
  it('should render: Events', async () => {
    render(<ClientTimelineTab />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't1', clientId: 'clientId' },
        path: '/:tenantId/t/users/wifi/clients/:clientId/details/timeline/'

      }
    })
    expect(await screen.findByTestId('EventTable')).toBeVisible()
  })

  it('should render: Sessions', async () => {
    render(<ClientTimelineTab />, {
      wrapper: Provider,
      route: {
        params: {
          tenantId: 't1',
          clientId: 'clientId',
          activeTab: 'timeline',
          activeSubTab: 'sessions'
        },
        path: '/:tenantId/t/users/wifi/clients/:clientId/details/:activeTab/:activeSubTab'

      }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Completed Sessions')
    expect(await screen.findByTestId('rc-SessionTable')).toBeVisible()
  })
})
