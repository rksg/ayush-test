import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, AaaUrls, AAAPurposeEnum }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import AAAForm from './AAAForm'


const successResponse = { requestId: 'request-id' }
const aaaData={
  profileName: 'test',
  tacacsServer: {
    purpose: AAAPurposeEnum.ACCOUNTING,
    serverAddress: '1.1.1.1',
    sharedSecret: '2222222222',
    tacacsPort: 888
  },
  tags: ['xxdd']
}
const aaaList=[{
  id: '1',
  name: 'test1'
},{
  id: 'policy-id',
  name: 'test2'
}]

describe('AAAForm', () => {
  it('should create AAA successfully', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(
        AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => {return res(ctx.json(aaaList))}
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
      policyId: 'policy-id' }

    const { asFragment } = render(<Provider><AAAForm edit={false}/></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()

    //step 1 setting form
    await userEvent.type(await screen.findByLabelText('Profile Name'),
      'test1')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Server Address' }),
      '8.8.8.8')
    await userEvent.type(await screen.findByLabelText('Shared Secret'),
      'test1234')
    await userEvent.click(await screen.findByRole('radio', { name: /TACACS/ }))
    await userEvent.type(await screen.findByLabelText('Profile Name'),
      'create AAA test')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Server Address' }),
      '8.8.8.9')
    await userEvent.type(await screen.findByLabelText('Shared Secret'),
      'test12345')
    await userEvent.click(await screen.findByText('Finish'))
  })
  it('should edit AAA successfully', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(aaaData))}
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(
        AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => {return res(ctx.json(aaaList))}
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
      policyId: 'policy-id' }

    const { asFragment } = render(<Provider><AAAForm edit={true}/></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()
    await userEvent.type(await screen.findByLabelText('Profile Name'),
      'test1')
    await userEvent.type(await screen.findByLabelText('Shared Secret'),
      'test12345')
    await userEvent.click(await screen.findByRole('radio', { name: /RADIUS/ }))
    await userEvent.type(await screen.findByLabelText('Profile Name'),
      'edit AAA test')
    await userEvent.type(await screen.findByRole('textbox', { name: 'Server Address' }),
      '8.8.8.8')
    await userEvent.type(await screen.findByLabelText('Shared Secret'),
      'test1234')

    await userEvent.click(await screen.findByText('Finish'))
  })
})
