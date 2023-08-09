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
  enhancedLayer2PolicyListResponse,
  layer2PolicyListResponse,
  layer2Response, networkListResponse
} from '../__tests__/fixtures'

import Layer2Component from './Layer2Component'

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

describe('AccessControlTable - Layer2', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedL2AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer2PolicyListResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(
          ctx.json(networkListResponse)
        )
      )
    )
  })

  it('should render Layer2Component in AccessControlTable', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getL2AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(layer2PolicyListResponse)
      )
    ), rest.get(
      AccessControlUrls.getAccessControlProfileList.url,
      (_, res, ctx) => res(
        ctx.json(aclList)
      )
    ), rest.get(
      AccessControlUrls.getL2AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer2Response)
      )
    ))

    render(
      <Provider>
        <Layer2Component />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedLayer2PolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Edit'))
    await screen.findByText('Layer 2 Settings')
    await screen.findByRole('button', {
      name: 'Cancel'
    })
  })

  it('should delete selected row from Layer2Component in AccessControlTable', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getL2AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(layer2PolicyListResponse)
      )
    ), rest.delete(
      AccessControlUrls.delL2AclPolicies.url,
      (_, res, ctx) => res(
        ctx.json({ requestId: 'requestId1' })
      )
    ), rest.get(
      AccessControlUrls.getL2AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer2Response)
      )
    ), rest.get(
      AccessControlUrls.getAccessControlProfileList.url,
      (_, res, ctx) => res(
        ctx.json(aclList)
      )
    ))

    render(
      <Provider>
        <Layer2Component />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedLayer2PolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Delete'))
    await userEvent.click(await screen.findByText('Delete Policy'))

    await waitForElementToBeRemoved(() => screen.queryAllByText('Edit'))
  })
})
