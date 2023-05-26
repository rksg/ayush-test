import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { EdgeTimeline } from '.'

jest.mock('@acx-ui/rc/components', () => {
  return {
    ...jest.requireActual('@acx-ui/rc/components'),
    ActivityTable: () => <div data-testid='activity-table' />,
    EventTable: () => <div data-testid='event-table' />
  }
})

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('EdgeTimeline', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '0000000030'
    }
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getActivityList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getEventList.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('Active activities tab successfully', async () => {
    params.activeTab = 'timeline'
    params.activeSubTab = 'activities'
    render(
      <Provider>
        <EdgeTimeline />
      </Provider>, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    await screen.findByRole('tab', { name: 'Activities', selected: true })
    expect(await screen.findByTestId('activity-table')).toBeVisible()
  })

  it('Active events tab successfully', async () => {
    params.activeTab = 'timeline'
    params.activeSubTab = 'events'
    render(
      <Provider>
        <EdgeTimeline />
      </Provider>, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    await screen.findByRole('tab', { name: 'Events', selected: true })
    expect(await screen.findByTestId('event-table')).toBeVisible()
  })

  it('Switch tab', async () => {
    params.activeTab = 'timeline'
    params.activeSubTab = 'activities'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeTimeline />
      </Provider>, {
        route: {
          params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('tab', { name: 'Events' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/details/${params.activeTab}/events`,
      hash: '',
      search: ''
    })
  })
})