import { fakeIncidentUplinkPortCongestion, overlapsRollup }    from '@acx-ui/analytics/utils'
import { Provider, dataApi, dataApiURL, store }                from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { ImpactedSwitchUplinkTable } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

const response = {
  incident: {
    uplinkPortCount: 7,
    impactedSwitches: [
      {
        name: 'Unknown',
        mac: '5C:83:6C:3F:A8:36',
        serial: 'Unknown',
        ports: [
          {
            portNumber: '1/1/13',
            connectedDevice: {
              deviceMac: '5C:83:6C:3F:BB:98',
              devicePortMac: '5C:83:6C:3F:BB:BC',
              deviceName: 'BRD-DUT1-VK1087',
              devicePort: 'GigabitEthernet1/1/37'
            }
          },
          {
            portNumber: '1/1/24',
            connectedDevice: {
              deviceMac: '5C:83:6C:3F:BB:98',
              devicePortMac: '5C:83:6C:3F:BB:BF',
              deviceName: 'BRD-DUT1-VK1087',
              devicePort: 'GigabitEthernet1/1/40'
            }
          },
          {
            portNumber: '1/1/4',
            connectedDevice: {
              deviceMac: '38:45:3B:3E:CA:6E',
              devicePortMac: '38:45:3B:3E:CA:7C',
              deviceName: 'ICX8200-24ZP Router',
              devicePort: '2.5GigabitEthernet1/1/15'
            }
          },
          {
            portNumber: '1/1/6',
            connectedDevice: {
              deviceMac: '5C:83:6C:3F:BB:98',
              devicePortMac: '5C:83:6C:3F:BB:B3',
              deviceName: 'BRD-DUT1-VK1087',
              devicePort: 'GigabitEthernet1/1/28'
            }
          },
          {
            portNumber: '1/1/9',
            connectedDevice: {
              deviceMac: '38:45:3B:3E:D5:C2',
              devicePortMac: '38:45:3B:3E:D5:C7',
              deviceName: 'ICX8200-24FX Router',
              devicePort: '10GigabitEthernet1/1/6'
            }
          }
        ]
      }
    ]
  }
}


describe('ImpactedSwitchUplinkTable', () => {
  beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchesUplink', { data: response })

    render(
      <Provider>
        <ImpactedSwitchUplinkTable
          incident={fakeIncidentUplinkPortCongestion} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(5)
    expect(body.getByRole('cell', {
      name: /GigabitEthernet1\/1\/28/i
    })).toBeVisible()
  })
  it('should not render when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response })
    render(<ImpactedSwitchUplinkTable
      incident={fakeIncidentUplinkPortCongestion} />,
    { wrapper: Provider })
    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
})
