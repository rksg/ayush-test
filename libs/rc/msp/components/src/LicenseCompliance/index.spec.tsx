import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { LicenseCompliance } from '.'

const compliances = {
  compliances: [{
    licenseType: 'APSW',
    self: {
      deviceCompliances: [
        { deviceType: 'VIRTUAL_EDGE', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'RWG', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'EDGE', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'WIFI', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'SWITCH', installedDeviceCount: 3, usedLicenseCount: 3 }
      ],
      licenseGap: 0,
      licenseType: 'APSW',
      licensesUsed: 3,
      nextPaidExpirationDate: '2024-07-26',
      nextTotalPaidExpiringLicenseCount: 1000,
      nextTotalTrialExpiringLicenseCount: 0,
      tenantId: 'eb76e2f9e7174c7aa317aaee5f84541b',
      tenantName: 'Dog Company 951',
      totalActivePaidAssignedLicenseCount: 0,
      totalActivePaidLicenseCount: 1180,
      totalActiveTrialAssignedLicenseCount: 0,
      totalActiveTrialLicenseCount: 0
    }
  }]
}

const compliancesWithSummary = {
  compliances: [{
    licenseType: 'APSW',
    mspEcSummary: {
      deviceCompliances: [
        { deviceType: 'VIRTUAL_EDGE', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'RWG', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'EDGE', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'WIFI', installedDeviceCount: 0, usedLicenseCount: 0 },
        { deviceType: 'SWITCH', installedDeviceCount: 3, usedLicenseCount: 3 }
      ],
      licenseGap: 0,
      licenseType: 'APSW',
      licensesUsed: 3,
      nextPaidExpirationDate: '2024-07-26',
      nextTotalPaidExpiringLicenseCount: 1000,
      nextTotalTrialExpiringLicenseCount: 0,
      tenantId: 'eb76e2f9e7174c7aa317aaee5f84541b',
      tenantName: 'Dog Company 951',
      totalActivePaidAssignedLicenseCount: 0,
      totalActivePaidLicenseCount: 1180,
      totalActiveTrialAssignedLicenseCount: 0,
      totalActiveTrialLicenseCount: 0
    }
  }]
}

const services = require('@acx-ui/msp/services')
describe('LicenseCompliance', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useAssignMspEcToIntegratorMutation')
    services.useGetEntitlementsCompliancesQuery = jest.fn().mockImplementation(() => {
      return { data: compliances }
    })
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render table correctly for non-msp', async () => {
    render(
      <Provider>
        <LicenseCompliance isMsp={false}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(screen.getByText('Device Networking Subscriptions')).toBeVisible()
    expect(screen.getByText('License Expiration')).toBeVisible()
  })
  it('should render table correctly for msp', async () => {
    const mspCompliances = { ...compliances }
    mspCompliances.compliances[0].self.licenseGap = -1
    mspCompliances.compliances[0].self.totalActiveTrialLicenseCount = 1
    services.useGetEntitlementsCompliancesQuery = jest.fn().mockImplementation(() => {
      return { data: mspCompliances }
    })
    render(
      <Provider>
        <LicenseCompliance isMsp={true}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(screen.getAllByText('Device Networking Subscriptions')).toHaveLength(2)
    expect(screen.getByText('My Account License Expiration')).toBeVisible()
    expect(screen.getByText('MSP Customers License Expiration')).toBeVisible()
  })
  it('should render table correctly for no self data', async () => {
    services.useGetEntitlementsCompliancesQuery = jest.fn().mockImplementation(() => {
      return { data: compliancesWithSummary }
    })
    render(
      <Provider>
        <LicenseCompliance isMsp={true}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })
    expect(screen.getAllByText('Device Networking Subscriptions')).toHaveLength(2)
    expect(screen.getByText('My Account License Expiration')).toBeVisible()
    expect(screen.getByText('MSP Customers License Expiration')).toBeVisible()
  })
})
