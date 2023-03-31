import '@testing-library/jest-dom'

import { CommonUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/eventsFixtures'
import { Events }             from './Events'

const params = { tenantId: 'tenant-id' }

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: {
    detailLevel: 'it',
    dateFormat: 'mm/dd/yyyy'
  } })
}))

describe('Events', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', events)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMeta)
  })

  it('should render activity list', async () => {
    render(<Events />, { route: { params }, wrapper: Provider })
    await screen.findByRole('row', {
      name: /AP 730-11-60 RF operating channel was changed from channel 7 to channel 9./
    })
  })
})
