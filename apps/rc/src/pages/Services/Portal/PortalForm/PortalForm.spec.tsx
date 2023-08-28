import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'
import { UserUrlsInfo }                   from '@acx-ui/user'


import PortalForm from './PortalForm'


export const successResponse = { requestId: 'request-id' }


describe('PortalForm', () => {
  it('should create Portal with file successfully', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
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
      rest.get(PortalUrlsInfo.getPortalProfileList.url
        .replace('?pageSize=:pageSize&page=:page&sort=:sort', ''),
      (_, res, ctx) => {
        return res(ctx.json({ content: [{ id: 'test', serviceName: 'test' }],
          paging: { page: 1, pageSize: 10, totalCount: 1 } }))
      })
    )

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
    await new Promise((r)=>{setTimeout(r, 300)})
    await userEvent.click(await screen.findByText('Add'))
    expect(await screen.findByText('English')).toBeVisible()

  })
  it('should create Portal successfully', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        PortalUrlsInfo.savePortal.url.replace('?quickAck=true', ''),
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ signedUrl: 'test', fileId: 'test' }))
        }),
      rest.get(PortalUrlsInfo.getPortalProfileList.url
        .replace('?pageSize=:pageSize&page=:page&sort=:sort', ''),
      (_, res, ctx) => {
        return res(ctx.json({ }))
      })
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    //step 1 setting form
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Add'))
    await new Promise((r)=>{setTimeout(r, 300)})
  })

  it('should render breadcrumb correctly', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
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
      rest.get(PortalUrlsInfo.getPortalProfileList.url
        .replace('?pageSize=:pageSize&page=:page&sort=:sort', ''),
      (_, res, ctx) => {
        return res(ctx.json({ content: [{ id: 'test', serviceName: 'test' }],
          paging: { page: 1, pageSize: 10, totalCount: 1 } }))
      })
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }
    render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Guest Portal'
    })).toBeVisible()
  })
})
