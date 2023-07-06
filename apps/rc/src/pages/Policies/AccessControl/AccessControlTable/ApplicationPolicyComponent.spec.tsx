import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  AccessControlUrls, CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  aclList, applicationDetail, avcApp, avcCat,
  enhancedApplicationPolicyListResponse, networkListResponse, queryApplication
} from '../__tests__/fixtures'

import ApplicationPolicyComponent from './ApplicationPolicyComponent'


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

describe('AccessControlTable - ApplicationPolicy', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(
          ctx.json(networkListResponse)
        )
      ), rest.post(
        AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => res(
          ctx.json({ requestId: 'requestId1' })
        )
      ), rest.get(
        AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryApplication)
        )
      ), rest.get(
        AccessControlUrls.getAppPolicy.url,
        (_, res, ctx) => res(
          ctx.json(applicationDetail)
        )
      ), rest.get(
        AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(
          ctx.json(avcCat)
        )
      ), rest.get(
        AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(
          ctx.json(avcApp)
        )
      )
    )
  })

  it('should render ApplicationPolicyComponent in AccessControlTable', async () => {
    render(
      <Provider>
        <ApplicationPolicyComponent />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedApplicationPolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Edit'))
    await screen.findByText('Application Access Settings')
    await screen.findByRole('button', {
      name: 'Cancel'
    })
  })

  // eslint-disable-next-line max-len
  it('should delete selected row from ApplicationPolicyComponent in AccessControlTable', async () => {
    mockServer.use(rest.delete(
      AccessControlUrls.delAppAclPolicies.url,
      (_, res, ctx) => res(
        ctx.json({ requestId: 'requestId1' })
      )
    ), rest.get(
      AccessControlUrls.getAccessControlProfileList.url,
      (_, res, ctx) => res(
        ctx.json(aclList)
      )
    ))

    render(
      <Provider>
        <ApplicationPolicyComponent />
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const targetName = enhancedApplicationPolicyListResponse.data[0].name
    await userEvent.click(await screen.findByRole('cell', {
      name: targetName
    }))
    await userEvent.click(await screen.findByText('Delete'))
    await userEvent.click(await screen.findByText('Delete Policy'))
  })
})
