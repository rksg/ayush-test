import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { AaaUrls }                               from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'
import { UserUrlsInfo }                          from '@acx-ui/user'

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
const aaaList=[{
  id: '1',
  name: 'test1'
},{
  id: 'policy-id',
  name: 'test2'
}]
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
    await userEvent.type((await screen.findAllByLabelText('IP Address'))[0],
      '2.3.3.4')
    fireEvent.change((await screen.findAllByLabelText('IP Address'))[0],
      { target: { value: '2.3.3.4' } })
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
      'test1234')
    await userEvent.click(await screen.findByRole('radio', { name: /Authentication/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Accounting/ }))
    const inputProfile = await screen.findByLabelText(/Profile Name/)
    fireEvent.change(inputProfile, { target: { value: 'test1' } })
    fireEvent.blur(inputProfile)
    fireEvent.change(inputProfile, { target: { value: 'create aaa test' } })
    await userEvent.type((await screen.findAllByLabelText('IP Address'))[1],
      '2.3.3.4')
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[1],
      'test1234')
    await userEvent.click(await screen.findByText('Finish'))
  })
  it('should edit AAA successfully', async () => {
    await editAAA()
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
  const port2 = (await screen.findAllByRole('spinbutton', { name: 'Authentication Port' }))[1]
  fireEvent.change((await screen.findAllByLabelText('IP Address'))[1],
    { target: { value: '2.3.3.4' } })
  await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[1],
    'test1234')
  await fillInProfileName('test1')
  await userEvent.click(await screen.findByText('Finish'))
  await userEvent.type(port2, '1812')
  await fillInProfileName('test2 update')
  await userEvent.click(await screen.findByText('Finish'))
  await new Promise((r)=>{setTimeout(r, 300)})
}
async function fillInProfileName (name: string) {
  const insertInput = await screen.findByLabelText(/Profile Name/)
  fireEvent.change(insertInput, { target: { value: name } })
  fireEvent.blur(insertInput)
}
