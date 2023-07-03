import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { MspUrlsInfo }     from '@acx-ui/msp/utils'
import { LicenseUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
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
    deviceCount: 1,
    deviceSubType: null,
    deviceType: 'ANALYTICS',
    effectDate: '2023-02-17T02:03:25.311+00:00',
    effectDays: 0,
    multipleLicense: false,
    totalActiveDevices: 1,
    totalRALicense: 0,
    type: 'RA_BELOW_50_PERCENT_OF_DEVICES'
  },
  {
    deviceCount: 1,
    deviceSubType: null,
    deviceType: 'ANALYTICS',
    effectDate: '2023-02-17T02:03:25.311+00:00',
    effectDays: 0,
    multipleLicense: true,
    totalActiveDevices: 1,
    totalRALicense: 0,
    type: 'INITIAL'
  },
  {
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'WIFI',
    effectDate: '2023-04-10T00:00:00.000+00:00',
    effectDays: 53,
    multipleLicense: false,
    type: 'INITIAL'
  },
  {
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'SWITCH',
    effectDate: '2023-04-10T00:00:00.000+00:00',
    effectDays: 54,
    multipleLicense: false,
    type: 'INITIAL'
  },
  {
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'WIFI',
    effectDate: '2023-04-10T00:00:00.000+00:00',
    effectDays: 53,
    multipleLicense: false,
    type: 'GRACE_PERIOD'
  },
  {
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'WIFI',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectDays: 5,
    multipleLicense: false,
    type: 'CLOSE_TO_EXPIRATION'
  },{
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectDays: 10,
    multipleLicense: true,
    type: 'INITIAL'
  },{
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectDays: 5,
    multipleLicense: true,
    type: 'CLOSE_TO_EXPIRATION'
  },{
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectDays: 5,
    multipleLicense: true,
    type: 'GRACE_PERIOD'
  },{
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'ANALYTICS',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectDays: 5,
    multipleLicense: true,
    type: 'EXPIRED'
  },{
    deviceCount: 40,
    deviceSubType: null,
    deviceType: 'WIFI',
    effectDate: '2023-02-25T00:00:00.000+00:00',
    effectDays: 5,
    multipleLicense: true,
    type: 'GRACE_PERIOD'
  }]



describe('License Banner Component', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'e3d0c24e808d42b1832d47db4c2a7914'
    }
    mockServer.use(
      rest.get(
        LicenseUrlsInfo.getEntitlementsBanners.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        MspUrlsInfo.getMspEntitlementBanner.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render License Banner', async () => {
    render(
      <Provider>
        <HeaderContext.Provider value={{
          searchExpanded: false,
          licenseExpanded: true, setSearchExpanded: jest.fn(), setLicenseExpanded: jest.fn() }}>
          <LicenseBanner />
        </HeaderContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await userEvent.click((await screen.findByTestId('arrowBtn')))

  })

  it('should render License Banner for MSP', async () => {
    render(
      <Provider>
        <HeaderContext.Provider value={{
          searchExpanded: false,
          licenseExpanded: true, setSearchExpanded: jest.fn(), setLicenseExpanded: jest.fn() }}>
          <LicenseBanner isMSPUser={true}/>
        </HeaderContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })

    await userEvent.click((await screen.findByTestId('arrowBtn')))
    expect(await screen.findByText('MSP subscription about to expire in 53 days')).toBeVisible()

  })

})
