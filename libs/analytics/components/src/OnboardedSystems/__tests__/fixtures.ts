import { Tenant } from '@acx-ui/analytics/utils'

import { OnboardedSystem, SmartZoneStatus } from '../services'

export const tenants = [
  { id: 'id1', name: 'account1', permissions: { READ_ONBOARDED_SYSTEMS: true } },
  { id: 'id2', name: 'account2', permissions: { READ_ONBOARDED_SYSTEMS: true } }
] as unknown as Tenant[]

export const tenantsWithNoPermission = [
  ...tenants,
  { id: 'id3', name: 'account3', permissions: { READ_ONBOARDED_SYSTEMS: false } }
] as unknown as Tenant[]

export const tenantsWithPermission = [
  ...tenants,
  { id: 'id3', name: 'account3', permissions: { READ_ONBOARDED_SYSTEMS: true } }
] as unknown as Tenant[]

const testStateTemplate = {
  device_id: 'a648cbd5-9770-42f7-9b7d-9a268187333e',
  device_metadata: {} as OnboardedSystem['device_metadata'],
  healthz: {} as OnboardedSystem['healthz'],
  ap_list: {} as OnboardedSystem['ap_list'],
  ap_filter: {} as OnboardedSystem['ap_filter'],
  created_at: '2019-02-16T05:32:11.131Z',
  updated_at: '2019-02-16T05:32:11.131Z',
  account_id: 'id1',
  account_name: 'account1',
  state: 'state',
  state_errors: [],
  error_details: {},
  can_delete: false
}

export const mockSmartZoneStatusList = {
  data: ['error', 'onboarded', 'offboarded', 'ongoing'] as SmartZoneStatus[]
}

export const mockSmartZoneList = {
  totalCount: 13,
  page: 1,
  data: [
    {
      ...testStateTemplate,
      device_id: 'sz1',
      device_name: 'sz1',
      ap_list: {
        aps: [
          {
            mac: '0C:F4:D5:05:EF:80',
            zoneId: '1446148c-eb62-4d8a-acb2-a1d08034ada3',
            apGroupId: '6c308226-ef3e-48e1-ba26-6e8e1093f557',
            serial: '981709002523',
            name: 'R310-EF80'
          },
          {
            mac: '0C:F4:D5:13:3D:00',
            zoneId: '3bbd30a1-9ce5-40a2-814d-8757241f866f',
            apGroupId: '8cb74885-0e58-442d-903c-d582e214d229',
            serial: '921703000162',
            name: 'R720-3D00'
          },
          {
            mac: '1C:B9:C4:39:AA:60',
            zoneId: 'b4187899-38ae-4ace-8e40-0bc444455156',
            apGroupId: '86f801ee-b545-4530-98b1-6e97b576ef07',
            serial: '261603601049',
            name: 'R600-AA60'
          }]
      },
      ap_filter: { aps: [ '0C:F4:D5:05:EF:80' ] },
      state: 'onboarded',
      status_type: 'onboarded'
    },
    {
      ...testStateTemplate,
      device_id: 'sz3',
      device_name: 'sz3',
      state: 'offboarded',
      status_type: 'offboarded',
      can_delete: true
    },
    {
      ...testStateTemplate,
      device_id: 'sz5',
      state: 'onboarding_create_data_connector',
      status_type: 'error',
      state_errors: ['unknown error']
    },
    {
      ...testStateTemplate,
      device_id: 'sz6',
      device_name: 'sz6',
      msg_proxy_updated_at: '2019-03-17T05:32:11.136Z',
      sz_updated_at: '2019-03-17T05:32:11.136Z',
      state: 'onboarded',
      status_type: 'error',
      state_errors: [
        'msg_proxy_no_data_received',
        'sz_mgr_no_health_check_received'
      ],
      error_details: {}
    },
    {
      ...testStateTemplate,
      device_id: 'sz7',
      device_name: 'sz7',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error'],
      error_details: {
        licensing_api_error: {
          http_status_code: 503,
          http_body: {
            message: 'Operation is not allowed because cluster is in read only state.'
          }
        }
      }
    },
    {
      ...testStateTemplate,
      device_id: 'sz8',
      device_name: 'sz8',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error'],
      error_details: {
        licensing_api_error: {
          http_status_code: 503,
          http_body: 'Operation is not allowed because cluster is in read only state.'
        }
      }
    },
    {
      ...testStateTemplate,
      device_id: 'sz9',
      device_name: 'sz9',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error', 'rbac_api_error'],
      error_details: {
        licensing_api_error: {
          http_status_code: 503,
          http_body: 'Operation is not allowed because cluster is in read only state.'
        },
        rbac_api_error: { http_status_code: 400, http_body: { error: 'Invalid cluster id.' } }
      }
    },
    {
      ...testStateTemplate,
      device_id: 'sz10',
      device_name: 'sz10',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error'],
      error_details: {
        licensing_api_error: { http_status_code: null, http_body: null }
      }
    },
    {
      ...testStateTemplate,
      device_id: 'sz11',
      device_name: 'sz11',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error'],
      error_details: {
        licensing_api_error: { http_status_code: null, http_body: 'Some errors happened' }
      }
    },
    {
      ...testStateTemplate,
      device_id: 'sz12',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error'],
      error_details: {}
    },
    {
      ...testStateTemplate,
      device_id: 'sz13',
      device_name: 'sz13',
      state: 'onboarding_update_account_id',
      status_type: 'error',
      state_errors: ['licensing_api_error'],
      error_details: {
        licensing_api_error: { http_status_code: null, http_body: { error: null } }
      }
    },
    // account_name ordering is defined by backend
    {
      ...testStateTemplate,
      device_id: 'sz2',
      device_name: 'sz2',
      state: 'onboarding_update_sz_name',
      status_type: 'ongoing',
      account_id: 'id2',
      account_name: 'account2'
    },
    {
      ...testStateTemplate,
      device_id: 'sz4',
      device_name: 'sz4',
      state: 'onboarding_create_data_connector',
      status_type: 'error',
      state_errors: ['poll_control_message_response_timeout'],
      account_id: 'id2',
      account_name: 'account2'
    }
  ] as Partial<OnboardedSystem>[]
}

export const mockFormattedSmartZoneList = {
  totalCount: 13,
  page: 1,
  data: [
    {
      account_name: 'account1',
      canDelete: false,
      errors: [],
      created_at: '02/16/2019 05:32',
      id: 'sz1',
      lastUpdateTime: undefined,
      device_name: 'sz1',
      status: 'Onboarded',
      status_type: 'onboarded'
    },
    {
      account_name: 'account1',
      canDelete: true,
      errors: [],
      created_at: '02/16/2019 05:32',
      id: 'sz3',
      lastUpdateTime: undefined,
      device_name: 'sz3',
      status: 'Offboarded',
      status_type: 'offboarded'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
        'unknown error: Unknown error'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz5',
      lastUpdateTime: undefined,
      device_name: '[retrieving from SmartZone]',
      status: 'Onboarding: Create data connector',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
        'Have not received data since 03/17/2019 05:32',
        'Have not received health check since 03/17/2019 05:32'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz6',
      lastUpdateTime: '2019-03-17T05:32:11.136Z',
      device_name: 'sz6',
      status: 'Onboarded',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
      // eslint-disable-next-line max-len
        'License API: Operation is not allowed because cluster is in read only state. (status code: 503)'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz7',
      lastUpdateTime: undefined,
      device_name: 'sz7',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
      // eslint-disable-next-line max-len
        'License API: Operation is not allowed because cluster is in read only state. (status code: 503)'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz8',
      lastUpdateTime: undefined,
      device_name: 'sz8',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
      // eslint-disable-next-line max-len
        'License API: Operation is not allowed because cluster is in read only state. (status code: 503)',
        'Access control API: Invalid cluster id. (status code: 400)'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz9',
      lastUpdateTime: undefined,
      device_name: 'sz9',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
        'License API: Unknown error'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz10',
      lastUpdateTime: undefined,
      device_name: 'sz10',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
        'License API: Some errors happened'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz11',
      lastUpdateTime: undefined,
      device_name: 'sz11',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
        'License API: Unknown error'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz12',
      lastUpdateTime: undefined,
      device_name: '[retrieving from SmartZone]',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account1',
      canDelete: false,
      errors: [
        'License API: Unknown error'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz13',
      lastUpdateTime: undefined,
      device_name: 'sz13',
      status: 'Onboarding: Update tenant association',
      status_type: 'error'
    },
    {
      account_name: 'account2',
      canDelete: false,
      errors: [],
      created_at: '02/16/2019 05:32',
      id: 'sz2',
      lastUpdateTime: undefined,
      device_name: 'sz2',
      status: 'Onboarding: Update SZ name',
      status_type: 'ongoing'
    },
    {
      account_name: 'account2',
      canDelete: false,
      errors: [
        'Control message response timeout'
      ],
      created_at: '02/16/2019 05:32',
      id: 'sz4',
      lastUpdateTime: undefined,
      device_name: 'sz4',
      status: 'Onboarding: Create data connector',
      status_type: 'error'
    }
  ]
}
