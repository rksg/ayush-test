import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  VlanPoolUrls,
  WifiUrlsInfo,
  PoliciesConfigTemplateUrlsInfo,
  ConfigTemplateContext,
  VlanPoolRbacUrls
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'
import { UserUrlsInfo }                        from '@acx-ui/user'

import { vlanData, vlanList, vlanRbacList, vlanTemplateList } from './__tests__/fixtures'
import { VLANPoolForm }                                       from './VLANPoolForm'


const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('VLANPoolForm', () => {
  const successResponse = { requestId: 'request-id' }
  const params = {
    networkId: 'UNKNOWN-NETWORK-ID',
    tenantId: 'tenant-id',
    type: 'wifi',
    policyId: 'policy-id'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json(vlanList))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicy.url,
        (_, res, ctx) => res(ctx.json(vlanData))
      ),
      rest.post(
        PoliciesConfigTemplateUrlsInfo.getEnhancedVlanPools.url,
        (_, res, ctx) => res(ctx.json(vlanTemplateList))
      )
    )
  })

  it('should create VLAN pool successfully', async () => {
    const addVlanPool = jest.fn()
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        VlanPoolUrls.addVLANPoolPolicy.url,
        (_, res, ctx) => {
          addVlanPool()
          return res(ctx.json(successResponse))
        }
      ),
      rest.put(
        VlanPoolUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      )
    )

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
    await userEvent.click(await screen.findByText('Add'))

    expect(addVlanPool).toBeCalledTimes(1)
  })

  it('should render breadcrumb correctly', async () => {
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
    const editVlanPool = jest.fn()
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        VlanPoolUrls.addVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        VlanPoolUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {
          editVlanPool()
          return res(ctx.json(successResponse))
        }
      )
    )

    render(<Provider><VLANPoolForm edit={true}/></Provider>, {
      route: { params }
    })

    await userEvent.type(screen.getByLabelText('Policy Name'),'test2')

    await userEvent.type(await screen.findByLabelText('VLANs'), '6')
    await userEvent.click(await screen.findByText('Finish'))

    await waitFor(async () => expect(editVlanPool).toBeCalledTimes(1))
  })


  it('should cancel vlan Form successfully', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        VlanPoolUrls.addVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        VlanPoolUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      )
    )

    render(<Provider><VLANPoolForm edit={true}/></Provider>, {
      route: { params }
    })
    await userEvent.click(await screen.findByText('Cancel'))

    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '', pathname: '/tenant-id/t/policies/vlanPool/list', search: '' }, { replace: true }
    )
  })

  it('should create VLAN Pool template successfully', async () => {
    const addTemplateFn = jest.fn()

    mockServer.use(
      rest.post(
        PoliciesConfigTemplateUrlsInfo.addVlanPoolPolicy.url,
        (_, res, ctx) => {
          addTemplateFn()
          return res(ctx.json(successResponse))
        }
      )
    )

    render(<ConfigTemplateContext.Provider value={{ isTemplate: true }}>
      <Provider>
        <VLANPoolForm edit={false}/>
      </Provider>
    </ConfigTemplateContext.Provider>, { route: { params } })

    await userEvent.type(await screen.findByLabelText('Policy Name'), 'My VLAN pool template')
    await userEvent.type(await screen.findByLabelText('Description'), 'Some description')
    await userEvent.type(await screen.findByLabelText('VLANs'), '1288,1299')
    await userEvent.click(await screen.findByText('Add'))

    await waitFor(() => expect(addTemplateFn).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
  })

  it('should create VLAN pool with rbac api successfully', async () => {
    const addVlanPool = jest.fn()
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(
        VlanPoolRbacUrls.addVLANPoolPolicy.url,
        (_, res, ctx) => {
          addVlanPool()
          return res(ctx.json(successResponse))
        }
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => res(ctx.json(vlanRbacList))
      )
    )
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
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
    await userEvent.click(await screen.findByText('Add'))

    expect(addVlanPool).toBeCalledTimes(1)
  })

  it.skip('should edit vlan pool with rbac api successfully', async () => {
    const editVlanPool = jest.fn()
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.get(
        VlanPoolRbacUrls.getVLANPoolPolicy.url,
        (_, res, ctx) => res(ctx.json(vlanData))
      ),
      rest.put(
        VlanPoolRbacUrls.updateVLANPoolPolicy.url,
        (_, res, ctx) => {
          editVlanPool()
          return res(ctx.json(successResponse))
        }
      ),
      rest.post(
        VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => res(ctx.json(vlanRbacList))
      )
    )
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    render(<Provider><VLANPoolForm edit={true}/></Provider>, {
      route: { params }
    })

    await userEvent.type(screen.getByLabelText('Policy Name'),'test2')

    await userEvent.type(await screen.findByLabelText('VLANs'), '6')
    await userEvent.click(await screen.findByText('Finish'))

    await waitFor(async () => expect(editVlanPool).toBeCalledTimes(1))
  })
})
