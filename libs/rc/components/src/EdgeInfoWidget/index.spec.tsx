/* eslint-disable max-len */
import { EdgeResourceUtilizationEnum } from '@acx-ui/rc/utils'
import { Provider  }                   from '@acx-ui/store'
import { render,
  screen,
  fireEvent,
  waitFor } from '@acx-ui/test-utils'
import { formatter } from '@acx-ui/utils'


import { tenantID, currentEdge, edgePortsSetting } from './__tests__/fixtures'
import { EdgeSysResourceBox }                      from './EdgeSysResourceBox'

import { EdgeInfoWidget } from '.'

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
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    expect(asFragment().querySelector('svg')).toBeDefined()
  })


  it('should display drawer when clicked on ports donut chart', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeInfoWidget currentEdge={currentEdge} edgePortsSetting={edgePortsSetting} isLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    const firstRender = asFragment()
    expect(firstRender.querySelector('svg')).toBeDefined()
    expect(firstRender.querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(1)
    let target = firstRender.querySelectorAll('path[stroke-linejoin="round"]')
    expect(target.length).toBe(2)
    fireEvent.click(firstRender.querySelectorAll('path[stroke-linejoin="round"]')[0])
  })
})

describe('Edge resource utilization chart', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: tenantID, serialNumber: currentEdge.serialNumber }

  it('should return number with unit', async () => {
    render(
      <Provider>
        <EdgeSysResourceBox
          type={EdgeResourceUtilizationEnum.STORAGE}
          title={'Storage Usage'}
          value={currentEdge?.diskUsed}
          totalVal={currentEdge?.diskTotal}
        />
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    let targetBox = await screen.findByText('Storage Usage')
    expect(targetBox.parentElement?.getElementsByClassName('ant-statistic-content-value')[0].innerHTML).toBe('162 GB')
  })

  it('should return the expected free value by tooltip', async () => {
    render(
      <Provider>
        <EdgeSysResourceBox
          type={EdgeResourceUtilizationEnum.CPU}
          title={'CPU Usage'}
          value={currentEdge?.cpuUsed}
          totalVal={currentEdge?.cpuTotal}
        />
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    let targetBox = await screen.findByText('CPU Usage')
    fireEvent.mouseOver(targetBox)

    const freeValue = (currentEdge?.cpuTotal ?? 0) - (currentEdge?.cpuUsed ?? 0)
    const exptectedValue = formatter('radioFormat')(freeValue)

    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe(exptectedValue + ' free')
    })
  })
})