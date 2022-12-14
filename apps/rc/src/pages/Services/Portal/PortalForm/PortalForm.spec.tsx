import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'


import PortalForm from './PortalForm'


export const successResponse = { requestId: 'request-id' }


describe('PortalForm', () => {
  it('should create Portal successfully', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        PortalUrlsInfo.savePortal.url.replace('?quickAck=true', ''),
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    const { asFragment } = render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    //step 1 setting form
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(await screen.findByText('Reset'))
    await userEvent.click(await screen.findByText('Finish'))
    expect(await screen.findByText('English')).toBeVisible()

  })
})
