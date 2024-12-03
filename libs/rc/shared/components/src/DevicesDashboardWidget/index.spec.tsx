import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import { render,
  screen,
  mockRestApiQuery
} from '@acx-ui/test-utils'

import { DevicesDashboardWidgetV2 } from '.'

const params = {
  tenantId: 'tenant-id'
}

jest.mock('../DevicesWidget/index', () => ({
  DevicesWidgetv2: () => <div>Mock DevicesWidget</div>
}))

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

describe('Dashboard Devices Widget V2', () => {
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DASHBOARD_NEW_API_TOGGLE)
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDeviceSummaries.url, 'post',{})
  })

  it('should render loader and then chart', async () => {
    render(<Provider><DevicesDashboardWidgetV2 /></Provider>,
      { route: { params } })
    expect(await screen.findByText('Mock DevicesWidget')).toBeInTheDocument()
  })
})