import '@testing-library/jest-dom'

import { Form } from 'antd'

import { ServiceTechnology, DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { render } from '@acx-ui/test-utils'

import { SummaryForm } from './SummaryForm'

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
