import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  VlanPoolUrls,
  WifiUrlsInfo } from '@acx-ui/rc/utils'
import { VLANPoolPolicyType }         from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'

import VLANPoolForm from './VLANPoolForm'


const successResponse = { requestId: 'request-id' }
const vlanData:VLANPoolPolicyType={
  id: 'policy-id',
  name: 'test1',
  vlanMembers: '2,3'
}
const vlanList=[{
  id: '1',
  name: 'test1',
  vlanMembers: '2,3'
},{
  id: 'policy-id',
  name: 'test2',
  vlanMembers: '2,3'
}]

describe('VLANPoolForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
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
      rest.get(CommonUrlsInfo.getVlanPoolList.url, (_, res, ctx) =>
        res(ctx.json(vlanList))
      ),
      rest.get(
        WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => {return res(ctx.json(vlanList))}
      )
    )
  })

  it('should create VLAN pool successfully', async () => {
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

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = {
      networkId: 'UNKNOWN-NETWORK-ID',
      tenantId: 'tenant-id',
      type: 'wifi',
      policyId: 'policy-id'
    }
    render(<Provider><VLANPoolForm edit={false}/></Provider>, {
      route: { params }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('Policies & Profiles')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'VLAN Pools'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      networkId: 'UNKNOWN-NETWORK-ID',
      tenantId: 'tenant-id',
      type: 'wifi',
      policyId: 'policy-id'
    }
    render(<Provider><VLANPoolForm edit={false}/></Provider>, {
      route: { params }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'VLAN Pools'
    })).toBeVisible()
  })

  it.skip('should edit vlan successfully', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
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
        WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => {return res(ctx.json(vlanList))}
      )
    )

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
      policyId: 'policy-id' }

    render(<Provider><VLANPoolForm edit={true}/></Provider>, {
      route: { params }
    })

    await userEvent.type(screen.getByLabelText('Policy Name'),'test2')
    // FIXME: Do not use "setTimeout".
    // await new Promise((r)=>{setTimeout(r, 500)})
    // await userEvent.type(await screen.findByLabelText('Policy Name'),
    //   'test100')
    await userEvent.type(await screen.findByLabelText('VLANs'),
      '6')
    // FIXME: Do not use "setTimeout".
    // await userEvent.click(await screen.findByText('Finish'))
    await new Promise((r)=>{setTimeout(r, 500)})
  })


  it.skip('should cancel vlan Form successfully', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
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
        WifiUrlsInfo.getVlanPools.url,
        (_, res, ctx) => {return res(ctx.json(vlanList))}
      )
    )
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
      policyId: 'policy-id' }

    render(<Provider><VLANPoolForm edit={true}/></Provider>, {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Cancel'))
  })
})
