import { DeviceComplianceType } from '@acx-ui/msp/utils'

export const fakeOwnAccount =
{
  compliances: [
    {
      licenseType: 'APSW',
      self: {
        tenantId: 'c5415309a2a14559a38d6707671c2997',
        tenantName: 'rec-1',
        licenseType: 'APSW',
        deviceCompliances: [
          {
            deviceType: DeviceComplianceType.WIFI,
            installedDeviceCount: 20,
            usedLicenseCount: 20
          },
          {
            deviceType: DeviceComplianceType.SWITCH,
            installedDeviceCount: 10,
            usedLicenseCount: 10
          },
          {
            deviceType: DeviceComplianceType.EDGE,
            installedDeviceCount: 5,
            usedLicenseCount: 5
          },
          {
            deviceType: DeviceComplianceType.VIRTUAL_EDGE,
            installedDeviceCount: 5,
            usedLicenseCount: 25
          }
        ],
        totalActivePaidLicenseCount: 20,
        totalActiveTrialLicenseCount: 10,
        nextPaidExpirationDate: '2024-09-23',
        nextTotalPaidExpiringLicenseCount: 30,
        nextTrialExpirationDate: '2024-08-23',
        nextTotalTrialExpiringLicenseCount: 5,
        totalActivePaidAssignedLicenseCount: 0,
        totalActiveTrialAssignedLicenseCount: 0,
        licensesUsed: 60,
        licenseGap: -30
      }
    }
  ]
}

export const fakeMspSummary =
{
  compliances: [
    {
      licenseType: 'APSW',
      self: {
        licenseType: 'APSW',
        tenantId: '0b6aef780d8d40af8473a4bd8ab923ab',
        tenantName: 'msp-1',
        deviceCompliances: [
          {
            deviceType: DeviceComplianceType.WIFI,
            installedDeviceCount: 20,
            usedLicenseCount: 20
          },
          {
            deviceType: DeviceComplianceType.SWITCH,
            installedDeviceCount: 10,
            usedLicenseCount: 10
          },
          {
            deviceType: DeviceComplianceType.EDGE,
            installedDeviceCount: 5,
            usedLicenseCount: 5
          },
          {
            deviceType: DeviceComplianceType.VIRTUAL_EDGE,
            installedDeviceCount: 5,
            usedLicenseCount: 25
          }
        ],
        totalActivePaidLicenseCount: 20,
        totalActiveTrialLicenseCount: 10,
        nextPaidExpirationDate: '2024-09-23',
        nextTotalPaidExpiringLicenseCount: 30,
        nextTrialExpirationDate: '2024-08-23',
        nextTotalTrialExpiringLicenseCount: 5,
        totalActivePaidAssignedLicenseCount: 20,
        totalActiveTrialAssignedLicenseCount: 5,
        licensesUsed: 60,
        licenseGap: -5
      },
      mspEcSummary: {
        licenseType: 'APSW',
        tenantId: 'e062a078b5dc427c97ebdcecaf65a34b',
        tenantName: 'msp-1',
        deviceCompliances: [
          {
            deviceType: 'WIFI',
            installedDeviceCount: 100,
            usedLicenseCount: 100
          },
          {
            deviceType: 'SWITCH',
            installedDeviceCount: 20,
            usedLicenseCount: 20
          },

          {
            deviceType: 'VIRTUAL_EDGE',
            installedDeviceCount: 10,
            usedLicenseCount: 50
          }
        ],
        totalActivePaidLicenseCount: 200,
        totalActiveTrialLicenseCount: 50,
        nextPaidExpirationDate: '2024-12-31',
        nextTotalPaidExpiringLicenseCount: 50,
        nextTrialExpirationDate: '2024-09-23',
        nextTotalTrialExpiringLicenseCount: 20,
        totalActivePaidAssignedLicenseCount: 0,
        totalActiveTrialAssignedLicenseCount: 0,
        licensesUsed: 180,
        licenseGap: 0
      }
    }]
}

export const emptyCompliance =
{
  licenseType: 'APSW',
  tenantId: '',
  tenantName: '',
  deviceCompliances: [
    {
      deviceType: DeviceComplianceType.WIFI,
      installedDeviceCount: 0,
      usedLicenseCount: 0
    },
    {
      deviceType: DeviceComplianceType.SWITCH,
      installedDeviceCount: 0,
      usedLicenseCount: 0
    },
    {
      deviceType: DeviceComplianceType.EDGE,
      installedDeviceCount: 0,
      usedLicenseCount: 0
    },
    {
      deviceType: DeviceComplianceType.VIRTUAL_EDGE,
      installedDeviceCount: 0,
      usedLicenseCount: 0
    }
  ],
  totalActivePaidLicenseCount: 0,
  totalActiveTrialLicenseCount: 0,
  nextPaidExpirationDate: '',
  nextTotalPaidExpiringLicenseCount: 0,
  nextTrialExpirationDate: '0',
  nextTotalTrialExpiringLicenseCount: 0,
  totalActivePaidAssignedLicenseCount: 0,
  totalActiveTrialAssignedLicenseCount: 0,
  licensesUsed: 0,
  licenseGap: 0
}

export const fakeAttentionNotes =
{
  attentionNotes: [
    {
      // eslint-disable-next-line max-len
      summary: 'On January 1st, 2025, RUCKUS One will stop adding 5% courtesy licenses to the MSP subscriptions',
      details: [
        `As of this date, MSP subscriptions with a starting date before Jan 1st, 
        2025 will continue to carry their courtesy 5% until their expiration`,
        `All MSP subscriptions starting on January 1st, 
        2025 or after will not receive the 5% courtesy licenses`
      ]
    },
    {
      // eslint-disable-next-line max-len
      summary: 'On March 1, 2025 RUCKUS One will start enforcing subscription expiration policy, which may have an impact on your network operation.'
    }

  ]
}

