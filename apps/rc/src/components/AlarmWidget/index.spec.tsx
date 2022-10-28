import { omit } from 'lodash'
import { rest } from 'msw'

import { Dashboard, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }                 from '@acx-ui/store'
import { render,
  mockServer,
  screen,
  fireEvent,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import AlarmWidget, { getAlarmsDonutChartData } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const data: Dashboard = {
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

const noAlarms : Dashboard = {
  summary: {
    alarms: {
      summary: {},
      totalCount: 0
    }
  }
}

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
  ]
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

describe('Alarm widget', () => {
  let params: { tenantId: string }

  it('should render donut chart and alarm list', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json(alarmList))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (req, res, ctx) => res(ctx.json(alarmListMeta))
      ),
      rest.get(CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(data)))
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(
      <Provider>
        <AlarmWidget />
      </Provider>,
      { route: { params, path: '/:tenantId' } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Alarms')
    expect(asFragment().querySelector('svg')).toBeDefined()

    fireEvent.click(await screen.findByText('Some_AP'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '/t/ecc2d7cf9d2342fdb31ae0e24958fcac/aps/FEK3224R08J/TBD',
      search: ''
    })
    fireEvent.click(await screen.findByText('Some_Switch'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '/t/ecc2d7cf9d2342fdb31ae0e24958fcac/switches/FEK3230S0A2/TBD',
      search: ''
    })
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
      ),
      rest.get(CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(noAlarms)))
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(
      <Provider>
        <AlarmWidget />
      </Provider>,
      { route: { params, path: '/:tenantId' } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('getAlarmsDonutChartData', () => {
  it('should return correct formatted data', async () => {
    expect(getAlarmsDonutChartData(data)).toEqual([{
      color: '#ED1C24',
      name: 'Critical',
      value: 1
    },{
      color: '#FF9D49',
      name: 'Major',
      value: 1
    }])

    // Remove Major
    const modifiedData = omit(data, 'summary.alarms.summary.major')
    expect(getAlarmsDonutChartData(modifiedData)).toEqual([{
      color: '#ED1C24',
      name: 'Critical',
      value: 1
    }])
  })
  it('should return empty array if no data', ()=>{
    expect(getAlarmsDonutChartData())
      .toEqual([])
  })
})
