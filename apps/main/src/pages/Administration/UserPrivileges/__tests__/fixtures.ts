import { DetailLevel, UserProfile } from '@acx-ui/user'
export const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
  support: false,
  dogfood: false
} as UserProfile

export const fakeNonPrimeAdminUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: '',
  lastName: '',
  username: 'erp.cheng@email.com',
  role: 'ADMIN',
  roles: ['ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'erp.cheng@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
  support: false,
  dogfood: false
}

export const fakedAdminLsit = [
  {
    id: '0587cbeb13404f3b9943d21f9e1d1e3e',
    email: 'abc.cheng@email.com',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  },
  {
    id: '0587cbeb13404f3b9943d21f9e1d1r6r',
    email: 'erp.cheng@email.com',
    role: 'ADMIN',
    delegateToAllECs: false,
    detailLevel: 'debug'
  },
  {
    id: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
    email: 'dog1551@email.com',
    name: 'FisrtName 1551',
    lastName: 'LastName 1551',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  }
]

export const fakeMSPAdminList = [
  {
    id: '22322506ed764da2afe726885845a359',
    createdDate: '2023-01-31T03:28:35.448+00:00',
    updatedDate: '2023-01-31T03:28:35.448+00:00',
    delegatedTo: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
    type: 'MSP',
    status: 'ACCEPTED',
    delegatedBy: 'abc@email.com',
    delegatedToName: 'FisrtName 1551'
  }
]

export const fakeMSPECAdminList = [
  {
    id: 'f126778d406547c7b0944e845e98dbb2',
    email: 'bbb.chengi@gmail.com',
    name: 'Ya',
    lastName: 'DEF',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  },
  {
    id: '7fbc3cacb7274a6986755795e1d3be0e',
    email: 'aaa.chengi@gmail.com',
    name: 'Hi',
    lastName: 'ABC',
    role: 'PRIME_ADMIN',
    delegateToAllECs: true,
    detailLevel: 'debug'
  }
]

export const fakeMSPECAdmin = {
  email: 'aaa.chengi@gmail.com',
  user_name: 'aaa.cheng@gmail.com',
  first_name: 'Hi',
  last_name: 'ABC'
}

// export const fakeDelegationList = [
//   {
//     id: 'ffc2146b0f9041fa85caec2537a57d09',
//     createdDate: '2023-02-13T11:51:07.793+00:00',
//     updatedDate: '2023-02-13T11:51:07.793+00:00',
//     delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
//     type: 'VAR',
//     status: 'INVITED',
//     delegatedBy: 'dog1551@email.com',
//     delegatedToName: 'RUCKUS NETWORKS, INC',
//     delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
//   }
// ]

// export const fakeFindDelegationResponse = {
//   externalId: '0015000000GlI7SAAV',
//   name: 'RUCKUS NETWORKS, INC',
//   created: '2007-01-15T01:34:55.000+0000',
//   externalModifiedDate: '2023-02-10T00:33:36.000+0000',
//   streetAddress: '350 W JAVA DR',
//   stateOrProvince: 'CA',
//   country: 'United States',
//   city: 'SUNNYVALE',
//   postalCode: '94089',
//   phoneNumber: '+116502654200',
//   faxNumber: '(408) 738-2065',
//   var: false,
//   eda: false
// }

export const fakeTenantDetails = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: 'DISABLED',
    recoveryCodes: ['825910','333815','825720','919107','836842'] },
  preferences: { global: { mapRegion: 'UA' } },
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC'
}

// export const fakeMspEcProfile = {
//   msp_label: 'aaa.chengi',
//   name: 'ABC',
//   street_address: '350 W Java Dr, Sunnyvale, CA 94089, USA',
//   state: 'California',
//   country: 'United States',
//   city: 'Sunnyvale',
//   service_effective_date: '2023-02-08 08:34:14Z',
//   service_expiration_date: '2023-03-30 06:59:59Z',
//   is_active: 'true',
//   tenant_id: '350f3089a8e34509a2913c550faffa7e',
//   parent_tenant_id: '3061bd56e37445a8993ac834c01e2710',
//   tenant_type: 'MSP_EC'
// }

export const fakeMspEcProfile = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: 'false'
}

export let fakedCustomRoleList = [
  {
    id: '1765e98c7b9446e2a5bdd4720e0e8911',
    name: 'ADMIN',
    description: 'Admin Role',
    type: 'System'
  },
  {
    id: '1765e98c7b9446e2a5bdd4720e0e8912',
    name: 'PRIME_ADMIN',
    description: 'Prime Admin Role',
    type: 'System'
  },
  {
    id: '1765e98c7b9446e2a5bdd4720e0e8913',
    name: 'READ_ONLY',
    description: 'Read only Role',
    type: 'System'
  },
  {
    id: '1765e98c7b9446e2a5bdd4720e0e8914',
    name: 'OFFICE_ADMIN',
    description: 'Office Admin Role',
    type: 'System'
  },
  {
    id: '1765e98c7b9446e2a5bdd4720e0e8915',
    name: 'DPSK_ADMIN',
    description: 'DPSK Role',
    type: 'System'
  },
  {
    id: '9421fb213f5245f2bd516ed5580cf80a',
    name: 'DEV_MSP_CR_POLICY',
    description: 'This is DEV_MSP_CR_POLICY',
    type: 'Custom'
  },
  {
    id: '1515527522da4b4f999e76231cbba43d',
    name: 'Wifi-Admin2',
    description: 'This is Wifi-Profile-Admin created using feature AP-Profile-Management ',
    type: 'Custom',
    scopes: [
      'wifi-r',
      'wifi-u'
    ]
  }
]

export const fakedAdminGroupList = [
  {
    id: '9eb59863e3474e7296ff01eb7ca59de4',
    createdDate: '2023-12-13T22:03:21.681+00:00',
    updatedDate: '2023-12-13T22:03:21.681+00:00',
    name: 'IT_Admins',
    groupId: 'IT_Admins@corporate.com',
    processingPriority: 8,
    loggedMembers: 0,
    role: 'PRIME_ADMIN',
    customRole: {
      id: '1765e98c7b9446e2a5bdd4720e0e8912',
      createdDate: '2023-12-01T00:13:58.122+00:00',
      updatedDate: '2023-12-01T00:13:58.122+00:00',
      name: 'PRIME_ADMIN',
      description: 'Prime Admin Role',
      roleType: 'PRE_DEFINED',
      policyBased: false,
      frameworkRO: false
    }
  },
  {
    id: '20fcf1bd463e4f43bada2582cc425ad1',
    createdDate: '2023-12-13T21:58:30.204+00:00',
    updatedDate: '2023-12-13T21:58:30.204+00:00',
    name: 'test group 1',
    groupId: 'groupId123',
    processingPriority: 7,
    loggedMembers: 0,
    role: 'READ_ONLY',
    customRole: {
      id: '1765e98c7b9446e2a5bdd4720e0e8913',
      createdDate: '2023-12-01T00:13:58.122+00:00',
      updatedDate: '2023-12-01T00:13:58.122+00:00',
      name: 'READ_ONLY',
      description: 'Read only Role',
      roleType: 'PRE_DEFINED',
      policyBased: false,
      frameworkRO: false
    }
  },
  {
    id: 'd60a491a3994463daafdc9a1cdfd3039',
    createdDate: '2023-12-13T21:33:45.970+00:00',
    updatedDate: '2023-12-13T21:37:56.583+00:00',
    name: 'test group 2',
    groupId: 'groupId888',
    processingPriority: 6,
    loggedMembers: 0,
    customRole: {
      id: '1765e98c7b9446e2a5bdd4720e0e8911',
      createdDate: '2023-12-01T00:13:58.122+00:00',
      updatedDate: '2023-12-01T00:13:58.122+00:00',
      description: 'Admin Role',
      roleType: 'PRE_DEFINED',
      policyBased: false,
      frameworkRO: false
    }
  }
]

export const fakedPrivilegeGroupList =
  [
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8911',
      name: 'ADMIN',
      description: 'Admin Role',
      roleName: 'ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8912',
      name: 'PRIME_ADMIN',
      description: 'Prime Admin Role',
      roleName: 'PRIME_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8913',
      name: 'READ_ONLY',
      description: 'Read only Role',
      roleName: 'READ_ONLY',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8914',
      name: 'OFFICE_ADMIN',
      description: 'Guest Manager',
      roleName: 'OFFICE_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8915',
      name: 'DPSK_ADMIN',
      description: 'DPSK Manager',
      roleName: 'DPSK_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '99bb7b958a5544898cd0b938fa800a5a',
      name: 'wi-fi privilege group',
      description: 'privilege group for wi-fi',
      roleName: 'new wi-fi custom role',
      type: 'Custom',
      delegation: false,
      allCustomers: false,
      memberCount: 0
    },
    {
      // id: '00bb7b958a5544898cd0b938fa800a6b',
      name: 'PG_DEV_CR_01_MSP_DG',
      description: 'This is PG creatig for MSP with delegations',
      roleName: 'ADMIN',
      policies: [
        {
          entityInstanceId: '2fe159728aa34c1abb94f3877d2f1d98',
          objectType: 'com.ruckus.cloud.venue.model.venue'
        },
        {
          entityInstanceId: '9e32160be86b4c4797c0fb106c4f3615',
          objectType: 'com.ruckus.cloud.venue.model.venue'
        }
      ],
      delegation: true,
      policyEntityDTOS: [
        {
          tenantId: 'fd62264fb63f482283cd70fbcdbe9cb9',
          objectList: {
            'com.ruckus.cloud.venue.model.venue': [
              'a3dfc1c8b6b14af897eef44c0ccf035b'
            ]
          }
        },
        {
          tenantId: '5f404592c5b94ebcbaf674ebe5888645',
          objectList: {
            'com.ruckus.cloud.venue.model.venue': [
              'ff6db356a17948719f7f5d9df0d05104'
            ]
          }
        }
      ]
    }
  ]

export const fakedCustomRoleLsit = [
  {
    description: 'Admin Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8911',
    name: 'ADMIN',
    type: 'System'
  },
  {
    description: 'Prime Admin Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8912',
    name: 'PRIME_ADMIN',
    type: 'System'
  },
  {
    description: 'Read only Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8913',
    name: 'READ_ONLY',
    type: 'System'
  },
  {
    description: 'this is new custom role for wi-fi',
    id: 'df2277fb9f8c403c8b1a12ffe6ae9809',
    name: 'new wi-fi custom role',
    type: 'Custom',
    scope: [
      'wifi-r',
      'wifi-u'
    ]
  }
]

export const fakedExplicitCustomRoleList = [
  {
    description: 'Admin Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8911',
    name: 'ADMIN',
    type: 'System'
  },
  {
    description: 'Prime Admin Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8912',
    name: 'PRIME_ADMIN',
    type: 'System'
  },
  {
    description: 'Read only Role',
    id: '1765e98c7b9446e2a5bdd4720e0e8913',
    name: 'READ_ONLY',
    type: 'System'
  },
  {
    description: 'this is new custom role for wi-fi',
    id: 'df2277fb9f8c403c8b1a12ffe6ae9809',
    name: 'new wi-fi custom role',
    type: 'Custom',
    features: [
      'wifi-r',
      'switch-r',
      'edge-r',
      'analytics-r',
      'admin-r',
      'msp-r',
      'wifi.venue.wifi-c',
      'wifi.clients-c',
      'wifi.network_control_services-c',
      'wifi.network_control_policies-c',
      'switch-u',
      'edge-d'
    ]
  }
]

export const fakedScopeTree =[
  {
    id: '7d411830a62347f38c956e8affcea8bj',
    name: 'edge-c',
    description: 'Gateways',
    category: 'Gateways',
    subFeatures: [
      {
        id: '7d411830a62347f38c956e8affcea8bn1',
        name: 'gateways.network_control_services-c',
        description: 'Network Control (Services)',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bj',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023e7',
            name: 'gateways.network_control_services.pin-c',
            description: 'PIN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bn1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023c7',
            name: 'gateways.network_control_services.dhcp-c',
            description: 'DHCP',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bn1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023f7',
            name: 'gateways.network_control_services.sdlan-c',
            description: 'SDLAN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bn1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023d7',
            name: 'gateways.network_control_services.qos-c',
            description: 'QoS',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bn1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023g7',
            name: 'gateways.network_control_services.mdns_proxy-c',
            description: 'MDNS Proxy',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bn1'
          }
        ]
      },
      {
        id: '7d411830a62347f38c956e8affcea8bj1',
        name: 'gateways.ruckus_edge-c',
        description: 'RUCKUS Edge',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bj',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023b7',
            name: 'gateways.ruckus_edge.rwg-c',
            description: 'RWG',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bj1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023a7',
            name: 'gateways.ruckus_edge.edge_management-c',
            description: 'Edge Management',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bj1'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bf',
    name: 'switch-c',
    description: 'Wired',
    category: 'Wired',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02343',
        name: 'wired.clients-c',
        description: 'Clients',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bf',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02344',
            name: 'wired.clients.wired-c',
            description: 'Wired',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02343'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02340',
        name: 'wired.wired-c',
        description: 'Wired',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bf',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02341',
            name: 'wired.wired.switches-c',
            description: 'Switches',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02340'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02342',
            name: 'wired.wired.wired_network_profile-c',
            description: 'Wired Network Profile',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02340'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02338',
        name: 'wired.venue-c',
        description: 'Venue',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bf',
        subFeatures: [
          {
            id: '7d411830a62347f38c956e8affcea8bf1',
            name: 'wired.venue.switch-c',
            description: 'Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02338'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac023x3',
        name: 'wired.network_control_services-c',
        description: 'Network Control (Services)',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bf',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023y4',
            name: 'wired.network_control_services.web_authority-c',
            description: 'PIN Portal for Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac023x3'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac04353',
    name: 'admin-d',
    description: 'Admin',
    category: 'Admin',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04354',
        name: 'admin.administration-d',
        description: 'Administration',
        category: 'Admin',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04353',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04355',
            name: 'admin.administration.timeline-d',
            description: 'Timeline',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04357',
            name: 'admin.administration.account_setup-d',
            description: 'Account Setup',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04356',
            name: 'admin.administration.account_management-d',
            description: 'Account Management',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04354'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac01353',
    name: 'admin-r',
    description: 'Admin',
    category: 'Admin',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01354',
        name: 'admin.administration-r',
        description: 'Administration',
        category: 'Admin',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01353',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01356',
            name: 'admin.administration.account_management-r',
            description: 'Account Management',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01357',
            name: 'admin.administration.account_setup-r',
            description: 'Account Setup',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01355',
            name: 'admin.administration.timeline-r',
            description: 'Timeline',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01354'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bh',
    name: 'switch-d',
    description: 'Wired',
    category: 'Wired',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04338',
        name: 'wired.venue-d',
        description: 'Venue',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bh',
        subFeatures: [
          {
            id: '7d411830a62347f38c956e8affcea8bh1',
            name: 'wired.venue.switch-d',
            description: 'Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04338'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04340',
        name: 'wired.wired-d',
        description: 'Wired',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bh',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04341',
            name: 'wired.wired.switches-d',
            description: 'Switches',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04340'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04342',
            name: 'wired.wired.wired_network_profile-d',
            description: 'Wired Network Profile',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04340'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04343',
        name: 'wired.clients-d',
        description: 'Clients',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bh',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04344',
            name: 'wired.clients.wired-d',
            description: 'Wired',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04343'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac043x3',
        name: 'wired.network_control_services-d',
        description: 'Network Control (Services)',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bh',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043y4',
            name: 'wired.network_control_services.web_authority-d',
            description: 'PIN Portal for Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac043x3'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bb',
    name: 'wifi-c',
    description: 'Wi-Fi',
    category: 'wifi',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02308',
        name: 'wifi.venue-c',
        description: 'Venue',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bb',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023a0',
            name: 'wifi.venue.venue_management-c',
            description: 'Venue Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02309',
            name: 'wifi.venue.wifi-c',
            description: 'Wi-Fi',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023b0',
            name: 'wifi.venue.property_management_units-c',
            description: 'Property Management - Units',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02310',
            name: 'wifi.venue.property_management-c',
            description: 'Property Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02308'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02317',
        name: 'wifi.network_control_services-c',
        description: 'Network Control (Services)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bb',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02319',
            name: 'wifi.network_control_services.dpsk_passphrases-c',
            description: 'DPSK Passphrases',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023b2',
            name: 'wifi.network_control_policies.certificate_templates-c',
            description: 'Certificate Templates',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02320',
            name: 'wifi.network_control_services.wifi_calling-c',
            description: 'wifi Calling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02318',
            name: 'wifi.network_control_services.dpsk-c',
            description: 'DPSK',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02321',
            name: 'wifi.network_control_services.guest_portal-c',
            description: 'Guest Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02322',
            name: 'wifi.network_control_services.resident_portal-c',
            description: 'Resident Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023c2',
            name: 'wifi.network_control_services.mdns_proxy-c',
            description: 'MDNS Proxy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023d2',
            name: 'wifi.network_control_services.dhcp-c',
            description: 'DHCP',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023a2',
            name: 'wifi.network_control_policies.certificate_authority-c',
            description: 'Certificate Authority',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02317'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02323',
        name: 'wifi.network_control_policies-c',
        description: 'Network Control (Policies)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bb',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02331',
            name: 'wifi.network_control_policies.rogue_ap_detection-c',
            description: 'Rogue AP Detection',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02332',
            name: 'wifi.network_control_policies.snmp_agent-c',
            description: 'SNMP Agent',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02333',
            name: 'wifi.network_control_policies.syslog_server-c',
            description: 'Syslog Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02324',
            name: 'wifi.network_control_policies.access_control-c',
            description: 'Access Control',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02327',
            name: 'wifi.network_control_policies.identity_provider-c',
            description: 'Identity Provider',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02328',
            name: 'wifi.network_control_policies.mac_registration_list-c',
            description: 'MAC Registration List',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02326',
            name: 'wifi.network_control_policies.client_isolation-c',
            description: 'Client Isolation',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02336',
            name: 'wifi.network_control_policies.workflow-c',
            description: 'Workflow',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02329',
            name: 'wifi.network_control_policies.location_based_service-c',
            description: 'Location Based Service',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02334',
            name: 'wifi.network_control_policies.vlan_pool-c',
            description: 'VLAN Pool',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02325',
            name: 'wifi.network_control_policies.adaptive_policy-c',
            description: 'Adaptive Policy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac023a3',
            name: 'wifi.network_control_policies.tunnelling-c',
            description: 'Tunnelling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02335',
            name: 'wifi.network_control_policies.wifi_operator-c',
            description: 'wifi Operator',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02330',
            name: 'wifi.network_control_policies.radius_server-c',
            description: 'RADIUS Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02323'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02311',
        name: 'wifi.wifi-c',
        description: 'Wi-Fi',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bb',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02312',
            name: 'wifi.wifi.access_points-c',
            description: 'Access Points',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02311'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02313',
            name: 'wifi.wifi.wifi_networks-c',
            description: 'wifi Networks',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02311'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02314',
        name: 'wifi.clients-c',
        description: 'Clients',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bb',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02315',
            name: 'wifi.clients.wireless-c',
            description: 'Wireless',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02314'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02316',
            name: 'wifi.clients.identity_management-c',
            description: 'Identity Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02314'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac04349',
    name: 'analytics-d',
    description: 'Analytics',
    category: 'Analytics',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04350',
        name: 'analytics.ai_assurance-d',
        description: 'AI Assurance',
        category: 'Analytics',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04349',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04351',
            name: 'analytics.ai_assurance.ai_analytics-d',
            description: 'AI Analytics',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04350'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04352',
            name: 'analytics.ai_assurance.network_assurance-d',
            description: 'Network Assurance',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04350'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bk',
    name: 'edge-u',
    description: 'Gateways',
    category: 'Gateways',
    subFeatures: [
      {
        id: '7d411830a62347f38c956e8affcea8bo1',
        name: 'gateways.network_control_services-u',
        description: 'Network Control (Services)',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bk',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033d7',
            name: 'gateways.network_control_services.qos-u',
            description: 'QoS',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bo1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033f7',
            name: 'gateways.network_control_services.sdlan-u',
            description: 'SDLAN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bo1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033g7',
            name: 'gateways.network_control_services.mdns_proxy-u',
            description: 'MDNS Proxy',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bo1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033e7',
            name: 'gateways.network_control_services.pin-u',
            description: 'PIN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bo1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033c7',
            name: 'gateways.network_control_services.dhcp-u',
            description: 'DHCP',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bo1'
          }
        ]
      },
      {
        id: '7d411830a62347f38c956e8affcea8bk1',
        name: 'gateways.ruckus_edge-u',
        description: 'RUCKUS Edge',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bk',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033a7',
            name: 'gateways.ruckus_edge.edge_management-u',
            description: 'Edge Management',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bk1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033b7',
            name: 'gateways.ruckus_edge.rwg-u',
            description: 'RWG',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bk1'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bl',
    name: 'edge-d',
    description: 'Gateways',
    category: 'Gateways',
    subFeatures: [
      {
        id: '7d411830a62347f38c956e8affcea8bp1',
        name: 'gateways.network_control_services-d',
        description: 'Network Control (Services)',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bl',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043e7',
            name: 'gateways.network_control_services.pin-d',
            description: 'PIN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bp1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043d7',
            name: 'gateways.network_control_services.qos-d',
            description: 'QoS',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bp1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043g7',
            name: 'gateways.network_control_services.mdns_proxy-d',
            description: 'MDNS Proxy',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bp1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043f7',
            name: 'gateways.network_control_services.sdlan-d',
            description: 'SDLAN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bp1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043c7',
            name: 'gateways.network_control_services.dhcp-d',
            description: 'DHCP',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bp1'
          }
        ]
      },
      {
        id: '7d411830a62347f38c956e8affcea8bl1',
        name: 'gateways.ruckus_edge-d',
        description: 'RUCKUS Edge',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bl',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043a7',
            name: 'gateways.ruckus_edge.edge_management-d',
            description: 'Edge Management',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bl1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043b7',
            name: 'gateways.ruckus_edge.rwg-d',
            description: 'RWG',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bl1'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac01358',
    name: 'msp-r',
    description: 'MSP',
    category: 'MSP',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01359',
        name: 'msp.msp-r',
        description: 'MSP',
        category: 'MSP',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01358',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01362',
            name: 'msp.msp.subscriptions-r',
            description: 'Subscriptions',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01360',
            name: 'msp.msp.msp_tenant_management-r',
            description: 'MSP Tenant Management',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01361',
            name: 'msp.msp.device_inventory-r',
            description: 'Device Inventory',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01363',
            name: 'msp.msp.templates-r',
            description: 'Tempates',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01364',
            name: 'msp.msp.msp_portal-r',
            description: 'MSP Portal',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01359'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac02349',
    name: 'analytics-c',
    description: 'Analytics',
    category: 'Analytics',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02350',
        name: 'analytics.ai_assurance-c',
        description: 'AI Assurance',
        category: 'Analytics',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02349',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02352',
            name: 'analytics.ai_assurance.network_assurance-c',
            description: 'Network Assurance',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02350'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02351',
            name: 'analytics.ai_assurance.ai_analytics-c',
            description: 'AI Analytics',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02350'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac02353',
    name: 'admin-c',
    description: 'Admin',
    category: 'Admin',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02354',
        name: 'admin.administration-c',
        description: 'Administration',
        category: 'Admin',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02353',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02355',
            name: 'admin.administration.timeline-c',
            description: 'Timeline',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02357',
            name: 'admin.administration.account_setup-c',
            description: 'Account Setup',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02356',
            name: 'admin.administration.account_management-c',
            description: 'Account Management',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02354'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac03353',
    name: 'admin-u',
    description: 'Admin',
    category: 'Admin',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03354',
        name: 'admin.administration-u',
        description: 'Administration',
        category: 'Admin',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03353',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03357',
            name: 'admin.administration.account_setup-u',
            description: 'Account Setup',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03356',
            name: 'admin.administration.account_management-u',
            description: 'Account Management',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03354'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03355',
            name: 'admin.administration.timeline-u',
            description: 'Timeline',
            category: 'Admin',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03354'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac03358',
    name: 'msp-u',
    description: 'MSP',
    category: 'MSP',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03359',
        name: 'msp.msp-u',
        description: 'MSP',
        category: 'MSP',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03358',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03363',
            name: 'msp.msp.templates-u',
            description: 'Tempates',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03362',
            name: 'msp.msp.subscriptions-u',
            description: 'Subscriptions',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03361',
            name: 'msp.msp.device_inventory-u',
            description: 'Device Inventory',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03364',
            name: 'msp.msp.msp_portal-u',
            description: 'MSP Portal',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03360',
            name: 'msp.msp.msp_tenant_management-u',
            description: 'MSP Tenant Management',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03359'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8ba',
    name: 'wifi-r',
    description: 'Wi-Fi',
    category: 'wifi',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01314',
        name: 'wifi.clients-r',
        description: 'Clients',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8ba',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01316',
            name: 'wifi.clients.identity_management-r',
            description: 'Identity Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01314'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01315',
            name: 'wifi.clients.wireless-r',
            description: 'Wireless',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01314'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01311',
        name: 'wifi.wifi-r',
        description: 'Wi-Fi',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8ba',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01312',
            name: 'wifi.wifi.access_points-r',
            description: 'Access Points',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01311'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01313',
            name: 'wifi.wifi.wifi_networks-r',
            description: 'wifi Networks',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01311'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01317',
        name: 'wifi.network_control_services-r',
        description: 'Network Control (Services)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8ba',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01321',
            name: 'wifi.network_control_services.guest_portal-r',
            description: 'Guest Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013a2',
            name: 'wifi.network_control_policies.certificate_authority-r',
            description: 'Certificate Authority',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013c2',
            name: 'wifi.network_control_services.mdns_proxy-r',
            description: 'MDNS Proxy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013d2',
            name: 'wifi.network_control_services.dhcp-r',
            description: 'DHCP',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01319',
            name: 'wifi.network_control_services.dpsk_passphrases-r',
            description: 'DPSK Passphrases',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01318',
            name: 'wifi.network_control_services.dpsk-r',
            description: 'DPSK',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01320',
            name: 'wifi.network_control_services.wifi_calling-r',
            description: 'wifi Calling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013b2',
            name: 'wifi.network_control_policies.certificate_templates-r',
            description: 'Certificate Templates',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01322',
            name: 'wifi.network_control_services.resident_portal-r',
            description: 'Resident Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01317'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01323',
        name: 'wifi.network_control_policies-r',
        description: 'Network Control (Policies)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8ba',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01334',
            name: 'wifi.network_control_policies.vlan_pool-r',
            description: 'VLAN Pool',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01325',
            name: 'wifi.network_control_policies.adaptive_policy-r',
            description: 'Adaptive Policy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013a3',
            name: 'wifi.network_control_policies.tunnelling-r',
            description: 'Tunnelling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01333',
            name: 'wifi.network_control_policies.syslog_server-r',
            description: 'Syslog Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01332',
            name: 'wifi.network_control_policies.snmp_agent-r',
            description: 'SNMP Agent',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01330',
            name: 'wifi.network_control_policies.radius_server-r',
            description: 'RADIUS Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01335',
            name: 'wifi.network_control_policies.wifi_operator-r',
            description: 'wifi Operator',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01326',
            name: 'wifi.network_control_policies.client_isolation-r',
            description: 'Client Isolation',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01336',
            name: 'wifi.network_control_policies.workflow-r',
            description: 'Workflow',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01329',
            name: 'wifi.network_control_policies.location_based_service-r',
            description: 'Location Based Service',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01331',
            name: 'wifi.network_control_policies.rogue_ap_detection-r',
            description: 'Rogue AP Detection',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01328',
            name: 'wifi.network_control_policies.mac_registration_list-r',
            description: 'MAC Registration List',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01327',
            name: 'wifi.network_control_policies.identity_provider-r',
            description: 'Identity Provider',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01324',
            name: 'wifi.network_control_policies.access_control-r',
            description: 'Access Control',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01323'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01308',
        name: 'wifi.venue-r',
        description: 'Venue',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8ba',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01309',
            name: 'wifi.venue.wifi-r',
            description: 'Wi-Fi',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01310',
            name: 'wifi.venue.property_management-r',
            description: 'Property Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013a0',
            name: 'wifi.venue.venue_management-r',
            description: 'Venue Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013b0',
            name: 'wifi.venue.property_management_units-r',
            description: 'Property Management - Units',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01308'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bg',
    name: 'switch-u',
    description: 'Wired',
    category: 'Wired',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03338',
        name: 'wired.venue-u',
        description: 'Venue',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bg',
        subFeatures: [
          {
            id: '7d411830a62347f38c956e8affcea8bg1',
            name: 'wired.venue.switch-u',
            description: 'Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03338'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03343',
        name: 'wired.clients-u',
        description: 'Clients',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bg',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03344',
            name: 'wired.clients.wired-u',
            description: 'Wired',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03343'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac033x3',
        name: 'wired.network_control_services-u',
        description: 'Network Control (Services)',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bg',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033y4',
            name: 'wired.network_control_services.web_authority-u',
            description: 'PIN Portal for Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac033x3'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03340',
        name: 'wired.wired-u',
        description: 'Wired',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bg',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03341',
            name: 'wired.wired.switches-u',
            description: 'Switches',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03340'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03342',
            name: 'wired.wired.wired_network_profile-u',
            description: 'Wired Network Profile',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03340'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bd',
    name: 'wifi-d',
    description: 'Wi-Fi',
    category: 'wifi',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04317',
        name: 'wifi.network_control_services-d',
        description: 'Network Control (Services)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bd',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043b2',
            name: 'wifi.network_control_policies.certificate_templates-d',
            description: 'Certificate Templates',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043c2',
            name: 'wifi.network_control_services.mdns_proxy-d',
            description: 'MDNS Proxy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043d2',
            name: 'wifi.network_control_services.dhcp-d',
            description: 'DHCP',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04320',
            name: 'wifi.network_control_services.wifi_calling-d',
            description: 'wifi Calling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04322',
            name: 'wifi.network_control_services.resident_portal-d',
            description: 'Resident Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04318',
            name: 'wifi.network_control_services.dpsk-d',
            description: 'DPSK',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043a2',
            name: 'wifi.network_control_policies.certificate_authority-d',
            description: 'Certificate Authority',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04319',
            name: 'wifi.network_control_services.dpsk_passphrases-d',
            description: 'DPSK Passphrases',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04321',
            name: 'wifi.network_control_services.guest_portal-d',
            description: 'Guest Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04317'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04308',
        name: 'wifi.venue-d',
        description: 'Venue',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bd',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04309',
            name: 'wifi.venue.wifi-d',
            description: 'Wi-Fi',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043b0',
            name: 'wifi.venue.property_management_units-d',
            description: 'Property Management - Units',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04310',
            name: 'wifi.venue.property_management-d',
            description: 'Property Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043a0',
            name: 'wifi.venue.venue_management-d',
            description: 'Venue Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04308'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04311',
        name: 'wifi.wifi-d',
        description: 'Wi-Fi',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bd',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04312',
            name: 'wifi.wifi.access_points-d',
            description: 'Access Points',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04311'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04313',
            name: 'wifi.wifi.wifi_networks-d',
            description: 'wifi Networks',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04311'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04314',
        name: 'wifi.clients-d',
        description: 'Clients',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bd',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04315',
            name: 'wifi.clients.wireless-d',
            description: 'Wireless',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04314'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04316',
            name: 'wifi.clients.identity_management-d',
            description: 'Identity Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04314'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04323',
        name: 'wifi.network_control_policies-d',
        description: 'Network Control (Policies)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bd',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04328',
            name: 'wifi.network_control_policies.mac_registration_list-d',
            description: 'MAC Registration List',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04334',
            name: 'wifi.network_control_policies.vlan_pool-d',
            description: 'VLAN Pool',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04327',
            name: 'wifi.network_control_policies.identity_provider-d',
            description: 'Identity Provider',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04335',
            name: 'wifi.network_control_policies.wifi_operator-d',
            description: 'wifi Operator',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04324',
            name: 'wifi.network_control_policies.access_control-d',
            description: 'Access Control',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04330',
            name: 'wifi.network_control_policies.radius_server-d',
            description: 'RADIUS Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac043a3',
            name: 'wifi.network_control_policies.tunnelling-d',
            description: 'Tunnelling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04332',
            name: 'wifi.network_control_policies.snmp_agent-d',
            description: 'SNMP Agent',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04325',
            name: 'wifi.network_control_policies.adaptive_policy-d',
            description: 'Adaptive Policy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04331',
            name: 'wifi.network_control_policies.rogue_ap_detection-d',
            description: 'Rogue AP Detection',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04329',
            name: 'wifi.network_control_policies.location_based_service-d',
            description: 'Location Based Service',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04336',
            name: 'wifi.network_control_policies.workflow-d',
            description: 'Workflow',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04326',
            name: 'wifi.network_control_policies.client_isolation-d',
            description: 'Client Isolation',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04333',
            name: 'wifi.network_control_policies.syslog_server-d',
            description: 'Syslog Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04323'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac01349',
    name: 'analytics-r',
    description: 'Analytics',
    category: 'Analytics',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01350',
        name: 'analytics.ai_assurance-r',
        description: 'AI Assurance',
        category: 'Analytics',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01349',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01351',
            name: 'analytics.ai_assurance.ai_analytics-r',
            description: 'AI Analytics',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01350'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01352',
            name: 'analytics.ai_assurance.network_assurance-r',
            description: 'Network Assurance',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01350'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac03349',
    name: 'analytics-u',
    description: 'Analytics',
    category: 'Analytics',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03350',
        name: 'analytics.ai_assurance-u',
        description: 'AI Assurance',
        category: 'Analytics',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03349',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03351',
            name: 'analytics.ai_assurance.ai_analytics-u',
            description: 'AI Analytics',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03350'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03352',
            name: 'analytics.ai_assurance.network_assurance-u',
            description: 'Network Assurance',
            category: 'Analytics',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03350'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac04358',
    name: 'msp-d',
    description: 'MSP',
    category: 'MSP',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac04359',
        name: 'msp.msp-d',
        description: 'MSP',
        category: 'MSP',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04358',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04360',
            name: 'msp.msp.msp_tenant_management-d',
            description: 'MSP Tenant Management',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04364',
            name: 'msp.msp.msp_portal-d',
            description: 'MSP Portal',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04361',
            name: 'msp.msp.device_inventory-d',
            description: 'Device Inventory',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04363',
            name: 'msp.msp.templates-d',
            description: 'Tempates',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac04362',
            name: 'msp.msp.subscriptions-d',
            description: 'Subscriptions',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac04359'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bi',
    name: 'edge-r',
    description: 'Gateways',
    category: 'Gateways',
    subFeatures: [
      {
        id: '7d411830a62347f38c956e8affcea8bm1',
        name: 'gateways.network_control_services-r',
        description: 'Network Control (Services)',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bi',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013c7',
            name: 'gateways.network_control_services.dhcp-r',
            description: 'DHCP',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bm1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013g7',
            name: 'gateways.network_control_services.mdns_proxy-r',
            description: 'MDNS Proxy',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bm1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013f7',
            name: 'gateways.network_control_services.sdlan-r',
            description: 'SDLAN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bm1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013e7',
            name: 'gateways.network_control_services.pin-r',
            description: 'PIN',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bm1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013d7',
            name: 'gateways.network_control_services.qos-r',
            description: 'QoS',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bm1'
          }
        ]
      },
      {
        id: '7d411830a62347f38c956e8affcea8bi1',
        name: 'gateways.ruckus_edge-r',
        description: 'RUCKUS Edge',
        category: 'Gateways',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bi',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013b7',
            name: 'gateways.ruckus_edge.rwg-r',
            description: 'RWG',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bi1'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013a7',
            name: 'gateways.ruckus_edge.edge_management-r',
            description: 'Edge Management',
            category: 'Gateways',
            parentFeatureId: '7d411830a62347f38c956e8affcea8bi1'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8be',
    name: 'switch-r',
    description: 'Wired',
    category: 'Wired',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01343',
        name: 'wired.clients-r',
        description: 'Clients',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8be',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01344',
            name: 'wired.clients.wired-r',
            description: 'Wired',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01343'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01338',
        name: 'wired.venue-r',
        description: 'Venue',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8be',
        subFeatures: [
          {
            id: '7d411830a62347f38c956e8affcea8be1',
            name: 'wired.venue.switch-r',
            description: 'Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01338'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac01340',
        name: 'wired.wired-r',
        description: 'Wired',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8be',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01341',
            name: 'wired.wired.switches-r',
            description: 'Switches',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01340'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac01342',
            name: 'wired.wired.wired_network_profile-r',
            description: 'Wired Network Profile',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac01340'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac013x3',
        name: 'wired.network_control_services-r',
        description: 'Network Control (Services)',
        category: 'Wired',
        parentFeatureId: '7d411830a62347f38c956e8affcea8be',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac013y4',
            name: 'wired.network_control_services.web_authority-r',
            description: 'PIN Portal for Switch',
            category: 'Wired',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac013x3'
          }
        ]
      }
    ]
  },
  {
    id: '7d411830a62347f38c956e8affcea8bc',
    name: 'wifi-u',
    description: 'Wi-Fi',
    category: 'wifi',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03317',
        name: 'wifi.network_control_services-u',
        description: 'Network Control (Services)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bc',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033a2',
            name: 'wifi.network_control_policies.certificate_authority-u',
            description: 'Certificate Authority',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033d2',
            name: 'wifi.network_control_services.dhcp-u',
            description: 'DHCP',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03318',
            name: 'wifi.network_control_services.dpsk-u',
            description: 'DPSK',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03322',
            name: 'wifi.network_control_services.resident_portal-u',
            description: 'Resident Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033c2',
            name: 'wifi.network_control_services.mdns_proxy-u',
            description: 'MDNS Proxy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03320',
            name: 'wifi.network_control_services.wifi_calling-u',
            description: 'wifi Calling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033b2',
            name: 'wifi.network_control_policies.certificate_templates-u',
            description: 'Certificate Templates',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03319',
            name: 'wifi.network_control_services.dpsk_passphrases-u',
            description: 'DPSK Passphrases',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03321',
            name: 'wifi.network_control_services.guest_portal-u',
            description: 'Guest Portal',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03317'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03311',
        name: 'wifi.wifi-u',
        description: 'Wi-Fi',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bc',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03312',
            name: 'wifi.wifi.access_points-u',
            description: 'Access Points',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03311'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03313',
            name: 'wifi.wifi.wifi_networks-u',
            description: 'wifi Networks',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03311'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03308',
        name: 'wifi.venue-u',
        description: 'Venue',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bc',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03310',
            name: 'wifi.venue.property_management-u',
            description: 'Property Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033b0',
            name: 'wifi.venue.property_management_units-u',
            description: 'Property Management - Units',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03309',
            name: 'wifi.venue.wifi-u',
            description: 'Wi-Fi',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03308'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033a0',
            name: 'wifi.venue.venue_management-u',
            description: 'Venue Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03308'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03314',
        name: 'wifi.clients-u',
        description: 'Clients',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bc',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03315',
            name: 'wifi.clients.wireless-u',
            description: 'Wireless',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03314'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03316',
            name: 'wifi.clients.identity_management-u',
            description: 'Identity Management',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03314'
          }
        ]
      },
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac03323',
        name: 'wifi.network_control_policies-u',
        description: 'Network Control (Policies)',
        category: 'wifi',
        parentFeatureId: '7d411830a62347f38c956e8affcea8bc',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03330',
            name: 'wifi.network_control_policies.radius_server-u',
            description: 'RADIUS Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03332',
            name: 'wifi.network_control_policies.snmp_agent-u',
            description: 'SNMP Agent',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03336',
            name: 'wifi.network_control_policies.workflow-u',
            description: 'Workflow',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03328',
            name: 'wifi.network_control_policies.mac_registration_list-u',
            description: 'MAC Registration List',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03335',
            name: 'wifi.network_control_policies.wifi_operator-u',
            description: 'wifi Operator',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03324',
            name: 'wifi.network_control_policies.access_control-u',
            description: 'Access Control',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03331',
            name: 'wifi.network_control_policies.rogue_ap_detection-u',
            description: 'Rogue AP Detection',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03334',
            name: 'wifi.network_control_policies.vlan_pool-u',
            description: 'VLAN Pool',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03325',
            name: 'wifi.network_control_policies.adaptive_policy-u',
            description: 'Adaptive Policy',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03329',
            name: 'wifi.network_control_policies.location_based_service-u',
            description: 'Location Based Service',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac033a3',
            name: 'wifi.network_control_policies.tunnelling-u',
            description: 'Tunnelling',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03326',
            name: 'wifi.network_control_policies.client_isolation-u',
            description: 'Client Isolation',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03327',
            name: 'wifi.network_control_policies.identity_provider-u',
            description: 'Identity Provider',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac03333',
            name: 'wifi.network_control_policies.syslog_server-u',
            description: 'Syslog Server',
            category: 'wifi',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac03323'
          }
        ]
      }
    ]
  },
  {
    id: 'cdf2fa2bf09840f993ff0f3eaac02358',
    name: 'msp-c',
    description: 'MSP',
    category: 'MSP',
    subFeatures: [
      {
        id: 'cdf2fa2bf09840f993ff0f3eaac02359',
        name: 'msp.msp-c',
        description: 'MSP',
        category: 'MSP',
        parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02358',
        subFeatures: [
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02361',
            name: 'msp.msp.device_inventory-c',
            description: 'Device Inventory',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02364',
            name: 'msp.msp.msp_portal-c',
            description: 'MSP Portal',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02360',
            name: 'msp.msp.msp_tenant_management-c',
            description: 'MSP Tenant Management',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02363',
            name: 'msp.msp.templates-c',
            description: 'Tempates',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02359'
          },
          {
            id: 'cdf2fa2bf09840f993ff0f3eaac02362',
            name: 'msp.msp.subscriptions-c',
            description: 'Subscriptions',
            category: 'MSP',
            parentFeatureId: 'cdf2fa2bf09840f993ff0f3eaac02359'
          }
        ]
      }
    ]
  }
]
