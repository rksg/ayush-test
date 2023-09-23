import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { serviceApi }                     from '@acx-ui/rc/services'
import { CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'
import { UserUrlsInfo }                   from '@acx-ui/user'

import PortalForm from './PortalForm'

export const successResponse = { requestId: 'request-id' }

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('PortalForm', () => {
  beforeEach(() => {
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(PortalUrlsInfo.getPortal.url,
        (_, res, ctx) => {
          return res(ctx.json({ content: {} }))
        }),
      rest.post(
        PortalUrlsInfo.savePortal.url.replace('?quickAck=true', ''),
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.post(CommonUrlsInfo.getUploadURL.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: '/api/test', fileId: 'test' }))
        }),
      rest.put('/api/test',
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.get(PortalUrlsInfo.getPortalProfileList.url
        .replace('?pageSize=:pageSize&page=:page&sort=:sort', ''),
      (_, res, ctx) => {
        return res(ctx.json({ content: [{ id: 'test', serviceName: 'test' }],
          paging: { page: 1, pageSize: 10, totalCount: 1 } }))
      })
    )
  })
  it('should create Portal with file successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })
    //step 1 setting form
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    const file = new File(['logo ruckus'],
      'https://storage.cloud.google.com/ruckus-web-1/acx-ui-static-resources/logo-ruckus.png',
      { type: 'image/png' })
    await userEvent.click(await screen.findByTitle('background setting'))

    await userEvent.upload(await screen.findByLabelText('Select image'),file)
    await userEvent.click(await screen.findByText('Select image'))

    await userEvent.click(await screen.findByText('Add'))
    expect(await screen.findByText('English')).toBeVisible()
  })
  it('should create Portal successfully', async () => {

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')

    await userEvent.click(await screen.findByText('Add'))
  })
})
