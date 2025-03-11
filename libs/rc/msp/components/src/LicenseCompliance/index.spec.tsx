import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, Features }                                           from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo, MspUrlsInfo }                                     from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                           from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { render, screen, mockServer, waitForElementToBeRemoved, fireEvent } from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps }                      from '@acx-ui/user'

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
  },{
    licenseType: 'SLTN_TOKEN',
    self: {
      deviceCompliances: [
        {
          deviceType: 'SLTN_ADAPT_POLICY',
          installedDeviceCount: 10,
          usedLicenseCount: 0
        },
        {
          deviceType: 'SLTN_PMS_INT',
          installedDeviceCount: 20,
          usedLicenseCount: 30
        },
        {
          deviceType: 'SLTN_SIS_INT',
          installedDeviceCount: 10,
          usedLicenseCount: 0
        },
        {
          deviceType: 'SLTN_PI_NET',
          installedDeviceCount: 100,
          usedLicenseCount: 0
        }
      ],
      licenseGap: 0,
      licenseType: 'SLTN_TOKEN',
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

const list = [
  {
    featureType: 'SLTN_PI_NET',
    featureName: 'Personal Identity Network',
    maxQuantity: 0,
    enabled: false,
    capped: false,
    licenseToken: 1,
    featureCostUnit: 'per Tunnel',
    featureUnit: 'Tunnels'
  },
  {
    featureType: 'SLTN_ADAPT_POLICY',
    featureName: 'Adaptive Policy',
    maxQuantity: 0,
    enabled: true,
    capped: true,
    licenseToken: 5,
    featureCostUnit: 'per Policy',
    featureUnit: 'Policies'
  }
]

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

const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)
const userProfileContextValues = {
  isPrimeAdmin
} as UserProfileContextProps

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
      ),
      rest.get(
        MspRbacUrlsInfo.getSolutionTokenSettings.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.patch(
        MspRbacUrlsInfo.updateSolutionTokenSettings.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render table correctly for non-msp', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={false}/>
        </UserProfileContext.Provider>
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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={true}/>
        </UserProfileContext.Provider>
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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={true}/>
        </UserProfileContext.Provider>
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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={true}/>
        </UserProfileContext.Provider>
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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={true} isExtendedTrial={true}/>
        </UserProfileContext.Provider>
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
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={true} isExtendedTrial={true}/>
        </UserProfileContext.Provider>
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

  it('should render device networking card with solution token FF enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={false}/>
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(screen.getByText('Device Networking Licenses')).toBeVisible()

    const tabMaxLiceses = screen.getAllByRole('tab', { name: 'Summary' })[0]
    expect(tabMaxLiceses.getAttribute('aria-selected')).toBeTruthy()
    const tabMaxPeriod = screen.getAllByRole('tab', { name: 'My Account' })[0]
    expect(tabMaxPeriod.getAttribute('aria-selected')).toBe('false')
  })

  it('should render rec solution token card with solution token FF enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isMsp={false}/>
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(screen.getByText('Solution Token Licenses')).toBeVisible()

    const tabSummary = screen.getAllByRole('tab', { name: 'Summary' })[1]
    expect(tabSummary.getAttribute('aria-selected')).toBeTruthy()
    const tabMyAccount = screen.getAllByRole('tab', { name: 'My Account' })[1]
    expect(tabMyAccount.getAttribute('aria-selected')).toBe('false')
    const tabSettings = screen.getByRole('tab', { name: 'Settings' })
    expect(tabSettings.getAttribute('aria-selected')).toBe('false')

    await userEvent.click(tabMyAccount)
    expect(screen.getByText('Adaptive Policy')).toBeVisible()

    await userEvent.click(tabSettings)

    expect(screen.getByRole('tabpanel', { name: 'Settings' } )).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Edit Settings' }))

    expect(screen.getByRole('checkbox', { name: 'Personal Identity Network' } )).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'Adaptive Policy' } )).toBeVisible()

    expect(screen.getByText('Edit Solution Usage Cap')).toBeVisible()

    expect(screen.getByRole('switch', { name: 'Uncapped' } )).toBeVisible()
    expect(screen.getByRole('switch', { name: 'Capped' } )).toBeVisible()

    await userEvent.click((await screen.findByRole('button', { name: 'Save' })))

    expect(await screen.findByText('Solution Usage Cap Updated!')).toBeVisible()

    await userEvent.click((await screen.findAllByRole('button', { name: 'Close' }))[1])

  })

  it('should render msp solution token card settings tab', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <LicenseCompliance isExtendedTrial={true} isMsp={true}/>
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    expect(screen.getByText('Solution Token Licenses')).toBeVisible()

    const tabSummary = screen.getAllByRole('tab', { name: 'MSP Subscriptions' })[1]
    expect(tabSummary.getAttribute('aria-selected')).toBeTruthy()
    const tabMyAccount = screen.getAllByRole('tab', { name: 'My Account' })[1]
    expect(tabMyAccount.getAttribute('aria-selected')).toBe('false')
    const tabSettings = screen.getByRole('tab', { name: 'Settings' })
    expect(tabSettings.getAttribute('aria-selected')).toBe('false')

    await userEvent.click(tabMyAccount)

    expect(tabMyAccount.getAttribute('aria-selected')).toBe('true')

    await userEvent.click(tabSettings)

    expect(screen.getByRole('tabpanel', { name: 'Settings' } )).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Edit Settings' }))

    expect(screen.getByRole('checkbox', { name: 'Personal Identity Network' } )).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'Adaptive Policy' } )).toBeVisible()

    expect(screen.getByText('Edit Solution Usage Cap')).toBeVisible()

    expect(screen.getByRole('switch', { name: 'Uncapped' } )).toBeVisible()
    expect(screen.getByRole('switch', { name: 'Capped' } )).toBeVisible()

    expect(screen.getAllByRole('spinbutton')).toHaveLength(1)

    await userEvent.click(screen.getByRole('switch', { name: 'Capped' }))

    expect(screen.getAllByRole('spinbutton')).toHaveLength(2)

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Tunnels' }), { target: { value: 12 } })

    await userEvent.click((await screen.findByRole('button', { name: 'Save' })))

    expect(await screen.findByText('Solution Usage Cap Updated!')).toBeVisible()

    await userEvent.click((await screen.findAllByRole('button', { name: 'Close' }))[1])

  })
})