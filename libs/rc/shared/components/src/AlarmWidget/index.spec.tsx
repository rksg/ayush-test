import { omit } from 'lodash'
import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }          from '@acx-ui/store'
import { render,
  mockServer,
  screen,
  fireEvent,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { data, noAlarms, alarmListMeta, alarmList } from './__tests__/fixtures'

import { AlarmWidget, AlarmWidgetV2, getAlarmsDonutChartData } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDashboardFilter: () => ({
    filters: {
      filter: {
        networkNodes: [
          {
            0: {
              name: 'Venue A',
              id: 'venue_a'
            },
            1: {
              name: 'Subnet 1',
              id: 'subnet_1'
            }
          }
        ]
      }
    }
  })
}))

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
      pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t/devices/wifi/FEK3224R08J/details/overview',
      search: ''
    })
    fireEvent.click(await screen.findByText('Some_Switch'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      hash: '',
      // eslint-disable-next-line max-len
      pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t/devices/switch/58:fb:96:0e:81:b2/FEK3230S0A2/details/overview',
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

describe('Alarm widget v2', () => {
  let params: { tenantId: string }

  it('should render donut chart and alarm list', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getDashboardV2Overview.url,
        (req, res, ctx) => res(ctx.json(data)))
    )

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(
      <Provider>
        <AlarmWidgetV2 />
      </Provider>,
      { route: { params, path: '/:tenantId' } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Alarms')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('should render "No active alarms" when no alarms exist', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getDashboardV2Overview.url,
        (req, res, ctx) => res(ctx.json(noAlarms)))
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    const { asFragment } = render(
      <Provider>
        <AlarmWidgetV2 />
      </Provider>,
      { route: { params, path: '/:tenantId' } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})
