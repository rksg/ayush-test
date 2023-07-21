import { DonutChartData }            from '@acx-ui/components'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { EdgeOverviewDonutWidget } from '.'

const mockedChartData = [{
  color: '#23AB36',
  name: 'Enabled',
  value: 1
},{
  color: '#FF9D49',
  name: 'Disabled',
  value: 1
}] as DonutChartData[]
const mockedOnClick = jest.fn()
describe('Edge Overview Donut Chart', () => {
  it('should correctly render', async () => {
    const mockedOnClick = jest.fn()
    const { asFragment } = render(
      <EdgeOverviewDonutWidget
        title='Ports'
        data={mockedChartData}
        isLoading={false}
        emptyMessage='No data'
        onClick={mockedOnClick}
      />)

    const firstRender = asFragment()
    expect(firstRender.querySelector('svg')).toBeDefined()
    expect(firstRender.querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(1)
    let target = firstRender.querySelectorAll('path[stroke-linejoin="round"]')
    expect(target.length).toBe(2)
    fireEvent.click(firstRender.querySelectorAll('div[_echarts_instance_^="ec_"]')[0])
  })

  it('should display no data', async () => {
    render(<EdgeOverviewDonutWidget
      title='Ports'
      data={[] as DonutChartData[]}
      isLoading={false}
      emptyMessage='No data'
      onClick={mockedOnClick}
    />)

    const noDataMsg = await screen.findByText('No data')
    expect(noDataMsg).toBeVisible()
  })

  it('should handle undefined data', async () => {
    render(<EdgeOverviewDonutWidget
      title='Ports'
      data={undefined}
      isLoading={false}
      emptyMessage='No ports data'
      onClick={mockedOnClick}
    />)

    const noDataMsg = await screen.findByText('No ports data')
    expect(noDataMsg).toBeVisible()
  })

  it('should display loading icon while waiting for response', async () => {
    render(<EdgeOverviewDonutWidget
      title='Ports'
      data={undefined}
      isLoading={true}
      emptyMessage='No data'
      onClick={mockedOnClick}
    />)

    expect(await screen.findByRole('img', { name: 'loader' })).toBeVisible()
  })
})