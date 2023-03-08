import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { CommonUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                         from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/adminLogsFixtures'
import { AdminLogs }          from './AdminLogs'

const params = { tenantId: 'tenant-id' }

describe('AdminLogs', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', events)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMeta)
  })

  it('should render activity list', async () => {
    render(
      <Provider>
        <AdminLogs />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.'
    )
  })

  it('should render activity drawer', async () => {
    render(
      <Provider>
        <AdminLogs />
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(await screen.findByRole('button', { name: /2023/ }))
    expect(await screen.findByText('Log Details')).toBeVisible()
  })
})
