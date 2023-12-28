export const mockedEtitlementsList =
  [
    {
      name: 'Switch',
      deviceSubType: 'ICX76',
      deviceType: 'SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889502-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 100,
      sku: 'CLD-MS76-1001'
    },
    {
      name: 'Wi-Fi',
      deviceType: 'WIFI',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Sun Jan 01 23:59:59 UTC 2023',
      id: '373419142-1',
      tempLicense: true,
      lastNotificationDate: null,
      quantity: 80,
      sku: 'CLD-MW00-1001'
    },
    {
      name: 'Switch',
      deviceSubType: 'ICX71L',
      deviceType: 'SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889505-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 30,
      sku: 'CLD-S08M-3001'
    },
    {
      deviceType: 'EDGE',
      effectiveDate: 'Fri Dec 10 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889302-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 70,
      sku: ''
    },
    {
      deviceType: 'UNKOWNTYPE',
      effectiveDate: 'Sun Dec 12 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889509-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 50,
      sku: ''
    },
    {
      name: 'Device',
      deviceType: 'APSW',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889506-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 30,
      sku: '',
      assignedLicense: true
    }
  ]

export const mockedSummary =
  [
    {
      deviceSubType: 'ICX',
      deviceType: 'SWITCH',
      tempLicense: false,
      quantity: 130,
      deviceCount: 2,
      remainingDevices: 5
    },
    {
      deviceSubType: null,
      deviceType: 'WIFI',
      tempLicense: false,
      quantity: 80,
      deviceCount: 3,
      remainingDevices: 15
    },
    {
      deviceSubType: null,
      deviceType: 'EDGE',
      tempLicense: false,
      quantity: 70,
      deviceCount: 2,
      remainingDevices: 20
    },
    {
      deviceSubType: null,
      deviceType: 'UNKOWNTYPE',
      tempLicense: false,
      quantity: 50,
      deviceCount: 0,
      remainingDevices: 25
    },
    {
      deviceSubType: null,
      deviceType: 'ANALYTICS',
      tempLicense: false,
      quantity: 60,
      deviceCount: 80,
      remainingDevices: 0
    }
  ]