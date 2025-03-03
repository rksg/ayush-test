import { rest } from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo }        from '@acx-ui/msp/utils'
import { LicenseUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  HeaderContext
} from '../HeaderContext'

import { LicenseBanner } from './index'

const list = [
  {
    licenseCount: 1,
    deviceSubType: null,
    licenseType: 'ANALYTICS',
    effectDate: '2023-02-17T02:03:25.311+00:00',
    effectiveDays: 0,
    multipleLicense: false,
    totalActiveDevices: 1,
    totalRALicense: 0,
    type: 'RA_BELOW_50_PERCENT_OF_DEVICES'
  },
  {
    licenseCount: 1,
    deviceSubType: null,
    licenseType: 'ANALYTICS',
    effectDate: '2023-02-17T02:03:25.311+00:00',
    effectiveDays: 0,
    multipleLicense: true,
    totalActiveDevices: 1,
    totalRALicense: 0,
    type: 'INITIAL'
  },
  {
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'WIFI',
    effectDate: '2023-04-10T00:00:00.000+00:00',
    effectiveDays: 53,
    multipleLicense: false,
    type: 'INITIAL'
  },
  {
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'SWITCH',
    effectDate: '2023-04-10T00:00:00.000+00:00',
    effectiveDays: 54,
    multipleLicense: false,
    type: 'INITIAL'
  },
  {
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'WIFI',
    effectDate: '2023-04-10T00:00:00.000+00:00',
    effectiveDays: 53,
    multipleLicense: false,
    type: 'GRACE_PERIOD'
  },
  {
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'WIFI',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectiveDays: 5,
    multipleLicense: false,
    type: 'CLOSE_TO_EXPIRATION'
  },{
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectiveDays: 10,
    multipleLicense: true,
    type: 'INITIAL'
  },{
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectiveDays: 5,
    multipleLicense: true,
    type: 'CLOSE_TO_EXPIRATION'
  },{
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectiveDays: 5,
    multipleLicense: true,
    type: 'GRACE_PERIOD'
  },{
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectiveDays: 5,
    multipleLicense: true,
    type: 'EXPIRED'
  },{
    licenseCount: 40,
    deviceSubType: null,
    licenseType: 'WIFI',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectiveDays: 5,
    multipleLicense: true,
    type: 'GRACE_PERIOD'
  }]

const newListData =
  { data: [
    {
      licenseCount: 1,
      deviceSubType: null,
      licenseType: 'ANALYTICS',
      effectDate: '2023-02-17T02:03:25.311+00:00',
      effectiveDays: 0,
      multipleLicense: false,
      totalActiveDevices: 1,
      totalRALicense: 0,
      type: 'RA_BELOW_50_PERCENT_OF_DEVICES'
    },
    {
      licenseCount: 1,
      deviceSubType: null,
      licenseType: 'ANALYTICS',
      effectDate: '2023-02-17T02:03:25.311+00:00',
      effectiveDays: 0,
      multipleLicense: true,
      totalActiveDevices: 1,
      totalRALicense: 0,
      type: 'INITIAL'
    },
    {
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'WIFI',
      effectDate: '2023-04-10T00:00:00.000+00:00',
      effectiveDays: 53,
      multipleLicense: false,
      type: 'INITIAL'
    },
    {
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'SWITCH',
      effectDate: '2023-04-10T00:00:00.000+00:00',
      effectiveDays: 54,
      multipleLicense: false,
      type: 'INITIAL'
    },
    {
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'WIFI',
      effectDate: '2023-04-10T00:00:00.000+00:00',
      effectiveDays: 53,
      multipleLicense: false,
      type: 'GRACE_PERIOD'
    },
    {
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'WIFI',
      effectDate: '2023-02-25T00:00:00.000+00:00',
      effectiveDays: 5,
      multipleLicense: false,
      type: 'CLOSE_TO_EXPIRATION'
    },{
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'ANALYTICS',
      effectDate: '2023-02-25T00:00:00.000+00:00',
      effectiveDays: 10,
      multipleLicense: true,
      type: 'INITIAL'
    },{
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'ANALYTICS',
      effectDate: '2023-02-25T00:00:00.000+00:00',
      effectiveDays: 5,
      multipleLicense: true,
      type: 'CLOSE_TO_EXPIRATION'
    },{
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'ANALYTICS',
      effectDate: '2023-02-25T00:00:00.000+00:00',
      effectiveDays: 5,
      multipleLicense: true,
      type: 'GRACE_PERIOD'
    },{
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'ANALYTICS',
      effectDate: '2023-02-25T00:00:00.000+00:00',
      effectiveDays: 5,
      multipleLicense: true,
      type: 'EXPIRED'
    },{
      licenseCount: 40,
      deviceSubType: null,
      licenseType: 'WIFI',
      effectDate: '2023-02-25T00:00:00.000+00:00',
      effectiveDays: 5,
      multipleLicense: true,
      type: 'GRACE_PERIOD'
    }]
  }

describe('License Single Component', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.ENTITLEMENT_RBAC_API)
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'e3d0c24e808d42b1832d47db4c2a7914'
    }
    mockServer.use(
      rest.get(
        LicenseUrlsInfo.getEntitlementsBanners.url,
        (req, res, ctx) => res(ctx.json([list[2]]))
      ),
      rest.post(
        MspRbacUrlsInfo.getEntitlementsAttentionNotes.url,
        (req, res, ctx) => res(ctx.json({
          data: [{ summary: 'Test Summary', details: 'Test Details' }]
        }))
      ),
      rest.post(
        LicenseUrlsInfo.getBanners.url,
        (req, res, ctx) => res(ctx.json([newListData.data[2]]))
      )
    )
  })

  it('should render Single License Banner Correctly', async () => {
    render(
      <Provider>
        <HeaderContext.Provider value={{
          searchExpanded: false,
          licenseExpanded: true, setSearchExpanded: jest.fn(), setLicenseExpanded: jest.fn() }}>
          <LicenseBanner/>
        </HeaderContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })
    expect(
      await screen.findByText('Your RUCKUS One subscription for 40 Wi-Fi expires in 53 days')
    ).toBeVisible()

  })
})

