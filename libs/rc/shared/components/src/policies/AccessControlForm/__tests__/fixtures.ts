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

export const aclList = [aclDetail]

export const aclResponse = {
  requestId: '7305b668-b40b-439f-ba25-05ba6d587333'
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

export const devicePolicyListResponse = [
  {
    id: '84eb837c59e84761a1c836591d4be331',
    name: 'device-1',
    rulesCount: 1,
    networksCount: 0
  }
]

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

export const devicePolicyDetailWith32RulesResponse = {
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  name: '32 Rules w/o New Gaming Rules',
  defaultAccess: 'ALLOW',
  rules: [
    {
      name: 'Block Dell (Printer)',
      action: 'BLOCK',
      deviceType: 'Printer',
      osVendor: 'DellPrinter'
    },
    {
      name: 'Block Brother (Printer)',
      action: 'BLOCK',
      deviceType: 'Printer',
      osVendor: 'BrotherPrinter'
    },
    {
      name: 'Block Epson (Printer)',
      action: 'BLOCK',
      deviceType: 'Printer',
      osVendor: 'EpsonPrinter'
    },
    {
      name: 'Block Nest Camera',
      action: 'BLOCK',
      deviceType: 'IotDevice',
      osVendor: 'NestCamera'
    },
    {
      name: 'Block Nest Thermostat',
      action: 'BLOCK',
      deviceType: 'IotDevice',
      osVendor: 'NestThermostat'
    },
    {
      name: 'Block Wemo Smart Switch',
      action: 'BLOCK',
      deviceType: 'IotDevice',
      osVendor: 'WemoSmartSwitch'
    },
    {
      name: 'Block Wi-Fi Smart Plug',
      action: 'BLOCK',
      deviceType: 'IotDevice',
      osVendor: 'WifiSmartPlug'
    },
    {
      name: 'Block Windows',
      action: 'BLOCK',
      deviceType: 'Laptop',
      osVendor: 'Windows'
    },
    {
      name: 'Block macOS',
      action: 'BLOCK',
      deviceType: 'Laptop',
      osVendor: 'MacOs'
    },
    {
      name: 'Block ChromeOS',
      action: 'BLOCK',
      deviceType: 'Laptop',
      osVendor: 'ChromeOs'
    },
    {
      name: 'Block Linux',
      action: 'BLOCK',
      deviceType: 'Laptop',
      osVendor: 'Linux'
    },
    {
      name: 'Block Ubuntu',
      action: 'BLOCK',
      deviceType: 'Laptop',
      osVendor: 'Ubuntu'
    },
    {
      name: 'Block iOS',
      action: 'BLOCK',
      deviceType: 'Smartphone',
      osVendor: 'Ios'
    },
    {
      name: 'Block Android',
      action: 'BLOCK',
      deviceType: 'Smartphone',
      osVendor: 'Android'
    },
    {
      name: 'Block BlackBerry',
      action: 'BLOCK',
      deviceType: 'Smartphone',
      osVendor: 'BlackBerry'
    },
    {
      name: 'Block Windows (Smartphone)',
      action: 'BLOCK',
      deviceType: 'Smartphone',
      osVendor: 'Windows'
    },
    {
      name: 'Block iOS (Tablet)',
      action: 'BLOCK',
      deviceType: 'Tablet',
      osVendor: 'Ios'
    },
    {
      name: 'Block Amazon Kindle',
      action: 'BLOCK',
      deviceType: 'Tablet',
      osVendor: 'AmazonKindle'
    },
    {
      name: 'Block Android (Tablet)',
      action: 'BLOCK',
      deviceType: 'Tablet',
      osVendor: 'Android'
    },
    {
      name: 'Block Windows (Tablet)',
      action: 'BLOCK',
      deviceType: 'Tablet',
      osVendor: 'Windows'
    },
    {
      name: 'Block Cisco (VoIP)',
      action: 'BLOCK',
      deviceType: 'Voip',
      osVendor: 'CiscoIpPhone'
    },
    {
      name: 'Block Avaya (VoIP)',
      action: 'BLOCK',
      deviceType: 'Voip',
      osVendor: 'AvayaIpPhone'
    },
    {
      name: 'Block LinksysPapVoip',
      action: 'BLOCK',
      deviceType: 'Voip',
      osVendor: 'LinksysPapVoip'
    },
    {
      name: 'Block Nortel',
      action: 'BLOCK',
      deviceType: 'Voip',
      osVendor: 'NortelIpPhone'
    },
    {
      name: 'Block GameCube',
      action: 'BLOCK',
      deviceType: 'Gaming',
      osVendor: 'GameCube'
    },
    {
      name: 'Block Wii',
      action: 'BLOCK',
      deviceType: 'Gaming',
      osVendor: 'Wii'
    },
    {
      name: 'Block Nintendo',
      action: 'BLOCK',
      deviceType: 'Gaming',
      osVendor: 'Nintendo'
    },
    {
      name: 'Block HP (Printer)',
      action: 'BLOCK',
      deviceType: 'Printer',
      osVendor: 'HpPrinter'
    },
    {
      name: 'Block Canon (Printer)',
      action: 'BLOCK',
      deviceType: 'Printer',
      osVendor: 'CanonPrinter'
    },
    {
      name: 'Block Xerox (Printer)',
      action: 'BLOCK',
      deviceType: 'Printer',
      osVendor: 'XeroxPrinter'
    },
    {
      name: 'Block SonyPlayer',
      action: 'BLOCK',
      deviceType: 'HomeAvEquipment',
      osVendor: 'SonyPlayer'
    },
    {
      name: 'Block AppleTv',
      action: 'BLOCK',
      deviceType: 'HomeAvEquipment',
      osVendor: 'AppleTv'
    }
  ],
  id: '2788474403774ba4959c06c7a1db71ec'
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
    rulesCount: 3,
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

export const queryApplicationUpdate = [
  ...queryApplication,
  {
    id: '6ab1a781711e492eb05a70f9f9ba253a',
    name: 'app1-test',
    rulesCount: 1,
    networksCount: 0
  }
]

export const applicationDetail = {
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
