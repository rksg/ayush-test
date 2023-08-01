
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AaaUrls, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockAAAPolicyResponse } from '../__tests__/fixtures'
import NetworkFormContext        from '../NetworkFormContext'

import AAAInstance from '.'

describe('AAA Instance Page', () => {
  beforeEach(async () => {
    const mockPolicyResponse = { id: '2', name: 'test2' }
    mockServer.use(
      rest.get(
        AaaUrls.getAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyResponse))
      ),
      rest.post(CommonUrlsInfo.validateRadius.url, (_, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => res(ctx.json({
          requestId: 'request-id', ...mockPolicyResponse
        }))
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => res(ctx.json({
          requestId: 'request-id', ...mockPolicyResponse
        }))
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
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', policyId: 'test-id' }
    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} } }
    }}><Form><AAAInstance serverLabel='' type='authRadius'/>
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params }
    })
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
    // FIXME: Do not use setTimeout here
    // await new Promise((r)=>{setTimeout(r, 500)})
    // await changeAAA()
  })
})
// async function changeAAA (){
//   await userEvent.click((await screen.findAllByRole('combobox'))[0])
//   await userEvent.click((await screen.findAllByTitle('test1'))[0])
// }
