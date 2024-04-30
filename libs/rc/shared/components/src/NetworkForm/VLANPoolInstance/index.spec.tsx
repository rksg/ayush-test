import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { VlanPoolUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import NetworkFormContext from '../NetworkFormContext'

import VLANPoolInstance from '.'

describe('VLAN Pool Instance Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVlanPools.url,
        (req, res, ctx) => res(ctx.json([{ id: '1', name: 'test1' }]))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicy.url,
        (_, res, ctx) => {return res(
          ctx.json({ requestId: 'request-id', id: '2', name: 'test2' }))}
      ),
      rest.put(
        VlanPoolUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {return res(
          ctx.json({ requestId: 'request-id', id: '2', name: 'test2' }))}
      ),
      rest.post(
        VlanPoolUrls.addVLANPoolPolicy.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'request-id', id: '2', name: 'test2' }))
      )
    )
  })

  it('should render instance page', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', policyId: 'test-id' }
    render(<Provider><NetworkFormContext.Provider value={{
      editMode: false, cloneMode: false, data: { guestPortal:
        { enableSmsLogin: true, socialIdentities: {} } }
    }}><Form><VLANPoolInstance />
      </Form></NetworkFormContext.Provider></Provider>,
    {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Add Pool'))
    await userEvent.click((await screen.findAllByText('Cancel'))[0])
    await userEvent.click(await screen.findByText('Add Pool'))
    await userEvent.type(await screen.findByRole(
      'textbox', { name: 'Policy Name' }),'create test')
    await userEvent.type(await screen.findByRole('textbox', { name: 'VLANs' }),
      '8')
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test1'))[0])
  })
})
