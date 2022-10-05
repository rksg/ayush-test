import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import {
  cloudpathResponse,
  networkDeepResponse,
  venueListResponse
} from '../__tests__/fixtures'

import { DpskSettingsForm } from './DpskSettingsForm'

describe('DpskSettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse)))
    )
  })

  it('should render DPSK form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider><Form><DpskSettingsForm /></Form></Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render Cloudpath Server form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(<Provider><Form><DpskSettingsForm /></Form></Provider>, {
      route: { params }
    })

    await userEvent.click(screen.getByText('Use Cloudpath Server'))
    expect(screen.getByText('Add Server')).toBeVisible()
  })
})
