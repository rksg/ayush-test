import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, VlanPoolUrls } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'


import VLANPoolForm from './VLANPoolForm'


const successResponse = { requestId: 'request-id' }
const vlanData={
  id: 'policy-id',
  policyName: 'test1',
  vlans: '2,3'
}
const vlanList=[{
  id: '1',
  policyName: 'test1',
  vlans: '2,3'
},{
  id: 'policy-id',
  policyName: 'test2',
  vlans: '2,3'
}]

describe('VLANPoolForm', () => {
  it('should create VLAN pool successfully', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.post(
        VlanPoolUrls.addVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        VlanPoolUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => {return res(ctx.json(vlanList))}
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
      policyId: 'policy-id' }

    render(<Provider><VLANPoolForm edit={false}/></Provider>, {
      route: { params }
    })

    //step 1 setting form
    await userEvent.type(await screen.findByLabelText('Policy Name'),
      'test1')
    await userEvent.type(await screen.findByLabelText('Policy Name'),
      'aatest1')
    await userEvent.type(await screen.findByLabelText('VLANs'),
      '5')
    await userEvent.click(await screen.findByText('Finish'))
  })
  it('should edit vlan successfully', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(vlanData))}
      ),
      rest.post(
        VlanPoolUrls.addVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        VlanPoolUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => {return res(ctx.json(vlanList))}
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
      policyId: 'policy-id' }

    render(<Provider><VLANPoolForm edit={true}/></Provider>, {
      route: { params }
    })

    await userEvent.type(await screen.findByLabelText('Policy Name'),
      'test2')
    await userEvent.type(await screen.findByLabelText('Policy Name'),
      'test100')
    await userEvent.type(await screen.findByLabelText('VLANs'),
      '6-9')
    await userEvent.click(await screen.findByText('Finish'))
  })
})
