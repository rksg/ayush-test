import '@testing-library/jest-dom'

import { CommonUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import { activities } from './__tests__/activitiesFixtures'
import { Activities } from './Activities'

const params = { tenantId: 'tenant-id' }

describe('Activities', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
  })

  it('should render activity list', async () => {
    render(
      <Provider>
        <Activities />
      </Provider>,
      { route: { params } }
    )
    await screen.findByRole('row', { name: /Network ' 123roam ' was updated/ })
    expect((await screen.findAllByText('-')).length).toBe(2)
  })
})
