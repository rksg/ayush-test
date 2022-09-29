import '@testing-library/jest-dom'

import { Form } from 'antd'
import { rest } from 'msw'

import { ServiceTechnology, DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, mockServer }                    from '@acx-ui/test-utils'

import { SummaryForm } from './SummaryForm'

const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: 'network-venue-1',
      description: '',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      latitude: '-37.8145092',
      longitude: '144.9704868',
      networks: { count: 1, names: ['03'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      allApDisabled: false
    },
    {
      id: '02e2ddbc88e1428987666d31edbc3d9a',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7691341',
      longitude: '-73.94297689999999',
      switchClients: 2,
      switches: 1,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      wlan: { wlanSecurity: 'WPA3' }
    }
  ]
}

const mockSummary = {
  name: 'testDHCP',
  tags: ['tesTag'],
  createType: ServiceTechnology.WIFI,
  dhcpConfig: DHCPConfigTypeEnum.SIMPLE,
  venues: [{
    dhcpId: '',
    apGroups: [],
    scheduler: {
      type: 'ALWAYS_ON'
    },
    isAllApGroups: true,
    allApGroupsRadio: 'Both',
    venueId: 'aac17720c83e475f83ef626d159be9ea',
    name: 'Govind'
  },
  {
    dhcpId: '',
    apGroups: [],
    scheduler: {
      type: 'ALWAYS_ON'
    },
    isAllApGroups: true,
    allApGroupsRadio: 'Both',
    venueId: '3b2ffa31093f41648ed38ed122510029',
    name: 'kesava_venue'
  }],
  dhcpPools: [{
    id: 1662429345797,
    name: 'test',
    allowWired: false,
    ip: '1.1.1.1',
    mask: '1.1.1.1',
    primaryDNS: '',
    secondaryDNS: '',
    dhcpOptions: [],
    leaseTime: 24,
    vlan: 300,
    excludedRangeStart: '1.1.1.1',
    excludedRangeEnd: '1.1.1.1'
  },
  {
    id: 1662429402111,
    name: 'test2',
    allowWired: false,
    ip: '2.2.2.2',
    mask: '1.1.1.1',
    primaryDNS: '',
    secondaryDNS: '',
    dhcpOptions: [],
    leaseTime: 24,
    vlan: 300,
    excludedRangeStart: '2.2.2.2',
    excludedRangeEnd: '2.2.2.2'
  }]
}

describe('SummaryForm', () => {

  it('should render cloudpath disabled successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getNetworksVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    const { asFragment } = render(
      <Provider>
        <Form>
          <SummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
