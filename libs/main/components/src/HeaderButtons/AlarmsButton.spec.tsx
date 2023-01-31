import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
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

describe('AlarmsButton', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(dashboardOverview))
      )
    )
    mockRestApiQuery(CommonUrlsInfo.getAlarmsList.url, 'post', alarmList)
    mockRestApiQuery(CommonUrlsInfo.getAlarmsListMeta.url, 'post', alarmMeta)
    mockRestApiQuery(CommonUrlsInfo.clearAllAlarm.url, 'delete', {})
  })

  it('should render AlarmsButton correctly', async () => {
    render(<Provider>
      <AlarmsButton/>
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
