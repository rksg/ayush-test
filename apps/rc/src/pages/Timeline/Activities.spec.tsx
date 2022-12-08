import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

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
    await screen.findByText('Network \'123roam\' was updated')
  })

  it('should open/close activity drawer', async () => {
    render(
      <Provider>
        <Activities />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText('Network \'123roam\' was updated')
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    screen.getByText('Activity Details')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Activity Details')).toBeNull()
  })
})
