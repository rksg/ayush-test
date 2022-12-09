import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { CommonUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/eventsFixtures'
import { Events }             from './Events'

const params = { tenantId: 'tenant-id' }

describe('Events', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', events)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMeta)
  })

  it('should render activity list', async () => {
    render(
      <Provider>
        <Events />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'AP 730-11-60 RF operating channel was changed from channel 7 to channel 9.'
    )
  })

  it('should open/close activity drawer', async () => {
    render(
      <Provider>
        <Events />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'AP 730-11-60 RF operating channel was changed from channel 7 to channel 9.'
    )
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    screen.getByText('Event Details')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Activity Details')).toBeNull()
  })
})
