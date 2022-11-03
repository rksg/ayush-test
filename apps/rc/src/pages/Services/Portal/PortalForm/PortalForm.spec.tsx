import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, PortalUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'


import PortalForm from './PortalForm'


export const networkResponse = {
  fields: [
    'name',
    'id',
    'captiveType',
    'venues',
    'activated',
    'nwSubType'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: '!!!New_Evolink!!!',
      id: 'efef32751d854e2ea2bfce4b367c330c',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      venues: {
        count: 2,
        names: [
          'Sindhuja-Venue',
          'Govind'
        ]
      }
    },
    {
      name: '!!!SANWPA2!!!',
      id: '1d88235da9504a98847fb5ed2b971052',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'Sandeep-R550'
        ]
      }
    }
  ]
}

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
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
        res(ctx.json(networkResponse))
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi' }

    const { asFragment } = render(<Provider><PortalForm /></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    //step 1 setting form
    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }),'create Portal test')
    await userEvent.click(screen.getByText('Reset'))
    await userEvent.click(screen.getByText('Next'))

    //scope
    await screen.findByRole('heading', { level: 3, name: 'Networks' })
    await userEvent.click(screen.getByText('Next'))

    //summary
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))


  })
})
