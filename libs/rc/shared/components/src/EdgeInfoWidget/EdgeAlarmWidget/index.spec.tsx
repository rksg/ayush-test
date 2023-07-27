import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider  }                           from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { alarmList, alarmListMeta } from '../__tests__/fixtures'

import { EdgeAlarmWidget, getAlarmChartData } from '.'

jest.mock('./EdgeOverviewDonutWidget', () => ({
  EdgeOverviewDonutWidget: (props: { onClick: () => void }) =>
    <div data-testid='rc-EdgeOverviewDonutWidget' onClick={props.onClick} />
}))
jest.mock('../../AlarmsDrawer', () => ({
  ...jest.requireActual('../../AlarmsDrawer'),
  AlarmsDrawer: () => <div data-testid='rc-AlarmsDrawer' />
}))

const mockedAPIFn = jest.fn()
describe('Edge Alarm Widget', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'mocked-tenant', serialNumber: 'mocked-edge' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => {
          mockedAPIFn()
          return res(ctx.json(alarmList))
        }
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (req, res, ctx) => res(ctx.json(alarmListMeta))
      )
    )
  })

  it('should be able to open alarm drawer', async () => {
    render(
      <Provider>
        <EdgeAlarmWidget
          isLoading={false}
          serialNumber='mocked-edge'
        />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    // wait for alarm API response
    await waitFor(() => {
      expect(mockedAPIFn).toBeCalled()
    })
    const chart = await screen.findByTestId('rc-EdgeOverviewDonutWidget')
    expect(chart).toBeVisible()
    await userEvent.click(chart)
    await waitFor(async () => {
      expect(await screen.findByTestId('rc-AlarmsDrawer')).toBeVisible()
    })
  })

  describe('Edge Alarm Widget - chart data formmater', () => {
    it('should return correct formatted data', async () => {
      expect(getAlarmChartData(alarmList.data)).toEqual([{
        color: '#ED1C24',
        name: 'Critical',
        value: 1
      },{
        color: '#FF9D49',
        name: 'Major',
        value: 1
      }])

      // Filter Major
      expect(getAlarmChartData(alarmList.data.filter(
        alarm => alarm.severity === 'Critical'))).toEqual([{
        color: '#ED1C24',
        name: 'Critical',
        value: 1
      }])
    })

    it('should return empty array if no data', ()=>{
      expect(getAlarmChartData(undefined)).toEqual([])
    })
  })
})