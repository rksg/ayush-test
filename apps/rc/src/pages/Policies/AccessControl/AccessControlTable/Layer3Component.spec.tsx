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
  aclList,
  enhancedLayer3PolicyListResponse,
  layer3PolicyListResponse,
  layer3Response, networkListResponse
} from '../__tests__/fixtures'

import Layer3Component from './Layer3Component'

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

describe('AccessControlTable - Layer3', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(
          ctx.json(networkListResponse)
        )
      )
    )
  })

  it('should render Layer3Component in AccessControlTable', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(layer3PolicyListResponse)
      )
    ), rest.get(
      AccessControlUrls.getAccessControlProfileList.url,
      (_, res, ctx) => res(
        ctx.json(aclList)
      )
    ), rest.get(
      AccessControlUrls.getL3AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer3Response)
      )
    ))

    render(
      <Provider>
        <Layer3Component />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedLayer3PolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Edit'))
    await screen.findByText('Layer 3 Settings')
    await screen.findByRole('button', {
      name: 'Cancel'
    })
  })

  it('should delete selected row from Layer3Component in AccessControlTable', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(layer3PolicyListResponse)
      )
    ), rest.delete(
      AccessControlUrls.delL3AclPolicies.url,
      (_, res, ctx) => res(
        ctx.json({ requestId: 'requestId1' })
      )
    ), rest.get(
      AccessControlUrls.getAccessControlProfileList.url,
      (_, res, ctx) => res(
        ctx.json(aclList)
      )
    ), rest.get(
      AccessControlUrls.getL3AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer3Response)
      )
    ))

    render(
      <Provider>
        <Layer3Component />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedLayer3PolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Delete'))
    await userEvent.click(await screen.findByText('Delete Policy'))

    await waitForElementToBeRemoved(() => screen.queryAllByText('Edit'))
  })
})
