import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, Features }                                from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo, MspUrlsInfo }                          from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { render, screen, mockServer, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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

const mileageReportData = {
  totalCount: 2,
  page: 1,
  pageSize: 10,
  data: [
    {
      licenseType: 'APSW',
      lastDate: '2024-09-30',
      device: 350,
      usedQuantity: 350,
      quantity: 400,
      availableBreakUp: [
        {
          quantity: 20,
          expirationDate: '2024-09-16'
        },
        {
          quantity: 30,
          expirationDate: '2024-09-01'
        }
      ]
    },
    {
      licenseType: 'APSW',
      lastDate: '2024-10-31',
      device: 350,
      usedQuantity: 350,
      quantity: 390,
      availableBreakUp: [
        {
          quantity: 10,
          expirationDate: '2024-10-16'
        }
      ]
    }
  ]
}

const fakeTenantDetails = {
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

const services = require('@acx-ui/msp/services')
describe('LicenseCompliance', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useAssignMspEcToIntegratorMutation')
    services.useGetEntitlementsCompliancesQuery = jest.fn().mockImplementation(() => {
      return { data: compliances }
    })
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.post(
        MspRbacUrlsInfo.getEntitlementsAttentionNotes.url,
        (req, res, ctx) => res(ctx.json({
          data: [{ summary: 'Test Summary', details: 'Test Details' }]
        }))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        MspRbacUrlsInfo.getLicenseMileageReports.url,
        (req, res, ctx) => res(ctx.json(mileageReportData))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
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
  it('should render banner correctly when compliance notes enabled', async () => {
    services.useGetEntitlementsCompliancesQuery = jest.fn().mockImplementation(() => {
      return { data: compliancesWithSummary }
    })
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_COMPLIANCE_NOTES_TOGGLE)
    render(
      <Provider>
        <LicenseCompliance isMsp={true}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })
    expect(await screen.findByText('Attention Notes')).toBeVisible()
    expect(await screen.findByText('- Test Summary')).toBeVisible()
    expect(screen.queryByText('Test Details')).toBeNull()
    await userEvent.click(screen.getByText('Show more'))
    expect(await screen.findByText('Test Details')).toBeVisible()
    await userEvent.click(screen.getByText('Show less'))
    expect(screen.queryByText('Test Details')).toBeNull()
  })
  it('should render correctly when show compliance phase 2 enabled', async () => {
    services.useGetEntitlementsCompliancesQuery = jest.fn().mockImplementation(() => {
      return { data: compliancesWithSummary }
    })
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_LICENSE_COMPLIANCE_PHASE2_TOGGLE)
    render(
      <Provider>
        <LicenseCompliance isMsp={true} isExtendedTrial={true}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })
    expect(screen.getByRole('button', { name: 'View Details' })).toBeVisible()
    expect(await screen.findByText('License Distance Calculator')).toBeVisible()
    expect(screen.getByText('Active Extended Trial Licenses')).toBeVisible()
    await userEvent.click(screen.getByText('View Details'))
    expect(screen.getAllByText('Device Networking Subscriptions')).toHaveLength(4)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getAllByText('Device Networking Subscriptions')).toHaveLength(3)
  })

  it('should render timelinegraph', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_LICENSE_COMPLIANCE_PHASE2_TOGGLE)
    render(
      <Provider>
        <LicenseCompliance isMsp={true} isExtendedTrial={true}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })
    const btn = screen.getByRole('button', { name: 'Click Here' })
    expect(await screen.findByText('License Distance Calculator')).toBeVisible()
    await userEvent.click(btn)
    expect(screen.getByText('Device Networking Paid Licenses')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
})
