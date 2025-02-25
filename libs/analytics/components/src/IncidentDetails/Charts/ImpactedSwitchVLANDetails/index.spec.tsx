import { fakeIncidentVlan, overlapsRollup }                            from '@acx-ui/analytics/utils'
import { Provider, dataApiURL }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ImpactedSwitchVLANsDetails } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

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
  it('should render', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response })
    render(<ImpactedSwitchVLANsDetails
      incident={fakeIncidentVlan}
    />, { wrapper: Provider })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText('Impacted switches')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
    expect(screen.getAllByText('Switch 1')).toHaveLength(1)
    expect(screen.getAllByText('Switch 2')).toHaveLength(1)
    expect(screen.getByText('6 configured VLANs')).toBeVisible()
  })
  it('should hide chart when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitchVLANs', { data: response })
    render(<ImpactedSwitchVLANsDetails
      incident={fakeIncidentVlan}
    />, { wrapper: Provider })

    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })
})
