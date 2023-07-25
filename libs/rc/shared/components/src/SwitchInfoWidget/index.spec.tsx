/* eslint-disable max-len */
import { rest } from 'msw'

import { AnalyticsFilter }                         from '@acx-ui/analytics/utils'
import {  Alarm, CommonUrlsInfo, SwitchViewModel } from '@acx-ui/rc/utils'
import { Provider  }                               from '@acx-ui/store'
import { render,
  mockServer,
  screen,
  fireEvent,
  waitFor } from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { switchDetail, stackDetailData } from './__tests__/fixtures'

import { getChartData, SwitchInfoWidget } from '.'

jest.mock('@acx-ui/analytics/components', () => ({
  IncidentBySeverityDonutChart: () =>
    <div data-testid={'analytics-IncidentBySeverityDonutChart'} title='IncidentBySeverityDonutChart' />
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

const filters:AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'AP', name: '28:B3:71:28:6C:10' }],
  range: DateRange.last24Hours
}

describe('Switch Information Widget', () => {
  const requestMetasSpy = jest.fn()
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (_, res, ctx) => res(ctx.json(alarmList))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (_, res, ctx) => {
          requestMetasSpy()
          return res(ctx.json(alarmListMeta))}
      )
    )
  })
  afterEach(() => {
    requestMetasSpy.mockClear()
  })

  it('should render alarms chart correctly', async () => {
    render(
      <Provider>
        <SwitchInfoWidget switchDetail={switchDetail as unknown as SwitchViewModel} filters={filters}/>
      </Provider>,
      { route: { params } }
    )
    await waitFor(() => expect(requestMetasSpy).toHaveBeenCalledTimes(1))
    await screen.findByText('Alarms')
  })

  it('should render "No active alarms" when no alarms exist', async () => {
    const requestEmptyMetasSpy = jest.fn()
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (req, res, ctx) => {
          requestEmptyMetasSpy()
          return res(ctx.json({ data: [] }))
        }
      )
    )
    render(
      <Provider>
        <SwitchInfoWidget switchDetail={switchDetail as unknown as SwitchViewModel} filters={filters}/>
      </Provider>,
      { route: { params } }
    )
    await waitFor(() => expect(requestEmptyMetasSpy).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('No active alarms')).toBeVisible()
  })

  it('should render switch drawer correctly', async () => {
    render(
      <Provider>
        <SwitchInfoWidget switchDetail={switchDetail as unknown as SwitchViewModel} filters={filters}/>
      </Provider>,
      { route: { params } }
    )
    await waitFor(() => expect(requestMetasSpy).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByText('More Details'))
    expect(screen.getByText('Switch Details')).toBeVisible()
    expect(await screen.findByText('FMF2249Q0JT')).toBeVisible()
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
  })


  it('should render stack drawer correctly', async () => {
    render(
      <Provider>
        <SwitchInfoWidget switchDetail={stackDetailData as unknown as SwitchViewModel} filters={filters} />
      </Provider>,
      { route: { params } }
    )
    await waitFor(() => expect(requestMetasSpy).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByText('More Details'))
    expect(screen.getByText('Stack Details')).toBeVisible()
    expect(await screen.findByText('FEK4224R19X')).toBeVisible()
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
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
