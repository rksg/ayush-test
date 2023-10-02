import { fakeIncidentVlan }                            from '@acx-ui/analytics/utils'
import { Provider, dataApiURL }                        from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within } from '@acx-ui/test-utils'

import { ImpactedSwitchVLANsTable } from '.'

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

describe('ImpactedSwitchVLANsTable', () => {
  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response })
    render(<ImpactedSwitchVLANsTable
      incident={fakeIncidentVlan}
    />, { wrapper: Provider })

    const body = within(await findTBody())
    expect(await body.findAllByRole('row')).toHaveLength(2)
  })
})
