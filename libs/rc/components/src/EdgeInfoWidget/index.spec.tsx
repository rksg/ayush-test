/* eslint-disable max-len */
import { Alarm }     from '@acx-ui/rc/utils'
import { Provider  } from '@acx-ui/store'
import { render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'


import { tenantID, currentEdge, edgePortsSetting, alarmList, edgeDnsServers } from './__tests__/fixtures'

import { EdgeInfoWidget, getChartData } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Information Widget', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: tenantID, serialNumber: currentEdge.serialNumber }


  it('should render ports donut chart correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isEdgeStatusLoading={false} isPortListLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    expect(asFragment().querySelector('svg')).toBeDefined()
  })


  it('should display drawer when clicked on ports donut chart', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isEdgeStatusLoading={false} isPortListLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    const firstRender = asFragment()
    expect(firstRender.querySelector('svg')).toBeDefined()
    expect(firstRender.querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(1)
    let target = firstRender.querySelectorAll('path[stroke-linejoin="round"]')
    expect(target.length).toBe(2)
    fireEvent.click(firstRender.querySelectorAll('path[stroke-linejoin="round"]')[0])
  })

  it('should display loading icon while waiting for response', async () => {
    render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isEdgeStatusLoading={true} isPortListLoading={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    expect(await screen.findAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

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