import { fakeIncidentVlan }                                            from '@acx-ui/analytics/utils'
import { get }                                                         from '@acx-ui/config'
import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ImpactedSwitchVLANsDetails } from '.'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const response = {
  incident: {
    impactedSwitchVLANs: [
      {
        name: 'Switch 1',
        mac: '10:00:00:00:00:01',
        ports: [
          {
            portNumber: '1/1/1',
            portMac: '10:00:00:00:00:01',
            vlans: [
              { id: 1, name: 'DEFAULT-VLAN' },
              { id: 11, name: '' }
            ],
            untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
            mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
            mismatchedUntaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
            connectedDevice: {
              mac: '20:00:00:00:00:02',
              portMac: '20:00:00:00:00:02',
              name: 'Switch 2',
              type: 'Bridge, Router',
              isAP: false,
              port: 'GigabitEthernet1/1/1',
              description: 'Unknown',
              vlans: [{ id: 11, name: '' }],
              untaggedVlan: null
            }
          },
          {
            portNumber: '1/1/2',
            portMac: '10:00:00:00:00:01',
            vlans: [
              { id: 1, name: 'DEFAULT-VLAN' },
              { id: 11, name: '' },
              { id: 4, name: '' }
            ],
            untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
            mismatchedVlans: [{ id: 11, name: '' }, { id: 4, name: '' }],
            mismatchedUntaggedVlan: null,
            connectedDevice: {
              mac: '20:00:00:00:00:02',
              portMac: '20:00:00:00:00:02',
              name: 'Switch 2',
              type: 'Bridge, Router',
              isAP: false,
              port: 'GigabitEthernet1/1/2',
              description: 'Unknown',
              vlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
              untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
            }
          }
        ]
      },
      {
        name: 'Switch 2',
        mac: '20:00:00:00:00:02',
        ports: [{
          portNumber: '1/1/1',
          portMac: '20:00:00:00:00:02',
          vlans: [{ id: 11, name: '' }],
          untaggedVlan: null,
          mismatchedVlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
          mismatchedUntaggedVlan: null,
          connectedDevice: {
            mac: '10:00:00:00:00:01',
            portMac: '10:00:00:00:00:01',
            name: 'Switch 1',
            type: 'Bridge, Router',
            isAP: false,
            port: '1/1/1',
            description: 'Unknown',
            vlans: [
              { id: 1, name: 'DEFAULT-VLAN' },
              { id: 11, name: '' }
            ],
            untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
          }
        }, {
          portNumber: '1/1/2',
          portMac: '20:00:00:00:00:03',
          vlans: [{ id: 1, name: 'DEFAULT-VLAN' }],
          untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' },
          mismatchedVlans: [{ id: 11, name: 'DEFAULT-VLAN' }, { id: 4, name: '' }],
          mismatchedUntaggedVlan: null,
          connectedDevice: {
            mac: '10:00:00:00:00:02',
            portMac: '10:00:00:00:00:02',
            name: 'Switch 1',
            type: 'Bridge, Router',
            isAP: false,
            port: '1/1/2',
            description: 'Unknown',
            vlans: [
              { id: 1, name: 'DEFAULT-VLAN' },
              { id: 11, name: '' },
              { id: 4, name: '' }
            ],
            untaggedVlan: { id: 1, name: 'DEFAULT-VLAN' }
          }
        }]
      }
    ]
  }
}

describe('ImpactedSwitchVLANDetails', () => {
  jest.mocked(get).mockReturnValue('32') // get('DRUID_ROLLUP_DAYS')
  it('should render', async () => {
    const mockDate = new Date('2022-10-06T01:00:00.000Z')
    jest.useFakeTimers('modern').setSystemTime(mockDate)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response })
    render(<ImpactedSwitchVLANsDetails
      incident={fakeIncidentVlan}
    />, { wrapper: Provider })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText('Impacted switches')).toBeVisible()
    expect(screen.getByText('Out of 1 switch')).toBeVisible()
    expect(screen.getByText('Mismatched VLAN')).toBeVisible()
    expect(screen.getByText('6 configured VLANs')).toBeVisible()
  })
})
