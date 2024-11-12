import { ConfigTemplate } from '@acx-ui/rc/utils'

export const aclDetail = {
  name: 'acl-test',
  id: 'c9c0667abfe74ab7803999a793fd2bbe',
  devicePolicy: {
    id: '0ad092ad70854801849b56b9402e8d57',
    enabled: true
  },
  l2AclPolicy: {
    id: 'e621cd8aa3f84f2faf04635e59a5db7b',
    enabled: true
  },
  l3AclPolicy: {
    id: 'c0f516233e9346df8f9f93bf7d799326',
    enabled: true
  },
  applicationPolicy: {
    id: '8139f9da75c64cd48582b40897df1609',
    enabled: true
  },
  rateLimiting: {
    uplinkLimit: 85,
    downlinkLimit: 26,
    enabled: true
  }
}

export const enhancedAccessControlList = {
  fields: [
    'clientRateUpLinkLimit',
    'l3AclPolicyId',
    'applicationPolicyName',
    'clientRateDownLinkLimit',
    'devicePolicyName',
    'l2AclPolicyId',
    'networkIds',
    'name',
    'applicationPolicyId',
    'id',
    'l3AclPolicyName',
    'l2AclPolicyName',
    'devicePolicyId'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '7217d467353744d9aac8493324501be3',
      name: 'My Access Control 1',
      l2AclPolicyName: 'layer2-1',
      l2AclPolicyId: 'e621cd8aa3f84f2faf04635e59a5db7b',
      l3AclPolicyName: 'layer3-1',
      l3AclPolicyId: 'c0f516233e9346df8f9f93bf7d799326',
      devicePolicyName: 'device-1',
      devicePolicyId: '0ad092ad70854801849b56b9402e8d57',
      applicationPolicyName: 'application-1',
      applicationPolicyId: '8139f9da75c64cd48582b40897df1609',
      clientRateUpLinkLimit: 85,
      clientRateDownLinkLimit: 26,
      networkIds: [],
      networkCount: 0
    }
  ]
}

export const aclList = [aclDetail]

export const enhancedLayer2PolicyListResponse = {
  fields: [
    'macAddress',
    'networkIds',
    'name',
    'description',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'e621cd8aa3f84f2faf04635e59a5db7b',
      name: 'layer2-1',
      macAddress: '1',
      networkIds: []
    }
  ]
}

export const layer2PolicyListResponse = [
  {
    id: '36ec4826b5da48cc8118eda83aa4080f',
    name: 'layer2policy1',
    macAddressesCount: 1,
    networksCount: 0
  }
]

export const layer2Response = {
  name: 'layer2policy1',
  access: 'BLOCK',
  macAddresses: [
    '55:55:55:55:55:55'
  ],
  id: '36ec4826b5da48cc8118eda83aa4080f'
}

export const enhancedLayer3PolicyListResponse = {
  fields: [
    'networkIds',
    'name',
    'description',
    'rules',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4279f73355044b8fa54e0e738188dc5c',
      name: 'layer3-1',
      networkIds: []
    },
    {
      id: 'b5b0d53279254885a497191670bd3a4b',
      name: 'layer3-2',
      networkIds: []
    }
  ]
}

export const layer3PolicyListResponse = [
  {
    id: '233d3182a1aa49ee9f50aeb039347021',
    name: 'layer3policy1',
    rulesCount: 1,
    networksCount: 0
  }
]

export const layer3Response = {
  name: 'layer3policy1',
  defaultAccess: 'BLOCK',
  l3Rules: [
    {
      priority: 1,
      access: 'ALLOW',
      source: {
        enableIpSubnet: false
      },
      destination: {
        enableIpSubnet: false
      },
      id: '96b80fe415fe4131addbb1a6e967167d'
    }
  ],
  id: '233d3182a1aa49ee9f50aeb039347021'
}

export const enhancedApplicationPolicyListResponse = {
  fields: [
    'networkIds',
    'name',
    'description',
    'rules',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '8097d6206f094410ba09fb1cc81ddf5d',
      name: 'app5',
      networkIds: []
    }
  ]
}

export const enhancedDevicePolicyListResponse = {
  fields: [
    'networkIds',
    'name',
    'description',
    'rules',
    'id'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'dfe9cf68ab734513a46626da3f896574',
      name: 'dev1',
      networkIds: []
    },
    {
      id: '02d8e791fad34e54acd36b0adae6f59f',
      name: 'dev2-block',
      networkIds: []
    },
    {
      id: '84eb837c59e84761a1c836591d4be331',
      name: 'device-1',
      networkIds: []
    }
  ]
}

export const devicePolicyListResponse = [
  {
    id: '84eb837c59e84761a1c836591d4be331',
    name: 'device-1',
    rulesCount: 1,
    networksCount: 0
  }
]

export const networkListResponse = {
  fields: [
    'clientRateUpLinkLimit',
    'l3AclPolicyId',
    'applicationPolicyName',
    'clientRateDownLinkLimit',
    'devicePolicyName',
    'l2AclPolicyId',
    'networkIds',
    'name',
    'applicationPolicyId',
    'id',
    'l3AclPolicyName',
    'l2AclPolicyName',
    'devicePolicyId'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'test1',
      id: '42c47e5505914752a41625b7dafca1c7'
    },
    {
      name: 'test2',
      id: 'ed345f9b052543bf8eef90e169227668'
    },
    {
      name: 'test3',
      id: '3cc8f9dc12334e5da69a8f06aef84dc4'
    },
    {
      name: 'test4',
      id: 'ed4ed15bd6fc42b6bcf9286e1cccd97b'
    },
    {
      name: 'test5',
      id: 'e38c875409364926a97c44a4882cb8e7'
    }
  ]
}

export const avcCat = [
  {
    catName: 'Web',
    catId: 30
  },
  {
    catName: 'Printer',
    catId: 21
  },
  {
    catName: 'Audio/Video',
    catId: 3
  }
]

export const avcApp = [{
  appName: 'BBC',
  avcAppAndCatId: {
    catId: 30,
    appId: 1754
  }
}, {
  appName: 'AppsFlyer',
  avcAppAndCatId: {
    catId: 30,
    appId: 2334
  }
}, {
  appName: 'BJNP',
  avcAppAndCatId: {
    catId: 21,
    appId: 2481
  }
}, {
  appName: '050 plus',
  avcAppAndCatId: {
    catId: 3,
    appId: 1123
  }
}]

export const queryApplication = [
  {
    id: 'edac8b0c22e140cd95e63a9e81421576',
    name: 'app1',
    rulesCount: 2,
    networksCount: 0
  },
  {
    id: 'e51edc33a9764b1284c0fd201806e4d4',
    name: 'app2',
    description: 'sdfasdf',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '02f18ac24a504cd88ed6a94025b64d44',
    name: 'app3',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '9ad95d4741b44fbfbab55914c104eea4',
    name: 'app4',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '8403ff88c526465b8070f50ca4547281',
    name: 'app5',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: 'e1ba3e5ca73b4bbf8c53bb5feff31f9b',
    name: 'app6-activityMsg',
    rulesCount: 1,
    networksCount: 0
  }
]

export const applicationDetail = {
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  name: 'app1',
  rules: [
    {
      name: 'appRule2',
      ruleType: 'USER_DEFINED',
      accessControl: 'DENY',
      priority: 2,
      applicationName: 'userDefinedAppName',
      applicationId: 1,
      portMapping: 'IP_WITH_PORT',
      destinationIp: '1.1.1.1',
      netmask: '255.255.255.0',
      destinationPort: 20,
      protocol: 'TCP',
      id: 'd0c06ec39bac4515b150ca4dac7e9b30'
    },
    {
      name: 'appRule1',
      ruleType: 'SIGNATURE',
      accessControl: 'DENY',
      priority: 1,
      category: 'Audio/Video',
      categoryId: 3,
      applicationName: '050 plus',
      applicationId: 1123,
      id: 'bcbcb881099946f5aad7841e2ca0d73f'
    }
  ],
  id: 'edac8b0c22e140cd95e63a9e81421576'
}

export const mockedConfigTemplateList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '1',
      name: 'Template 1',
      createdOn: 1690598400000,
      createdBy: 'Author 1',
      appliedOnTenants: ['t1', 't2'],
      type: 'NETWORK',
      lastModified: 1690598400000,
      lastApplied: 1690598405000
    },
    {
      id: '2',
      name: 'Template 2',
      createdOn: 1690598500000,
      createdBy: 'Author 2',
      appliedOnTenants: [],
      type: 'NETWORK',
      lastModified: 1690598500000,
      lastApplied: 1690598505000
    },
    {
      id: '3',
      name: 'Template 3',
      createdOn: 1690598500000,
      createdBy: 'Author 3',
      appliedOnTenants: ['t1'],
      templateType: 'RADIUS',
      lastModified: 1690598500000,
      lastApplied: 1690598510000
    },
    {
      id: '4',
      name: 'Template 4',
      createdOn: 1690598500000,
      createdBy: 'Author 4',
      templateType: 'Layer 2 Policy',
      lastModified: 1690598500000
    }
  ] as ConfigTemplate[]
}

export const mockedMSPCustomerList = {
  fields: [
    'tenantType',
    'streetAddress',
    'name',
    'id',
    'check-all',
    'status'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'a80624a0549440868a846626084f57c9',
      name: 'ec-1',
      streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      entitlements: [
        {
          expirationDateTs: '1703037906000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: 'a80624a0549440868a846626084f57c9',
          type: 'entitlement',
          expirationDate: '2023-12-20T02:05:06Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1703037906000'
        }
      ],
      status: 'Active',
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      tenantType: 'MSP_EC',
      installerCount: 0,
      integratorCount: 0
    }
  ]
}

export const layer2PolicyDetailResponse = {
  name: 'blockL2Acl',
  access: 'ALLOW',
  macAddresses: [
    '11:11:11:11:11:11'
  ],
  id: 'a760d3fee7934128b16fce99f78e94df'
}

export const layer3PolicyDetailResponse = {
  name: 'l3-010',
  defaultAccess: 'ALLOW',
  l3Rules: [
    {
      priority: 1,
      access: 'ALLOW',
      source: {
        enableIpSubnet: false
      },
      destination: {
        enableIpSubnet: false
      },
      id: '96b80fe415fe4131addbb1a6e967167d'
    }
  ],
  id: '233d3182a1aa49ee9f50aeb039347021'
}

export const devicePolicyDetailResponse = {
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  name: 'device1-another',
  defaultAccess: 'ALLOW',
  rules: [
    {
      name: 'vlan101',
      action: 'ALLOW',
      deviceType: 'Tablet',
      osVendor: 'Ios'
    },
    {
      name: 'rule_f',
      action: 'ALLOW',
      deviceType: 'Smartphone',
      osVendor: 'Ios',
      downloadRateLimit: 107.7,
      uploadRateLimit: 200,
      vlan: 12
    }
  ],
  id: 'fdd2bc421cb445daac8937dbb2366f5e'
}

export const applicationDetailResponse = {
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  name: 'app1',
  rules: [
    {
      name: 'appRule3',
      ruleType: 'SIGNATURE',
      accessControl: 'RATE_LIMIT',
      priority: 3,
      category: 'Antivirus',
      categoryId: 1,
      applicationName: 'Lookout Mobile Security',
      applicationId: 2795,
      uplink: 1250,
      downlink: 9250,
      id: '5d7414032d254bb39926792181276e4b'
    },
    {
      name: 'appRule2',
      ruleType: 'USER_DEFINED',
      accessControl: 'DENY',
      priority: 2,
      applicationName: 'userDefinedAppName',
      applicationId: 1,
      portMapping: 'IP_WITH_PORT',
      destinationIp: '1.1.1.1',
      netmask: '255.255.255.0',
      destinationPort: 20,
      protocol: 'TCP',
      id: 'd0c06ec39bac4515b150ca4dac7e9b30'
    },
    {
      name: 'appRule1',
      ruleType: 'SIGNATURE',
      accessControl: 'DENY',
      priority: 1,
      category: 'Audio/Video',
      categoryId: 3,
      applicationName: '050 plus',
      applicationId: 1123,
      id: 'bcbcb881099946f5aad7841e2ca0d73f'
    }
  ],
  id: 'edac8b0c22e140cd95e63a9e81421576'
}
