import { rest } from 'msw'

import {  Alarm, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import { render,
  mockServer,
  screen,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import VenueAlarmWidget, { getChartData } from '.'

const alarmList = {
  data: [
    {
      severity: 'Critical',
      serialNumber: 'FEK3230S0A2',
      entityType: 'SWITCH',
      switchMacAddress: '58:fb:96:0e:81:b2',
      startTime: 1659948103000,
      entityId: 'FEK3230S0A2',
      id: 'FEK3230S0A2_switch_status',
      message: '{ "message_template": "@@switchName update failed." }'
    },
    {
      severity: 'Major',
      serialNumber: 'FEK3224R08J',
      entityType: 'AP',
      startTime: 1657686000000,
      entityId: 'FEK3224R08J',
      id: 'FEK3224R08J_ap_status',
      message: '{ "message_template": "@@apName disconnected." }'
    }
  ] as Alarm[]
}

const alarmListMeta = {
  data: [
    {
      switchName: 'Some_Switch',
      id: 'FEK3230S0A2_switch_status',
      isSwitchExists: true
    },
    {
      apName: 'Some_AP',
      id: 'FEK3224R08J_ap_status'
    }
  ],
  fields: [
    'venueName',
    'apName',
    'switchName'
  ]
}

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('Venue Overview Alarm Widget', () => {

  it('should render chart correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (_, res, ctx) => res(ctx.json(alarmList))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (_, res, ctx) => res(ctx.json(alarmListMeta))
      )
    )

    const { asFragment } = render(
      <Provider>
        <VenueAlarmWidget />
      </Provider>,
      { route: { params } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Alarms')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('should render "No active alarms" when no alarms exist', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )

    const { asFragment } = render(
      <Provider>
        <VenueAlarmWidget />
      </Provider>,
      { route: { params } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('getChartData', () => {
  it('should return correct formatted data', async () => {
    expect(getChartData(alarmList.data)).toEqual([{
      color: '#ED1C24',
      name: 'Critical',
      value: 1
    },{
      color: '#FF9D49',
      name: 'Major',
      value: 1
    }])

    // Filter Major
    expect(getChartData(alarmList.data.filter(
      alarm => alarm.severity === 'Critical'))).toEqual([{
      color: '#ED1C24',
      name: 'Critical',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getChartData(null as unknown as Alarm[])).toEqual([])
  })
})
