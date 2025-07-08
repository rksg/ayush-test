import {
  LbsServerProfileViewModel
} from '@acx-ui/rc/utils'
import { TableResult } from '@acx-ui/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockedPolicyId1 = '__Policy_ID_1__'
export const mockedPolicyId2 = '__Policy_ID_2__'

export const newEmptyData = {
  name: '',
  lbsServerVenueName: '',
  serverAddress: '',
  serverPort: '',
  password: ''
}

export const editData = {
  ...newEmptyData,
  name: 'test1',
  lbsServerVenueName: 'lbsServerVenueName',
  serverAddress: 'ruckus.cloud',
  serverPort: '8883',
  password: 'qwerasdf',
  tenantId: mockedTenantId
}


export const dummyLbsServerProfileData = {
  id: mockedPolicyId1,
  name: 'LBS 1',
  lbsServerVenueName: 'lbsvenue01',
  serverAddress: 'abc.venue.ruckuslbs.com',
  serverPort: '8883',
  password: 'qwerasdf',
  tenantId: mockedTenantId
}

export const dummyLbsServerProfileViewmodel1 = {
  id: mockedPolicyId1,
  name: 'LBS 1',
  lbsServerVenueName: 'lbsvenue01',
  server: 'abc.venue.ruckuslbs.com:8883'
}

export const dummyLbsServerProfileViewmodel2 = {
  id: mockedPolicyId2,
  name: 'LBS 2',
  lbsServerVenueName: 'lbsvenue02',
  server: 'xyz.venue.ruckuslbs.com:8883'
}

export const dummyTableResult: TableResult<LbsServerProfileViewModel> = {
  totalCount: 2,
  page: 1,
  data: [{
    ...dummyLbsServerProfileViewmodel1,
    venueIds: []
  }, {
    ...dummyLbsServerProfileViewmodel2,
    venueIds: ['0c41e2e116514dc698c53dc8c752a1b8']
  }]
}
