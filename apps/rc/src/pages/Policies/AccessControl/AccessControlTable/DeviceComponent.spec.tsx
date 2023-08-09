import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  AccessControlUrls, CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen, waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  deviceDetailResponse,
  devicePolicyListResponse,
  enhancedDevicePolicyListResponse, networkListResponse
} from '../__tests__/fixtures'

import DevicePolicyComponent from './DevicePolicyComponent'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('AccessControlTable - Device', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(
          ctx.json(networkListResponse)
        )
      ), rest.get(
        AccessControlUrls.getDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(deviceDetailResponse)
        )
      )
    )
  })

  it('should render DeviceComponent in AccessControlTable', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyListResponse)
      )
    ))

    render(
      <Provider>
        <DevicePolicyComponent />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedDevicePolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Edit'))
    await screen.findByText('Device & OS Access Settings')
    await screen.findByRole('button', {
      name: 'Cancel'
    })
  })

  it('should delete selected row from DeviceComponent in AccessControlTable', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyListResponse)
      )
    ), rest.delete(
      AccessControlUrls.delDevicePolicies.url,
      (_, res, ctx) => res(
        ctx.json({ requestId: 'requestId1' })
      )
    ))

    render(
      <Provider>
        <DevicePolicyComponent />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedDevicePolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Delete'))
    await userEvent.click(await screen.findByText('Delete Policy'))

    await waitForElementToBeRemoved(() => screen.queryAllByText('Edit'))
  })
})
