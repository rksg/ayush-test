import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { getContainerWithNoChartId } from '../../Mdu360/Widgets/ApplicationCategories/index.spec'

import { mockTopApplications }      from './__tests__/fixtures'
import { useTopNApplicationsQuery } from './services'

import { TopApplications } from '.'

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
