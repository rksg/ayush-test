import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { getContainerWithNoChartId } from '../../Mdu360/Widgets/ApplicationCategories/index.spec'

import { mockTopApplications }      from './__tests__/fixtures'
import { useTopNApplicationsQuery } from './services'

import { TopApplications, getTruncatedLegendFormatter } from '.'

jest.mock('./services', () => ({
  useTopNApplicationsQuery: jest.fn()
}))

describe('TopApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      data: mockTopApplications.network.hierarchyNode
    })
    const { container } = render(<TopApplications />, { wrapper: Provider })
    expect(getContainerWithNoChartId(container)).toMatchSnapshot()
  })

  it('should return no data when query response is null', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      data: null
    })
    render(<TopApplications />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should return no data when query response is empty array', async () => {
    (useTopNApplicationsQuery as jest.Mock).mockReturnValue({
      data: {
        topNApplicationByTraffic: []
      }
    })
    render(<TopApplications />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})

describe('getTruncatedLegendFormatter', () => {
  const mockChartData = [
    { name: 'Application A', value: 1024 },
    { name: 'Application B', value: 2048 },
    { name: 'Application C', value: 512 }
  ]

  it('should format legend with short name without truncation', () => {
    const formatter = getTruncatedLegendFormatter(mockChartData, 300)
    const result = formatter('Application A')

    expect(result).toBe('{legendNormal|Appli…:} {legendBold|1 KB}')
  })

  it('should truncate long name and add ellipsis', () => {
    const formatter = getTruncatedLegendFormatter(mockChartData, 100)
    const longName = 'This is a very long application name that should be truncated'
    const result = formatter(longName)

    expect(result).toContain('…')
    expect(result).toContain('{legendBold|0 B}')
  })

  it('should handle different width breakpoints for character width calculation', () => {
    const formatterLarge = getTruncatedLegendFormatter(mockChartData, 830)
    const resultLarge = formatterLarge('Application A')
    expect(resultLarge).toBe('{legendNormal|Application A:} {legendBold|1 KB}')

    const formatterMedium = getTruncatedLegendFormatter(mockChartData, 600)
    const resultMedium = formatterMedium('Application A')
    expect(resultMedium).toBe('{legendNormal|Application A:} {legendBold|1 KB}')

    const formatterSmall = getTruncatedLegendFormatter(mockChartData, 500)
    const resultSmall = formatterSmall('Application A')
    expect(resultSmall).toBe('{legendNormal|Applicat…:} {legendBold|1 KB}')
  })

  it('should handle empty chart data', () => {
    const formatter = getTruncatedLegendFormatter([], 300)
    const result = formatter('Application B')

    expect(result).toBe('{legendNormal|Appli…:} {legendBold|0 B}')
  })
})
