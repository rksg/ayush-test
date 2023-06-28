/* eslint-disable max-len */
import { EdgeResourceUtilizationEnum } from '@acx-ui/rc/utils'
import { Provider  }                   from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'


import { tenantID, currentEdge } from '../__tests__/fixtures'

import { EdgeSysResourceBox } from './'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  components.Typography.Text = (props: React.PropsWithChildren<{ className?:string }>) => {
    return <div className={props.className} data-testid='rc-text'>{props.children}</div>
  }
  return { ...components }
})

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
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    let targetBox = await screen.findByText('Storage Usage')
    expect(targetBox.parentElement?.getElementsByClassName('ant-statistic-content-value')[0].textContent).toBe('250GB')
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
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
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
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
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
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    const exptectedUsedStr = '(0%)'
    const textDatas = await screen.findAllByTestId('rc-text')
    textDatas.forEach((ele) => {
      let expectedStr
      if (ele.className === 'value') {
        expectedStr = '0'
      } else {
        expectedStr = 'B'
      }

      expect(ele.textContent).toBe(expectedStr)
    })

    await screen.findByText(exptectedUsedStr)
  })

  it('should correctly render CPU utilization', async () => {
    render(
      <Provider>
        <EdgeSysResourceBox
          isLoading={false}
          type={EdgeResourceUtilizationEnum.CPU}
          title='CPU Usage'
          value={currentEdge?.cpuUsedPercentage}
        />
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    let targetBox = await screen.findByText('CPU Usage')
    const targetElem = targetBox.parentElement?.getElementsByClassName('ant-statistic-content-value')[0]
    expect(targetElem?.textContent).toBe('92%')
  })
})