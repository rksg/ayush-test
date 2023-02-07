import { ClientIsolationClient, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'

export const mockedPolicyId = '__Policy_ID__'

// eslint-disable-next-line max-len
export const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE })
// eslint-disable-next-line max-len
export const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.EDIT })

export const mockedClientIsolationList = [
  {
    id: '123456789',
    name: 'Fake Client Isolation',
    description: 'Here is the description',
    allowlist: [
      {
        mac: 'AA:BB:CC:DD:EE:11',
        description: 'Client 1'
      },
      {
        mac: 'AA:BB:CC:DD:EE:22',
        description: 'Client 2'
      },
      {
        mac: 'AA:BB:CC:DD:EE:33',
        description: 'Client 3'
      }
    ]
  },
  {
    id: '987654321',
    name: 'Fake Client Isolation 2',
    description: 'Here is the description 2',
    allowlist: [
      {
        mac: '22:BB:CC:DD:EE:11',
        description: 'Client 2-1'
      },
      {
        mac: '22:BB:CC:DD:EE:22',
        description: 'Client 2-2'
      }
    ]
  },
  {
    id: '555555555',
    name: 'Fake Client Isolation 3',
    description: 'Here is the description 3',
    allowlist: [
      {
        mac: 'AA:BB:CC:DD:EE:11',
        description: 'Client 3-1'
      }
    ]
  }
]

export const mockedClientIsolation = mockedClientIsolationList[0]

export const mockedClientList = [{
  osType: 'Windows',
  clientMac: '28:B3:71:28:78:50',
  ipAddress: '10.206.1.93',
  Username: '24418cc316df',
  hostname: 'LP-XXXXX',
  venueName: 'UI-TEST-VENUE',
  apName: 'UI team ONLY'
}]


export const mockedAllowList: ClientIsolationClient[] = [
  {
    mac: 'AA:BB:11:22:33:FF',
    description: 'Client 1'
  },
  {
    mac: 'AA:BB:11:22:33:F2',
    description: 'Client 2'
  },
  {
    mac: 'AA:BB:11:22:33:F3',
    description: 'Client 3'
  }
]
