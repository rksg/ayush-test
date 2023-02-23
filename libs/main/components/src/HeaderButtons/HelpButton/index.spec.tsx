import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import Firewall                                from './Firewall'
import HelpPage, { getMappingURL, getDocsURL } from './HelpPage'

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
        res(ctx.text('<p class="shortdesc">Dashboard test</p>'))
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
        res(ctx.text('<p class="">Dashboard test</p>'))
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
        res(ctx.text('<p class="">Dashboard test</p>'))
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
