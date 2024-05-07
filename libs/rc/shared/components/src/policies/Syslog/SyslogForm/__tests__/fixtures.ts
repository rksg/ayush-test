import { FacilityEnum, FlowLevelEnum, PriorityEnum, ProtocolEnum, SyslogContextType, SyslogPolicyDetailType, SyslogVenue } from '@acx-ui/rc/utils'

export const initState = {
  policyName: '',
  server: '',
  port: 514,
  protocol: ProtocolEnum.TCP,
  secondaryServer: '',
  secondaryPort: 514,
  secondaryProtocol: ProtocolEnum.TCP,
  facility: FacilityEnum.KEEP_ORIGINAL,
  priority: PriorityEnum.ALL,
  flowLevel: FlowLevelEnum.ALL,
  venues: [] as SyslogVenue[]
} as SyslogContextType

export const syslogPolicyTableList = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: 'policyId1',
      name: 'Syslog 1',
      server: '1.1.1.1',
      port: 514,
      protocol: 'TCP',
      secondaryServer: '2.2.2.2',
      secondaryPort: 1514,
      secondaryProtocol: 'UDP',
      facility: 'KEEP_ORIGINAL',
      priority: 'ERROR',
      flowLevel: 'ALL',
      venueIds: []
    },
    {
      id: 'be62604f39aa4bb8a9f9a0733ac07add',
      name: 'Syslog 2',
      server: '1.1.1.1',
      port: 514,
      protocol: 'TCP',
      secondaryServer: '2.2.2.2',
      secondaryPort: 1514,
      secondaryProtocol: 'UDP',
      facility: 'KEEP_ORIGINAL',
      priority: 'ERROR',
      flowLevel: 'ALL',
      venueIds: []
    }
  ]
}

export const syslogVenueTable = {
  fields: [
    'country',
    'city',
    'name',
    'switches',
    'id',
    'aggregatedApStatus',
    'rogueDetection',
    'status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '1_01_NeverContactedCloud': 10
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: '14d6ee52df3a48988f91558bac54c1ae',
        policyName: 'Default profile',
        enabled: false
      }
    },
    {
      id: '4ca20c8311024ac5956d366f15d96e03',
      name: 'test-venue2',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '2_00_Operational': 5
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: 'policyId1',
        policyName: 'Default policyId1 profile',
        enabled: true
      }
    }
  ]
}

export const targetSyslog: SyslogPolicyDetailType = {
  name: 'test syslog',
  id: '123456789',
  primary: { server: '1.1.1.1', port: 1287, protocol: ProtocolEnum.TCP },
  secondary: {},
  facility: FacilityEnum.KEEP_ORIGINAL,
  flowLevel: FlowLevelEnum.ALL,
  venues: [{ id: 'v12345', name: 'My-Venue' }]
}
