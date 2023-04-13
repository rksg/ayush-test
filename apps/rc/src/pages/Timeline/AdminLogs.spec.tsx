import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { timelineApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockRestApiQuery, render, screen } from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/adminLogsFixtures'
import { AdminLogs }          from './AdminLogs'

const params = { tenantId: 'tenant-id' }

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: {
    detailLevel: 'it',
    dateFormat: 'mm/dd/yyyy'
  } })
}))

describe('AdminLogs', () => {
  beforeEach(() => {
    store.dispatch(timelineApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getEventList.url, 'post', events)
    mockRestApiQuery(CommonUrlsInfo.getEventListMeta.url, 'post', eventsMeta)
  })

  it('should render activity list', async () => {
    render(<AdminLogs />, { route: { params }, wrapper: Provider })
    await screen.findByText(
      'Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller.'
    )
  })

  it('should render activity drawer', async () => {
    render(<AdminLogs />, { route: { params }, wrapper: Provider })
    await userEvent.click(await screen.findByRole('button', { name: /2023/ }))
    expect(await screen.findByText('Log Details')).toBeVisible()
  })
})
