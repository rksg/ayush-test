import { fakeIncidentUplinkPortCongestion, overlapsRollup }            from '@acx-ui/analytics/utils'
import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ImpactedUplinkPortDetails } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

const response = {
  incident: {
    uplinkPortCount: 30,
    impactedSwitches: [
      {
        name: 'MM-126',
        mac: 'D4:C1:9E:17:90:97',
        ports: [
          {
            portNumber: '1/1/21',
            portMac: 'D4:C1:9E:17:90:AB'
          },
          {
            portNumber: '2/1/6',
            portMac: 'D4:C1:9E:17:82:84'
          },
          {
            portNumber: '3/1/6',
            portMac: 'C0:C5:20:7E:51:3B'
          },
          {
            portNumber: '4/1/7',
            portMac: '94:B3:4F:2E:EB:74'
          }
        ]
      }
    ]
  }
}


describe('ImpactedUplinkPortDetails', () => {
  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchesUplink', { data: response })
    render(
      <Provider>
        <ImpactedUplinkPortDetails
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText(/mm\-126/i)).toBeVisible()
    expect(screen.getByText('Impacted switch')).toBeVisible()
    expect(screen.getByText('Out of 1 switch')).toBeVisible()
    expect(screen.getByText('Impacted uplink ports')).toBeVisible()
    expect(screen.getByText('Out of 30 uplink ports')).toBeVisible()
  })

  it('should hide details section when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchesUplink', { data: response })
    render(<ImpactedUplinkPortDetails
      incident={fakeIncidentUplinkPortCongestion}
    />, { wrapper: Provider })

    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
})
