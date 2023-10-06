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
      }, {
        name: 'Sol-DBlade-System',
        mac: '60:9C:9F:D8:B4:80',
        ports: [
          {
            portNumber: '1/1/48',
            portMac: '60:9C:9F:D8:B4:AF',
            vlans: [
              { id: 30, name: '' },
              { id: 150, name: 'KC Vlan150' }
            ],
            untaggedVlan: { id: 1646, name: 'Site BA Dblade' },
            mismatchedVlans: [{ id: 30, name: '' }],
            mismatchedUntaggedVlan: null,
            connectedDevice: {
              mac: 'D4:C1:9E:0E:7D:40',
              portMac: 'D4:C1:9E:0E:7D:71',
              name: 'Site-B-SW1',
              type: 'Bridge',
              isAP: false,
              port: '10GigabitEthernet1/2/1',
              description: 'Ruckus Wireless, Inc. ICX7450-48-HPOE, IronWare Version 09.0.10hT211',
              vlans: [{ id: 150, name: 'Site-A Tunneled WLAN' }],
              untaggedVlan: { id: 1646, name: 'Site-B-DP' }
            }
          }
        ]
      },
      {
        name: 'Site-B-SW1',
        mac: 'D4:C1:9E:0E:7D:40',
        ports: [
          {
            portNumber: '1/2/1',
            portMac: 'D4:C1:9E:0E:7D:71',
            vlans: [{ id: 150, name: 'Site-A Tunneled WLAN' }],
            untaggedVlan: { id: 1646, name: 'Site-B-DP' },
            mismatchedVlans: [{ id: 30, name: '' }],
            mismatchedUntaggedVlan: null,
            connectedDevice: {
              mac: '60:9C:9F:D8:B4:80',
              portMac: '60:9C:9F:D8:B4:AF',
              name: 'Sol-DBlade-System',
              type: 'Bridge',
              isAP: false,
              port: '10GigabitEthernet1/1/48',
              description: 'Ruckus Wireless, Inc. ICX7750-48F, IronWare Version 08.0.95jT201',
              vlans: [
                { id: 30, name: '' },
                { id: 150, name: 'KC Vlan150' }
              ],
              untaggedVlan: { id: 1646, name: 'Site BA Dblade' }
            }
          }
        ]
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
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(within(rows[2]).getAllByRole('cell')[0].textContent).toMatch('Sol-DBlade-System')
  })
})
