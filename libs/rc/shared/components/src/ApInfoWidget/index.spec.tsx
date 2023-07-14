/* eslint-disable max-len */
import { rest } from 'msw'

import { AnalyticsFilter }        from '@acx-ui/analytics/utils'
import {  Alarm, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, dataApiURL  }  from '@acx-ui/store'
import { render,
  mockServer,
  screen,
  waitForElementToBeRemoved,
  mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { currentAP } from './__tests__/fixtures'

import { getChartData, ApInfoWidget } from '.'

jest.mock('@acx-ui/analytics/components', () => ({
  IncidentBySeverityDonutChart: () =>
    <div data-testid={'analytics-IncidentBySeverityDonutChart'} title='IncidentBySeverityDonutChart' />,
  KpiWidget: () => <div data-testid={'analytics-KpiWidget'} title='KpiWidget' />,
  TtcTimeWidget: () => <div data-testid={'analytics-TtcTimeWidget'} title='TtcTimeWidget' />
}))

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

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'ap-serialNumber',
  activeTab: 'overview'
}

const data = {
  summary: {
    alarms: {
      summary: {
        critical: 1,
        major: 1
      },
      totalCount: 2
    }
  }
}

const filters:AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'AP', name: '28:B3:71:28:6C:10' }],
  range: DateRange.last24Hours
}
describe('AP Information Widget', () => {

  it('should render alarms chart correctly', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(data))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (_, res, ctx) => res(ctx.json(alarmList))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (_, res, ctx) => res(ctx.json(alarmListMeta))
      )
    )

    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })

    const { asFragment } = render(
      <Provider>
        <ApInfoWidget currentAP={currentAP} filters={filters}/>
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
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(data))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })

    const { asFragment } = render(
      <Provider>
        <ApInfoWidget currentAP={currentAP} filters={filters}/>
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
