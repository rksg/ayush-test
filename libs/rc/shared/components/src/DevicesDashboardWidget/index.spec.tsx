import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }          from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { DevicesDashboardWidget, DevicesDashboardWidgetV2 } from '.'

const params = {
  tenantId: 'tenant-id'
}

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDashboardFilter: () => ({
    filters: {
      filter: {
        networkNodes: [
          {
            0: {
              name: 'Venue A',
              id: 'venue_a'
            },
            1: {
              name: 'Subnet 1',
              id: 'subnet_1'
            }
          }
        ]
      }
    }
  })
}))

describe('Dashboard Devices Widget', () => {

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get',{})
  })

  it('should render loader and then chart', async () => {
    const { asFragment } = render(<Provider><DevicesDashboardWidget /></Provider>,
      { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})

describe('Dashboard Devices Widget V2', () => {

  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardV2Overview.url, 'post',{})
  })

  it('should render loader and then chart', async () => {
    const { asFragment } = render(<Provider><DevicesDashboardWidgetV2 /></Provider>,
      { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})