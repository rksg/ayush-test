import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import Firewall                                from './Firewall'
import HelpPage, { getMappingURL, getDocsURL } from './HelpPage'

import HelpButton from './'

const GLOBAL_VALUES = {
  DOCUMENTATION: 'https://docs.cloud.ruckuswireless.com/alto/mapfile/index.html',
  // eslint-disable-next-line max-len
  HOW_TO_VIDEOS: 'https://www.youtube.com/watch?v=aGmYx92_1dQ&list=PLySwoo7u9-KJY4EXSzZGLLaH9nuEAzurm',
  CONTACT_SUPPORT: 'https://support-qa.ruckuswireless.com/contact-us',
  OPEN_CASE: 'https://support-qa.ruckuswireless.com/cases/new',
  MY_OPEN_CASES: 'https://support-qa.ruckuswireless.com/cases/cloud',
  PRIVACY: 'https://www.commscope.com/about-us/privacy-statement',
  CHANGE_PASSWORD: 'https://support-qa.ruckuswireless.com/edit_my_profile',
  MANAGE_LICENSES: 'https://support-qa.ruckuswireless.com/cloud_subscriptions',
  MLISA_UI_URL: 'https://devalto.ruckuswireless.com/api/a4rc',
  CAPTIVE_PORTAL_DOMAIN_NAME: 'devalto.ruckuswireless.com',
  GOOGLE_MAPS_KEY: 'AIzaSyDq4QI2gdhGotqFiR28ZXk_RkbWtZ-IMDQ',
  SUPPORTED_AP_MODELS: 'https://www.commscope.com/cloud-supported-network-devices',
  ANALYTICS_FREE_TRIAL: 'https://www.commscope.com/free-ra-trial-offer',
  SZ_IP_LIST: '35.0.0.0/8',
  PENDO_API_KEY: 'b775f526-720b-449c-7fca-f45b7c3df0ae',
  GA_TRACKING_ID: '',
  DISABLE_GA: 'false',
  API_DOCS: 'https://support.ruckuswireless.com/documents/3238',
  DISABLE_PENDO: 'false',
  // eslint-disable-next-line max-len
  AG_GRID_KEY: 'CompanyName=SHI International Corp_on_behalf_of_Ruckus Wireless Inc.,LicensedApplication=RUCKUS Cloud,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=4,LicensedProductionInstancesCount=1,AssetReference=AG-008704,ExpiryDate=26_June_2021_[v2]_MTYyNDY2MjAwMDAwMA==ef3978ee7b737efd48c697339589c921',
  DOCUMENTATION_CENTER: 'https://support.ruckuswireless.com/documents/3506',
  AUTO_UPDATE_TABLE_INTERVALS: '30000',
  AUTO_UPDATE_DASHBOARD_INTERVALS: '300000',
  AUTO_UPDATE_ALARMS_TABLE_INTERVALS: '300000',
  AUTO_UPDATE_EVENTS_TABLE_INTERVALS: '300000',
  CHATBOT_JS_URL: 'https://storage.googleapis.com/tdi-static/chat/tdi-uat-latest.min.js',
  SPLITIO_FF_KEY: 's56i5harnvpksqb6a5kom1phqncj9d6ujf92'
}

describe('Firewall Component', () => {

  let params: { tenantId: string }

  it('should render <Firewall/> component correctly', async () => {
    render(
      <Provider>
        <Firewall modalState={true} setIsModalOpen={() => {}}/>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText(('https://ruckus.cloud'))).toBeInTheDocument()
    expect(await screen.findByText(('device.ruckus.cloud'))).toBeInTheDocument()
    const cancelBtn = await screen.findByRole('button',{ name: 'Close' })
    await userEvent.click(cancelBtn)
  })

})


describe('HelpPage Component', () => {

  it('should render <HelpPage/> component correctly', async () => {
    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          't/*/dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html',
          't/*/administration/accountSettings': 'GUID-95DB93A0-D295-4D31-8F53-47659D019295.html',
          't/*/venues': 'GUID-800174C7-D49A-4C02-BCEB-CE0D9581BABA.html'
        }))
      ),
      rest.get(getDocsURL()+':docID', (_, res, ctx) =>
        res(ctx.text('<p class=shortdesc>Dashboard test</p>'))
      ))

    render(<HelpPage modalState={true} setIsModalOpen={() => {}}/>, {
      wrapper: Provider,
      route: {
        path: '/t/a5804cffcefd408c8d36aca5bd112838/dashboard',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText(('Dashboard test'))).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button',{ name: 'Close' }))
  })

  it('Render <HelpPage/> component failing case', async () => {
    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          empty: ''
        }))
      ),
      rest.get('/emptyURL', (_, res, ctx) =>
        res(ctx.text('<p class=>Dashboard test</p>'))
      ))

    render(<HelpPage modalState={true} setIsModalOpen={() => {}}/>, {
      wrapper: Provider,
      route: {
        path: '/dashboard',
        wrapRoutes: false
      }
    })
    await new Promise((r)=>{setTimeout(r, 300)})
    expect(await screen.findByText(('The content is not available.'))).toBeInTheDocument()
  })

  it('Render <HelpPage/> component retrieve mapping file failing case', async () => {

    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(
          // Send a valid HTTP status code
          ctx.status(404),
          // And a response body, if necessary
          ctx.json({
            errorMessage: 'File not found'
          })
        )
      ),
      rest.get('/emptyURL', (_, res, ctx) =>
        res(ctx.text('<p class=>Dashboard test</p>'))
      ))

    render(
      <Provider>
        <HelpPage modalState={true} setIsModalOpen={() => {}}/>
      </Provider>, {
        route: {
          path: '/dashboard',
          wrapRoutes: false
        }
      })
    await new Promise((r)=>{setTimeout(r, 300)})
    expect(await screen.findByText(('The content is not available.'))).toBeInTheDocument()
  })

  it('Render <HelpPage/> component retrieve HTML file failing case', async () => {

    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          '/t/*/dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html',
          '/t/*/administration/accountSettings': 'GUID-95DB93A0-D295-4D31-8F53-47659D019295.html',
          '/t/*/venues': 'GUID-800174C7-D49A-4C02-BCEB-CE0D9581BABA.html'
        }))
      ),
      rest.get(getDocsURL()+':docID', (_, res, ctx) =>
        res(
          // Send a valid HTTP status code
          ctx.status(404),
          // And a response body, if necessary
          ctx.json({
            errorMessage: 'File not found'
          })
        )
      ))

    render(
      <Provider>
        <HelpPage modalState={true} setIsModalOpen={() => {}}/>
      </Provider>, {
        route: {
          path: '/t/a5804cffcefd408c8d36aca5bd112838/dashboard',
          wrapRoutes: false
        }
      })
    await new Promise((r)=>{setTimeout(r, 300)})
    expect(await screen.findByText(('The content is not available.'))).toBeInTheDocument()
  })
})


const originalEnv = process.env
describe('HelpPage Component URLs', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development'
    }
  })
  afterEach(() => {
    process.env = originalEnv
  })
  it('<HelpPage/> component retrieve URL correctly', async () => {
    const mappingURL = getMappingURL()
    expect(mappingURL).not.toBeNull()
    const docURL = getDocsURL()
    expect(docURL).not.toBeNull()
  })

})


describe('HelpPage menus Button', () => {
  const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }
  it('should invoke menus link correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          '/t/*/dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html',
          '/t/*/administration/accountSettings': 'GUID-95DB93A0-D295-4D31-8F53-47659D019295.html',
          '/t/*/venues': 'GUID-800174C7-D49A-4C02-BCEB-CE0D9581BABA.html'
        }))
      ),
      rest.get(getDocsURL()+':docID', (_, res, ctx) =>
        res(
          // Send a valid HTTP status code
          ctx.status(404),
          // And a response body, if necessary
          ctx.json({
            errorMessage: 'File not found'
          })
        )
      ),
      rest.get(CommonUrlsInfo.getGlobalValues.url,
        (req, res, ctx) => res(ctx.json(GLOBAL_VALUES))
      ))
    const mockOpenFn = jest.fn()
    window.open = mockOpenFn
    render(<Provider>
      <HelpButton/>
    </Provider>, { route: { params } })
    const helpBtn = screen.getByRole('button')
    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Documentation Center' }))

    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'My Open Cases' }))

    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Privacy' }))

    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Supported Device Models' }))

    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Firewall ACL Inputs' }))

    expect(mockOpenFn).toBeCalledTimes(4)
  })

})



describe('HelpPage menus Button should be disabled', () => {
  const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }
  it('HelpPage menus Button should be disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          '/t/*/dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html'
        }))
      ),
      rest.get(getDocsURL()+':docID', (_, res, ctx) =>
        res(
          // Send a valid HTTP status code
          ctx.status(404),
          // And a response body, if necessary
          ctx.json({
            errorMessage: 'File not found'
          })
        )
      ),
      rest.get(CommonUrlsInfo.getGlobalValues.url,
        (req, res, ctx) => res(ctx.json(GLOBAL_VALUES))
      ))
    render(<Provider>
      <HelpButton/>
    </Provider>, { route: { params } })
    const helpBtn = screen.getByRole('button')
    expect(helpBtn).toBeDisabled()
  })

})
