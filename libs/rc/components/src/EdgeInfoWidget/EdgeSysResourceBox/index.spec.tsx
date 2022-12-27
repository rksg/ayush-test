/* eslint-disable max-len */
import { EdgeResourceUtilizationEnum } from '@acx-ui/rc/utils'
import { Provider  }                   from '@acx-ui/store'
import { render,
  screen,
  fireEvent,
  waitFor } from '@acx-ui/test-utils'


import { tenantID, currentEdge } from '../__tests__/fixtures'

import { EdgeSysResourceBox } from './'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('Edge resource utilization chart', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: tenantID, serialNumber: currentEdge.serialNumber }

  it('should return number with unit', async () => {
    render(
      <Provider>
        <EdgeSysResourceBox
          isLoading={false}
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
          isLoading={false}
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

    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('60 MHz free')
    })
  })

  it('should display used pesentage', async () => {
    const memTotal = 120 * Math.pow(1024, 2)
    const memUsed = 50 * Math.pow(1024, 2)

    render(
      <Provider>
        <EdgeSysResourceBox
          isLoading={false}
          type={EdgeResourceUtilizationEnum.MEMORY}
          title={'Memory Usage'}
          value={memUsed}
          totalVal={memTotal}
        />
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    const exptectedStr = '(42%)'
    expect(await screen.findByText(exptectedStr)).toBeTruthy()
  })

  it('should display 0 used pesentage if totoal value is undefined', async () => {
    const memUsed = 50 * Math.pow(1024, 2)

    render(
      <Provider>
        <EdgeSysResourceBox
          isLoading={false}
          type={EdgeResourceUtilizationEnum.MEMORY}
          title={'Memory Usage'}
          value={memUsed}
        />
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })


    const exptectedStr = '(0%)'
    expect(await screen.findByText(exptectedStr)).toBeTruthy()
  })

  it('should display 0 used pesentage if used value is undefined and total value is valid', async () => {
    const memTotal = 120 * Math.pow(1024, 2)

    render(
      <Provider>
        <EdgeSysResourceBox
          isLoading={false}
          type={EdgeResourceUtilizationEnum.MEMORY}
          title={'Memory Usage'}
          totalVal={memTotal}
        />
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    const exptectedStr = '0 B'
    const exptectedUsedStr = '(0%)'
    expect(await screen.findByText(exptectedStr)).toBeTruthy()
    expect(await screen.findByText(exptectedUsedStr)).toBeTruthy()
  })
})