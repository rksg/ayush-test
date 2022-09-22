import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within } from '@acx-ui/test-utils'

import { policyListResponse } from '../__tests__/fixtures'

import { AccessControlForm } from './AccessControlForm'

describe('AccessControlForm', () => {

  beforeEach(() => {

    const devicePolicyResponse = [{
      data: [{
        id: 'e3ea3749907f4feb95e9b46fe69aae0b',
        name: 'p1',
        rulesCount: 1,
        networksCount: 0
      }],
      fields: [
        'name',
        'id'],
      totalCount: 1,
      totalPages: 1,
      page: 1
    }]

    mockServer.use(
      rest.post(CommonUrlsInfo.getDevicePolicyList.url,
        (req, res, ctx) => res(ctx.json(devicePolicyResponse))),
      rest.post(CommonUrlsInfo.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.post(CommonUrlsInfo.getApplicationPolicyList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getWifiCallingProfileList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getVlanPoolList.url,
        (_, res, ctx) => res(ctx.json(policyListResponse))),
      rest.get(CommonUrlsInfo.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([])))
    )
  })

  it('should render Access Control form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })


  it('after click client rate limit', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    const view = screen.getByText(/client rate limit/i)
    await userEvent.click(await within(view).findByRole('switch'))
    expect(screen.getByText(/upload limit/i)).toBeVisible()
    expect(screen.getByText(/download limit/i)).toBeVisible()

    const uploadLimitCheckbox = screen.getByTestId('enableUploadLimit')
    await userEvent.click(uploadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(uploadLimitCheckbox)

    const downloadLimitCheckbox = screen.getByTestId('enableDownloadLimit')
    await userEvent.click(downloadLimitCheckbox)
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(downloadLimitCheckbox)

  })

  it('after click select seperate profiles', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    const selectBtn = screen.getByText(/select access control profile/i)
    fireEvent.click(selectBtn)

    expect(screen.getByText(/select separate profiles/i)).toBeVisible()
    expect(within(screen.getByText(/device & os/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/layer 2/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/layer 3/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/applications/i)).getByText(/--/)).toBeVisible()
    expect(within(screen.getByText(/client rate limit/i)).getByText(/--/)).toBeVisible()
  })
})
