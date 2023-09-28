import userEvent from '@testing-library/user-event'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { ReportType }                 from '@acx-ui/reports/components'
import { Provider, dataApiSearchURL } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { WifiTabsEnum } from '.'
import { WiFiPage }     from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

describe('WiFi Page', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
  it('should render aps table tab', async () => {
    const apList = { search: {
      aps: [
        {
          apName: 'AL-Guest-R610',
          macAddress: '90:3A:72:24:D0:40',
          apModel: 'R610',
          ipAddress: '192.168.2.105',
          version: '6.1.2.0.580',
          apZone: 'Albert-Home-Main',
          networkPath: [
            {
              name: 'Network',
              type: 'network'
            },
            {
              name: 'vsz34',
              type: 'system'
            },
            {
              name: '04-US-CA-D4-Albert-Home',
              type: 'domain'
            },
            {
              name: 'Albert-Home-Main',
              type: 'zone'
            },
            {
              name: 'default',
              type: 'apGroup'
            },
            {
              name: '90:3A:72:24:D0:40',
              type: 'AP'
            }
          ]
        }
      ]
    }
    }

    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: apList
    })
    render(<WiFiPage tab={WifiTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText(/ap name/i)).toBeVisible()
  })
  it('should render ap report tab', async () => {
    render(<WiFiPage tab={WifiTabsEnum.AP_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.ACCESS_POINT)).toBeVisible()
  })
  it('should render airtime reports tab', async () => {
    render(<WiFiPage tab={WifiTabsEnum.AIRTIME_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.AIRTIME_UTILIZATION)).toBeVisible()
  })
  it('should handle tab click', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<WiFiPage tab={WifiTabsEnum.AP_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Airtime Utilization Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/wifi/reports/airtime', hash: '', search: ''
    }))
  })
})
