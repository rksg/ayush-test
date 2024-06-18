import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonRbacUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import {
  mockServer,
  mockRestApiQuery,
  render,
  screen
} from '@acx-ui/test-utils'

import { alarmList }         from './__tests__/alarmListFixtures'
import { alarmMeta }         from './__tests__/alarmMetaFixtures'
import { dashboardOverview } from './__tests__/dashboardOverviewFixtures'
import AlarmsButton          from './AlarmsButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

const venueList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '81bcdd47ae0a49c2b2bab470ceb9e24d',
      name: 'test_US',
      country: 'United States'
    },
    {
      id: '0bac1d1f17644dd39090bee1b204a637',
      name: 'new venue 2',
      country: 'United States'
    },
    {
      id: '33292ac6f6ac4c75953da823b93d094f',
      name: 'test',
      country: 'Hong Kong'
    }
  ]
}

describe('AlarmsButton', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(dashboardOverview))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venueList))
      ),
      rest.delete(
        CommonRbacUrlsInfo.clearAlarmByVenue.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.patch(
        CommonUrlsInfo.clearAlarm.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    mockRestApiQuery(CommonUrlsInfo.getAlarmsList.url, 'post', alarmList)
    mockRestApiQuery(CommonUrlsInfo.getAlarmsListMeta.url, 'post', alarmMeta)
  })

  it('should render AlarmsButton correctly', async () => {
    render(<Provider>
      <AlarmsButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('testamy_ap')).toBeVisible()
    const cancelButton = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(cancelButton)
    await userEvent.click((await screen.findAllByTitle('All Severities'))[0])
    await userEvent.click((await screen.findAllByTitle('Major'))[0])
    await userEvent.click((await screen.findByText('Clear all alarms')))
  })
})
