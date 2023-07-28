import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AaaUrls }                                       from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                  from '@acx-ui/user'

import AAAForm from './AAAForm'

const aaaData={
  id: 'policy-id',
  name: 'test2',
  type: 'AUTHENTICATION',
  primary: {
    ip: '2.3.3.4',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.3.3.4',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  tags: ['xxdd']
}
const successResponse = { requestId: 'request-id', id: '2', name: 'test2' }
const aaaList=[
  {
    name: 'test1',
    type: 'AUTHENTICATION',
    primary: {
      ip: '1.1.1.2',
      port: 1812,
      sharedSecret: '111211121112'
    },
    id: '1'
  },
  {
    name: 'policy-id',
    type: 'AUTHENTICATION',
    primary: {
      ip: '2.3.3.4',
      port: 101,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.3.3.4',
      port: 101,
      sharedSecret: 'xxxxxxxx'
    },
    id: '2'
  },
  {
    name: 'aaa2',
    type: 'AUTHENTICATION',
    primary: {
      ip: '1.1.1.1',
      port: 1812,
      sharedSecret: '11111111'
    },
    id: '9f1ce5aecc834f0f95d3df1e97f85f19'
  },
  {
    name: 'aaa-temp',
    type: 'AUTHENTICATION',
    primary: {
      ip: '2.2.2.2',
      port: 1812,
      sharedSecret: 'asdfasdf'
    },
    id: '3e9e139d6ef3459c95ab547acb1672b5'
  },
  {
    name: 'aaa-temp1',
    type: 'AUTHENTICATION',
    primary: {
      ip: '1.1.1.19',
      port: 1805,
      sharedSecret: '34tgweg453g45g34g'
    },
    id: '343ddabf261546258bc46c049e0641e5'
  }
]
const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
  policyId: 'policy-id' }
describe('AAAForm', () => {

  beforeEach(()=>{
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
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
  })
  it('should create AAA successfully', async () => {
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })

    //step 1 setting form
    await userEvent.click(await screen.findByText('Add Secondary Server'))
    await userEvent.type((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[0],
    '2.3.3.4')
    fireEvent.change((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[0],
    { target: { value: '2.3.3.4' } })
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
      'test1234')
    await userEvent.click(await screen.findByRole('radio', { name: /Authentication/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Accounting/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Authentication/ }))
    const inputProfile = await screen.findByLabelText(/Profile Name/)
    fireEvent.change(inputProfile, { target: { value: 'test1' } })
    fireEvent.blur(inputProfile)
    fireEvent.change(inputProfile, { target: { value: 'create aaa test' } })
    await userEvent.type((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[1],
    '2.3.3.4')
    await userEvent.type((await screen.findAllByRole('textbox', {
      name: /ip address/i
    }))[1],
    'test1234')
    await screen.findByText('Finish')
    // FIXME:
    // await userEvent.click(await screen.findByText('Finish'))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><AAAForm edit={false} networkView={false}/></Provider>, {
      route: { params }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'RADIUS Server'
    })).toBeVisible()
  })

  it.skip('should edit AAA successfully', async () => {
    await editAAA()
  })

  it('should validate the length of the Shared Secret', async () => {
    render(<Provider><AAAForm edit={false} networkView={false}/></Provider>, {
      route: { params }
    })

    // eslint-disable-next-line max-len
    const longSecret = '@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5AgQ@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5AgQ@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5AgQ@M(N@53YXnBmX$QKc@Lw**VxDgJ2DmA*zN^j(!$87VanGT@qVG&E^5haIENE5Ag1'
    const primarySecret = await screen.findByLabelText('Shared Secret')

    await userEvent.type(primarySecret, longSecret)
    const primaryAlert = await screen.findByRole('alert')
    expect(primaryAlert).toHaveTextContent('255 characters')

    await userEvent.click(await screen.findByRole('button', { name: /Add Secondary Server/ }))
    const secondaryFieldset = await screen.findByRole('group', { name: /Secondary Server/ })
    const secondarySecret = await within(secondaryFieldset).findByLabelText('Shared Secret')
    await userEvent.type(secondarySecret, longSecret)
    const secondaryAlert = await within(secondaryFieldset).findByRole('alert')
    expect(secondaryAlert).toHaveTextContent('255 characters')
  })
})

async function editAAA (){
  render(<Provider><AAAForm edit={true} networkView={false}/></Provider>, {
    route: { params }
  })
  fireEvent.change((await screen.findAllByLabelText('IP Address'))[0],
    { target: { value: '2.3.3.4' } })
  await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
    'test1234')
  const port2 = (await screen.findAllByRole('spinbutton', { name: 'Port' }))[1]
  fireEvent.change((await screen.findAllByLabelText('IP Address'))[1],
    { target: { value: '2.3.3.4' } })
  await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[1],
    'test1234')
  await fillInProfileName('test1')
  await userEvent.click(await screen.findByText('Finish'))
  await userEvent.type(port2, '1812')
  await fillInProfileName('test2 update')
  // FIXME: Do not use "setTimeout"
  // await userEvent.click(await screen.findByText('Finish'))
  // await new Promise((r)=>{setTimeout(r, 300)})
}
async function fillInProfileName (name: string) {
  const insertInput = await screen.findByLabelText(/Profile Name/)
  fireEvent.change(insertInput, { target: { value: name } })
  fireEvent.blur(insertInput)
}
