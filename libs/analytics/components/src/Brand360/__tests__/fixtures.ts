import { sample } from 'lodash'

import { FranchisorTimeseries } from '../services'
export const fetchBrandProperties = () => {
  const properties = [
    'AC Hotels', 'Courtyard', 'Fairfield', 'Element' , 'Potea Hotels',
    'Four Seasons', 'Hyatt', 'Sheraton', 'J W Marriott' , 'Ramada',
    'Ritz-Carlton', 'Le Meridien', 'Accor', 'Best Western' , 'Holiday Inn',
    'Hilton', 'IHG Hotels & Resorts', 'St Regis Hotels', 'Wyndham Hotels & Resorts',
    'Shangri-La Hotels and Resorts', 'Ibis'
  ]
  const lsps = [
    'Single Digit', 'DeepBlue', 'Delion',
    'Cloud5', 'Hotel Internet Services'
  ]
  const pcts = [
    [54, 100], [73, 100], [64, 100], [5, 10],[6, 10],
    [78, 100], [88, 100], [92, 100], [3, 4], [84, 100 ]
  ]
  const nums = [ 3, 5, 6, 10, 20, 33, 56, 64, 87, 94, 24, 89, 99 ]
  return properties.map(property => {
    const [
      avgConnSuccess = [0, 0],
      avgTTC = [0, 0],
      avgClientThroughput = [0, 0]
    ] = [ sample(pcts), sample(pcts), sample(pcts) ]
    return {
      property,
      lsps: [sample(lsps)], // TODO fetch from RC api and merge
      p1Incidents: sample(nums) || 0,
      ssidCompliance: sample(pcts) || [0, 0],
      deviceCount: sample(nums) || 0,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput
    }
  })
}

export const mockBrandTimeseries = {
  data: {
    franchisorTimeseries: {
      time: [
        '2023-12-11T22:00:00.000Z',
        '2023-12-11T23:00:00.000Z',
        '2023-12-12T00:00:00.000Z',
        '2023-12-12T01:00:00.000Z',
        '2023-12-12T02:00:00.000Z',
        '2023-12-12T03:00:00.000Z',
        '2023-12-12T04:00:00.000Z',
        '2023-12-12T05:00:00.000Z',
        '2023-12-12T06:00:00.000Z'
      ],
      incidentCount: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      ssidComplianceSLA: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      timeToConnectSLA: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      clientThroughputSLA: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      connectionSuccessSLA: [
        0,
        0,
        0,
        0,
        0,
        0.5,
        0.5454545454545454,
        0.7,
        0
      ],
      errors: []
    }
  }
}


export const prevTimeseries = {
  time: [
    '2023-12-11T22:00:00.000Z'
  ],
  incidentCount: [
    20
  ],
  ssidComplianceSLA: [
    0.5
  ],
  timeToConnectSLA: [
    0.5
  ],
  clientThroughputSLA: [
    0.5
  ],
  connectionSuccessSLA: [
    0.5
  ],
  errors: []
}

export const currTimeseries = {
  time: [
    '2023-12-11T22:00:00.000Z'
  ],
  incidentCount: [
    20
  ],
  ssidComplianceSLA: [
    0.4
  ],
  timeToConnectSLA: [
    0.4
  ],
  clientThroughputSLA: [
    0.4
  ],
  connectionSuccessSLA: [
    0.8
  ],
  errors: []
}

export const zeroPrevTimeseries = {
  time: [
    '2023-12-11T22:00:00.000Z'
  ],
  incidentCount: [
    20
  ],
  ssidComplianceSLA: [
    0.5
  ],
  timeToConnectSLA: [
    null
  ],
  clientThroughputSLA: [
    null
  ],
  connectionSuccessSLA: [
    null
  ],
  errors: []
} as unknown as FranchisorTimeseries

export const zeroCurrTimeseries = {
  time: [
    '2023-12-11T22:00:00.000Z'
  ],
  incidentCount: [
    20
  ],
  ssidComplianceSLA: [
    0.4
  ],
  timeToConnectSLA: [
    null
  ],
  clientThroughputSLA: [
    null
  ],
  connectionSuccessSLA: [
    null
  ],
  errors: []
} as unknown as FranchisorTimeseries

export const propertiesMappingData = { data: [
  {
    id: '1',
    name: 'property-1',
    streetAddress: '950 Battery Ave',
    mspAdminCount: 1,
    mspEcAdminCount: 0,
    entitlements: [],
    status: 'Active',
    creationDate: '1704166457659',
    tenantType: 'MSP_REC',
    integrator: '4',
    integrators: ['1'],
    installerCount: 0,
    integratorCount: 1,
    propertyCode: 'PropertyCode1'
  },
  {
    id: '2',
    name: 'property-2',
    streetAddress: '951 Battery Ave',
    mspAdminCount: 1,
    mspEcAdminCount: 0,
    entitlements: [],
    status: 'Active',
    creationDate: '1704166457659',
    tenantType: 'MSP_REC',
    integrator: '4',
    integrators: ['1'],
    installerCount: 0,
    integratorCount: 1,
    propertyCode: 'PropertyCode2'
  },
  {
    id: '3',
    name: 'property-3',
    streetAddress: '952 Battery Ave',
    mspAdminCount: 1,
    mspEcAdminCount: 0,
    entitlements: [],
    status: 'Active',
    creationDate: '1704166457659',
    tenantType: 'MSP_REC',
    integrator: '4',
    integrators: ['1'],
    installerCount: 0,
    integratorCount: 1,
    propertyCode: 'PropertyCode3'
  },
  {
    id: '4',
    name: 'Integrator1',
    entitlements: [
      {
        expirationDateTs: '1709644975000',
        consumed: '0',
        quantity: '1',
        entitlementDeviceType: 'DVCNWTYPE_APSW',
        tenantId: '6508c4b77f124f42b9663aa3074bf317',
        type: 'entitlement',
        expirationDate: '2024-03-05T13:22:55Z',
        toBeRemovedQuantity: 0,
        accountType: 'PAID',
        wifiDeviceCount: '0',
        switchDeviceCount: '0',
        edgeDeviceCount: '0',
        outOfComplianceDevices: '0',
        futureOutOfComplianceDevices: '0',
        futureOfComplianceDate: '1709644975000'
      }
    ],
    status: 'Active',
    accountType: 'PAID',
    wifiLicenses: 0,
    switchLicenses: 0,
    edgeLicenses: 0,
    apSwLicenses: 1,
    tenantType: 'MSP_INTEGRATOR',
    assignedMspEcList: [
      '1',
      '2',
      '3'
    ],
    installerCount: 0,
    integratorCount: 0
  }
] }
export const franchisorZones = {
  data: [
    {
      tenantId: '1',
      zoneName: 'zoneName-1',
      incidentCount: 3,
      ssidComplianceSLA: [3, 3],
      timeToConnectSLA: [84, 84],
      clientThroughputSLA: [34, 44],
      connectionSuccessSLA: [0, 0],
      onlineSwitchesSLA: [1, 1],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '1',
      zoneName: 'zoneName-2',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [null, null],
      onlineSwitchesSLA: [null, null],
      onlineApsSLA: [null, null]
    },
    {
      tenantId: '2',
      zoneName: 'zoneName-3',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null],
      connectionSuccessSLA: [null, null],
      onlineSwitchesSLA: [null, null],
      onlineApsSLA: [null, null]
    },
    {
      tenantId: '2',
      zoneName: 'zoneName-4',
      incidentCount: 1,
      ssidComplianceSLA: [3, 4],
      timeToConnectSLA: [84, 84],
      clientThroughputSLA: [34, 44],
      connectionSuccessSLA: [344, 344],
      onlineSwitchesSLA: [0, 0],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '3',
      zoneName: 'zoneName-5',
      incidentCount: 1,
      ssidComplianceSLA: [2, 4],
      timeToConnectSLA: [39, 42],
      clientThroughputSLA: [12, 40],
      connectionSuccessSLA: [304, 316],
      onlineSwitchesSLA: [0, 0],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '3',
      zoneName: 'zoneName-6',
      incidentCount: 8,
      ssidComplianceSLA: [1, 3],
      timeToConnectSLA: [11, 12],
      clientThroughputSLA: [7, 7],
      connectionSuccessSLA: [45, 56],
      onlineSwitchesSLA: [0, 0],
      onlineApsSLA: [1, 1]
    },
    {
      tenantId: '3',
      zoneName: 'zoneName-7',
      incidentCount: 0,
      ssidComplianceSLA: [0, 0],
      timeToConnectSLA: [0, 0],
      clientThroughputSLA: [0, 0],
      connectionSuccessSLA: [0, 0],
      onlineSwitchesSLA: [0, 0],
      onlineApsSLA: [0, 0]
    }
  ]
}
