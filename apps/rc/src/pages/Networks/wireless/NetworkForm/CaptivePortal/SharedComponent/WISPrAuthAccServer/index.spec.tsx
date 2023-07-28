import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'


import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { CommonUrlsInfo,  AaaUrls }   from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import NetworkFormContext from '../../../NetworkFormContext'

import { statesCollection, WISPrAuthAccContext } from './WISPrAuthAccServerReducer'

import { WISPrAuthAccServer } from '.'

describe('WISPRAuthACCServer Unit tests', () => {
  beforeEach(async () => {
    const mockPolicyResponse = { id: '2', name: 'test2' }
    mockServer.use(
      rest.get(
        AaaUrls.getAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json([{
          id: '1',
          name: 'test1',
          type: 'AUTHENTICATION',
          primary: {
            ip: '1.1.1.2',
            port: 1812,
            sharedSecret: '111211121112'
          }
        }]))
      ),
      rest.post(CommonUrlsInfo.validateRadius.url, (_, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id', ...mockPolicyResponse }))
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id', ...mockPolicyResponse }))
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (req, res, ctx) => res(ctx.json({
          requestId: 'request-id',
          response: mockPolicyResponse
        }))
      )
    )
  })
  it('should render instance page', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', policyId: 'test-id' }
    render(WISPRAuthACCServerNormalTestCase(),{ route: { params } })
    await userEvent.click(await screen.findByText('Add Server'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Server'))
    await userEvent.click(await screen.findByText('Add Secondary Server'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Profile Name' }),'create test')
    await userEvent.type((await screen.findAllByRole('textbox', { name: 'IP Address' }))[0],
      '8.8.8.8')
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[0],
      'test1234')
    await userEvent.type((await screen.findAllByRole('textbox', { name: 'IP Address' }))[1],
      '8.8.8.7')
    await userEvent.type((await screen.findAllByLabelText('Shared Secret'))[1],
      'test1234')
    await userEvent.click(await screen.findByText('Add'))
    await new Promise((r)=>{setTimeout(r, 500)})
    await changeAAA()
  })
})
async function changeAAA (){
  await userEvent.click((await screen.findAllByRole('combobox'))[0])
  await userEvent.click((await screen.findAllByTitle('test1'))[0])
}

function WISPRAuthACCServerNormalTestCase () {
  const data = {
    guestPortal: {
      enableSmsLogin: true,
      socialIdentities: {}
    }
  }
  return (
    <Provider>
      <NetworkFormContext.Provider value={{
        editMode: false, cloneMode: false, data: data
      }}>
        <Form>
          <WISPrAuthAccContext.Provider
            value={{ state: statesCollection.useBypassCNAAndAuth, dispatch: ()=>{} }}>
            <WISPrAuthAccServer
              onClickAllAccept={()=>{}}
              onClickAuth={()=>{}}
            />
          </WISPrAuthAccContext.Provider>
        </Form>
      </NetworkFormContext.Provider>
    </Provider>
  )
}
