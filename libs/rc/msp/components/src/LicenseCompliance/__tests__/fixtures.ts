
export const fakeOwnAccount =
{
  compliances: {
    APSW: [ {
      self: {
        licenseType: 'APSW',
        tenantId: 'c5415309a2a14559a38d6707671c2997',
        tenantName: 'rec-1',
        deviceCompliances: {
          EDGE: {
            deviceType: 'EDGE',
            installedDeviceCount: 5,
            usedLicenseCount: 5
          },
          SWITCH: {
            deviceType: 'SWITCH',
            installedDeviceCount: 10,
            usedLicenseCount: 10
          },
          WIFI: {
            deviceType: 'WIFI',
            installedDeviceCount: 20,
            usedLicenseCount: 20
          },
          VIRTUAL_EDGE: {
            deviceType: 'VIRTUAL_EDGE',
            installedDeviceCount: 5,
            usedLicenseCount: 25
          }
        },
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
    } ]
  },
  page: 1,
  pageSize: 25,
  totalPages: 3
}

export const fakeMspSummary =
{
  compliances: {
    APSW: [ {
      self: {
        licenseType: 'APSW',
        tenantId: '0b6aef780d8d40af8473a4bd8ab923ab',
        tenantName: 'msp-1',
        deviceCompliances: {
          EDGE: {
            deviceType: 'EDGE',
            installedDeviceCount: 5,
            usedLicenseCount: 5
          },
          SWITCH: {
            deviceType: 'SWITCH',
            installedDeviceCount: 10,
            usedLicenseCount: 10
          },
          WIFI: {
            deviceType: 'WIFI',
            installedDeviceCount: 20,
            usedLicenseCount: 20
          },
          VIRTUAL_EDGE: {
            deviceType: 'VIRTUAL_EDGE',
            installedDeviceCount: 5,
            usedLicenseCount: 25
          }
        },
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
        deviceCompliances: {
          EDGE: {
            deviceType: 'EDGE',
            installedDeviceCount: 10,
            usedLicenseCount: 10
          },
          SWITCH: {
            deviceType: 'SWITCH',
            installedDeviceCount: 20,
            usedLicenseCount: 20
          },
          WIFI: {
            deviceType: 'WIFI',
            installedDeviceCount: 100,
            usedLicenseCount: 100
          },
          VIRTUAL_EDGE: {
            deviceType: 'VIRTUAL_EDGE',
            installedDeviceCount: 10,
            usedLicenseCount: 50
          }
        },
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
    } ]
  },
  page: 1,
  pageSize: 25,
  totalPages: 3
}

