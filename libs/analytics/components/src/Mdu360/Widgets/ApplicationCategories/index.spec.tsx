import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ApplicationCategoriesData, useTopNApplicationCategoriesQuery } from './services'

import { ApplicationCategories, ApplicationCategoriesFilters } from './index'

const mockUseTopNApplicationCategoriesQuery = useTopNApplicationCategoriesQuery as jest.Mock
jest.mock('./services', () => ({
  useTopNApplicationCategoriesQuery: jest.fn()
}))

const mockFilters: ApplicationCategoriesFilters = {
  startDate: '2024-03-23T07:23:00+05:30',
  endDate: '2025-05-24T07:23:00+05:30'
}

const mockTop10ApplicationCategories: ApplicationCategoriesData = {
  clientCount: [
    { name: 'Application Service', value: 6 },
    { name: 'Unknown', value: 6 },
    { name: 'Web', value: 6 },
    { name: 'Instant Messaging', value: 4 },
    { name: 'Network Management', value: 4 },
    { name: 'Network Service', value: 4 },
    { name: 'Webmail', value: 2 },
    { name: 'Education', value: 20 },
    { name: 'Medicine', value: 5 },
    { name: 'Transportation', value: 12 }
  ],
  dataUsage: [
    { name: 'Application Service', value: 24605875 },
    { name: 'Unknown', value: 735023714 },
    { name: 'Web', value: 25794416527 },
    { name: 'Instant Messaging', value: 833554 },
    { name: 'Network Management', value: 6574 },
    { name: 'Network Service', value: 540313 },
    { name: 'Webmail', value: 1010014 },
    { name: 'Education', value: 310014112 },
    { name: 'Medicine', value: 10100140 },
    { name: 'Transportation', value: 4400000 }
  ]
}

const mockEmptyTop10ApplicationCategories: ApplicationCategoriesData = {
  clientCount: [],
  dataUsage: []
}

export function getContainerWithNoChartId (container: HTMLElement) {
  const echartsInstances = container.querySelectorAll('[_echarts_instance_]')
  echartsInstances.forEach((element) =>
    element.removeAttribute('_echarts_instance_')
  )
  const sizeSensorElements = container.querySelectorAll('[size-sensor-id]')
  sizeSensorElements.forEach(element => element.removeAttribute('size-sensor-id'))

  return container
}

describe('ApplicationCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render top 10 application categories correctly', async () => {
    mockUseTopNApplicationCategoriesQuery.mockReturnValue({
      data: mockTop10ApplicationCategories
    })

    const { container } = render(
      <ApplicationCategories filters={mockFilters} />,
      { wrapper: Provider }
    )
    expect(getContainerWithNoChartId(container)).toMatchSnapshot('clientCount')
    const dataUsageSwitch = await screen.findByRole('radio', { name: 'Data Usage' })
    fireEvent.click(dataUsageSwitch)
    expect(getContainerWithNoChartId(container)).toMatchSnapshot('dataUsage')
  })

  it('should return no data when query response is null', async () => {
    mockUseTopNApplicationCategoriesQuery.mockReturnValue({
      data: null
    })

    render(<ApplicationCategories filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should return no data when query response is empty array', async () => {
    mockUseTopNApplicationCategoriesQuery.mockReturnValue({
      data: mockEmptyTop10ApplicationCategories
    })

    render(<ApplicationCategories filters={mockFilters} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
