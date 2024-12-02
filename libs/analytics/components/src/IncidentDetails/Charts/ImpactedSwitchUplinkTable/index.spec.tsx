import { fakeIncidentUplinkPortCongestion, overlapsRollup }    from '@acx-ui/analytics/utils'
import { Provider, dataApi, dataApiURL, store }                from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { ImpactedSwitch } from './services'

import { ImpactedSwitchUplinkTable } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

const sample1: ImpactedSwitch[] = [
  {
    name: 'MM-126',
    mac: 'D4:C1:9E:17:90:97',
    ip: '10.177.153.215',
    ports: [
      {
        portNumber: '1/1/21',
        portMac: 'D4:C1:9E:17:90:AB',
        connectedDevice: {
          deviceMac: 'C0:C5:20:82:57:AE',
          devicePortMac: '38:45:3B:3F:98:F0',
          deviceName: 'ROD-135',
          devicePort: 'GigabitEthernet4/1/1',
          deviceIp: '10.177.153.136'
        }
      },
      {
        portNumber: '2/1/6',
        portMac: 'D4:C1:9E:17:82:84',
        connectedDevice: {
          deviceMac: 'C0:C5:20:82:57:AE',
          devicePortMac: 'C0:C5:20:82:57:B3',
          deviceName: 'ROD-135',
          devicePort: 'GigabitEthernet2/1/6',
          deviceIp: '10.177.153.136'
        }
      },
      {
        portNumber: '3/1/6',
        portMac: 'C0:C5:20:7E:51:3B',
        connectedDevice: {
          deviceMac: 'C0:C5:20:82:57:AE',
          devicePortMac: 'C0:C5:20:80:B8:73',
          deviceName: 'ROD-135',
          devicePort: 'GigabitEthernet3/1/6',
          deviceIp: '10.177.153.136'
        }
      },
      {
        portNumber: '4/1/7',
        portMac: '94:B3:4F:2E:EB:74',
        connectedDevice: {
          deviceMac: '5C:83:6C:3F:CD:F2',
          devicePortMac: '5C:83:6C:3F:CE:20',
          deviceName: 'babyrdn_48p',
          devicePort: 'GigabitEthernet1/1/47',
          deviceIp: '10.177.159.54'
        }
      }
    ]
  }
]


const response = (data: ImpactedSwitch[] = [
  ...sample1
]): { incident: { impactedSwitches: ImpactedSwitch[] } } => ({
  incident: {
    impactedSwitches: data
  }
})

describe('ImpactedSwitchUplinkTable', () => {
  beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchesUplink', { data: response() })
    render(<ImpactedSwitchUplinkTable
      incident={fakeIncidentUplinkPortCongestion} />,
    { wrapper: Provider })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(body.getByRole('cell', {
      name: /gigabitethernet1\/1\/47/i
    })).toBeVisible()
  })
  it('should not render when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
    render(<ImpactedSwitchUplinkTable
      incident={fakeIncidentUplinkPortCongestion} />,
    { wrapper: Provider })
    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
})
