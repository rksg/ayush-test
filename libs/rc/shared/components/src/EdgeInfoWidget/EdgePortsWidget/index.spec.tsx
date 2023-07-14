import userEvent from '@testing-library/user-event'

import { EdgePortAdminStatusEnum } from '@acx-ui/rc/utils'
import { Provider  }               from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { edgePortsSetting } from '../__tests__/fixtures'

import { EdgePortsWidget, getPortsAdminStatusChartData } from '.'

jest.mock('./EdgeOverviewDonutWidget', () => ({
  EdgeOverviewDonutWidget: (props: { onClick: () => void }) =>
    <div data-testid='rc-EdgeOverviewDonutWidget' onClick={props.onClick} />
}))

describe('Edge Ports Widget', () => {
  it('should call click handler', async () => {
    const mockedOnClick = jest.fn()
    render(
      <Provider>
        <EdgePortsWidget
          isLoading={false}
          edgePortsSetting={edgePortsSetting}
          onClick={mockedOnClick}
        />
      </Provider>)

    const chart = await screen.findByTestId('rc-EdgeOverviewDonutWidget')
    expect(chart).toBeVisible()
    await userEvent.click(chart)
    await waitFor(() => {
      expect(mockedOnClick).toBeCalled()
    })
  })

  describe('Edge Ports Widget - chart data formmater', () => {
    it('should return correct formatted data', async () => {
      expect(getPortsAdminStatusChartData(edgePortsSetting)).toEqual([{
        color: '#23AB36',
        name: 'Enabled',
        value: 1
      },{
        color: '#FF9D49',
        name: 'Disabled',
        value: 1
      }])

      // if only has Enabled data in summary
      expect(getPortsAdminStatusChartData(edgePortsSetting.filter(item =>
        item.adminStatus === EdgePortAdminStatusEnum.Enabled))).toEqual([{
        color: '#23AB36',
        name: 'Enabled',
        value: 1
      }])
    })
    it('should return empty array if no data', ()=>{
      expect(getPortsAdminStatusChartData(undefined)).toEqual([])
    })
  })
})